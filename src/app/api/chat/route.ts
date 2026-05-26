import { NextResponse } from "next/server";
import { findKnowledgeMatches, knowledgeBase } from "@/data/mock/knowledgeBase";
import { createSessionContext, detectTurnIntent, extractFields } from "@/lib/itsm/engine";
import { createTicketThroughITSM } from "@/lib/itsm/itsmGateway";
import type { ChatMessage, SessionContext } from "@/lib/itsm/types";
import { generateITSMResponse } from "@/lib/llm";
import { getPersistedSessionContext, persistChatTurn } from "@/services/chat.repository";

type ChatRequest = {
  userMessage: string;
  sessionContext?: SessionContext;
  sessionId?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ChatRequest;
  const userMessage = body.userMessage?.trim();

  if (!userMessage) {
    return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
  }

  const sessionContext = body.sessionContext ?? (body.sessionId ? await getPersistedSessionContext(body.sessionId) : undefined) ?? createSessionContext();
  const detectedIntent = detectTurnIntent(userMessage, sessionContext);
  const knowledgeMatches = findKnowledgeMatches(userMessage, detectedIntent);
  const llmResponse = await generateITSMResponse({
    userMessage,
    sessionContext,
    detectedIntent,
    knowledgeMatches,
    ticketDraft: sessionContext.ticketDraft,
  });

  const now = new Date().toISOString();
  const userChatMessage: ChatMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content: userMessage,
    createdAt: now,
  };
  const assistantChatMessage: ChatMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: llmResponse.assistantMessage,
    createdAt: new Date().toISOString(),
    metadata: {
      intent: llmResponse.classification,
      priority: llmResponse.priority,
    },
  };
  const diagnosticForTurn = llmResponse.diagnostic ?? sessionContext.diagnostic;
  const itsmResult = llmResponse.shouldCreateTicket
    ? await createTicketThroughITSM({
        draft: llmResponse.ticketDraft,
        sessionId: sessionContext.sessionId,
        transcript: [...sessionContext.messages, userChatMessage, assistantChatMessage],
        diagnostic: diagnosticForTurn,
        source: "web-demo",
      })
    : undefined;

  if (itsmResult) {
    assistantChatMessage.metadata = {
      ...assistantChatMessage.metadata,
      ticketId: itsmResult.ticket.id,
    };
  }
  const nextDiagnostic = itsmResult && diagnosticForTurn
    ? {
        ...diagnosticForTurn,
        stage: "ticket_created" as const,
        facts: {
          ...diagnosticForTurn.facts,
          ticketCreated: true,
          ticketId: itsmResult.ticket.id,
          itsmProvider: itsmResult.provider,
        },
        completedSteps: Array.from(new Set([...diagnosticForTurn.completedSteps, "Ticket creado en ITSM"])),
        updatedAt: new Date().toISOString(),
      }
    : diagnosticForTurn;

  const nextContext: SessionContext = {
    ...sessionContext,
    collectedFields: extractFields(userMessage, sessionContext),
    messages: [...sessionContext.messages, userChatMessage, assistantChatMessage],
    detectedIntent: llmResponse.classification,
    priority: llmResponse.priority,
    activeArticleId: resolveActiveArticleId(llmResponse.ticketDraft.description, knowledgeMatches, sessionContext),
    diagnostic: nextDiagnostic,
    ticketDraft: itsmResult?.ticket ?? llmResponse.ticketDraft,
    stepsExecuted: Array.from(new Set([...sessionContext.stepsExecuted, ...llmResponse.suggestedActions])),
    awaitingResolutionConfirmation: !llmResponse.shouldCreateTicket,
  };

  await persistChatTurn(nextContext, [userChatMessage, assistantChatMessage]);

  return NextResponse.json({
    response: llmResponse,
    ticket: itsmResult?.ticket,
    itsm: itsmResult
      ? {
          provider: itsmResult.provider,
          mode: itsmResult.mode,
          externalId: itsmResult.externalId,
          externalUrl: itsmResult.externalUrl,
        }
      : undefined,
    sessionContext: nextContext,
    knowledgeMatches,
  });
}

function resolveActiveArticleId(
  ticketDescription: string,
  knowledgeMatches: ReturnType<typeof findKnowledgeMatches>,
  sessionContext: SessionContext,
) {
  const referencedArticle = knowledgeBase.find((article) => ticketDescription.includes(`Referencia KB: ${article.title}`));
  if (referencedArticle && referencedArticle.id === sessionContext.activeArticleId) {
    return referencedArticle.id;
  }

  if (sessionContext.activeArticleId && !referencesKnowledgeArticle(ticketDescription)) {
    return sessionContext.activeArticleId;
  }

  return referencedArticle?.id ?? knowledgeMatches[0]?.id ?? sessionContext.activeArticleId;
}

function referencesKnowledgeArticle(ticketDescription: string) {
  return ticketDescription.includes("Referencia KB:");
}
