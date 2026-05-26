import { NextResponse } from "next/server";
import { findKnowledgeMatches, knowledgeBase } from "@/data/mock/knowledgeBase";
import { createSessionContext, detectTurnIntent, extractFields, isResolvedMessage } from "@/lib/itsm/engine";
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
  const conversationTurns = sessionContext.messages.filter((m) => m.role === "user").length;
  const isResolved = isResolvedMessage(userMessage);

  // ── Determinar si crear ticket ────────────────────────────────────────────
  // Además del flujo normal (shouldCreateTicket = true), registramos:
  // 1. Resolución autónoma del usuario → ticket status "resolved"
  // 2. Conversación con ≥2 turnos y escalación pendiente sin datos completos
  //    → ticket con datos parciales para que no se pierda la conversación
  const shouldForceTicket =
    !llmResponse.shouldCreateTicket &&
    (isResolved ||
      (llmResponse.shouldEscalate && conversationTurns >= 2));

  const draftForTicket = shouldForceTicket
    ? {
        ...llmResponse.ticketDraft,
        status: isResolved ? ("resolved" as const) : ("escalated" as const),
        requesterName: llmResponse.ticketDraft.requesterName?.includes("pendiente")
          ? "Sin identificar"
          : llmResponse.ticketDraft.requesterName,
        requesterEmail: llmResponse.ticketDraft.requesterEmail?.includes("pendiente")
          ? "sin-datos@sonda.cl"
          : llmResponse.ticketDraft.requesterEmail,
      }
    : llmResponse.ticketDraft;

  const fullTranscript = [...sessionContext.messages, userChatMessage, assistantChatMessage];

  const itsmResult = (llmResponse.shouldCreateTicket || shouldForceTicket)
    ? await createTicketThroughITSM({
        draft: draftForTicket,
        sessionId: sessionContext.sessionId,
        transcript: fullTranscript,
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

  // Estado de la sesión según el desenlace del turno
  const sessionOutcome: "resolved" | "escalated" | "active" =
    isResolved ? "resolved"
    : itsmResult ? "escalated"
    : "active";

  const nextContext: SessionContext = {
    ...sessionContext,
    collectedFields: extractFields(userMessage, sessionContext),
    messages: fullTranscript,
    detectedIntent: llmResponse.classification,
    priority: llmResponse.priority,
    activeArticleId: resolveActiveArticleId(llmResponse.ticketDraft.description, knowledgeMatches, sessionContext),
    diagnostic: nextDiagnostic,
    ticketDraft: itsmResult?.ticket ?? llmResponse.ticketDraft,
    stepsExecuted: Array.from(new Set([...sessionContext.stepsExecuted, ...llmResponse.suggestedActions])),
    awaitingResolutionConfirmation: !llmResponse.shouldCreateTicket && !isResolved,
  };

  await persistChatTurn(nextContext, [userChatMessage, assistantChatMessage], sessionOutcome);

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
