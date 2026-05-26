import { findKnowledgeMatches } from "@/data/mock/knowledgeBase";
import {
  buildTicketDraft,
  detectIntent,
  determinePriority,
  extractFields,
  getMissingFields,
  intentLabel,
  isResolvedMessage,
  priorityLabel,
  shouldCreateTicketFromMessage,
} from "@/lib/itsm/engine";
import type { ITSMResponse, ITSMResponseInput, SessionContext } from "@/lib/itsm/types";

export async function generateMockITSMResponse(input: ITSMResponseInput): Promise<ITSMResponse> {
  const mergedContext: SessionContext = {
    ...input.sessionContext,
    collectedFields: extractFields(input.userMessage, input.sessionContext),
  };
  const detectedIntent = input.detectedIntent ?? detectIntent(input.userMessage);
  const priority = determinePriority(input.userMessage, detectedIntent, mergedContext);
  const knowledgeMatches = input.knowledgeMatches.length
    ? input.knowledgeMatches
    : findKnowledgeMatches(input.userMessage, detectedIntent);
  const article = knowledgeMatches[0];
  const requiredFields = getMissingFields(mergedContext, priority);
  const ticketDraft = buildTicketDraft({
    message: input.userMessage,
    intent: detectedIntent,
    priority,
    article,
    context: mergedContext,
  });
  const shouldEscalate =
    priority === "P1" || detectedIntent === "SECURITY_INCIDENT" || shouldCreateTicketFromMessage(input.userMessage, priority, detectedIntent);
  const shouldCreateTicket = shouldEscalate && !isResolvedMessage(input.userMessage);

  if (isResolvedMessage(input.userMessage)) {
    return {
      assistantMessage:
        "Caso cerrado. Registro la resolución autónoma con trazabilidad: clasificación, guía aplicada y confirmación del usuario. No se generará ticket porque indicaste que el servicio quedó operativo.",
      classification: detectedIntent,
      priority,
      requiredFields: [],
      suggestedActions: ["Registrar cierre autónomo", "Medir contención L1", "Actualizar base de conocimiento si aplica"],
      operationalStatuses: ["Detectando intención", "Clasificando según ITIL", "Cerrando caso"],
      shouldCreateTicket: false,
      shouldEscalate: false,
      ticketDraft: { ...ticketDraft, status: "resolved" },
    };
  }

  const guide = article
    ? `Guía aplicada: ${article.title}\n${article.resolutionSteps.map((step, index) => `${index + 1}. ${step}`).join("\n")}`
    : "No encontré un artículo exacto. Prepararé una clasificación operativa y pediré solo los datos mínimos para resolver o escalar con contexto.";

  const missingData = requiredFields.length
    ? `\n\nPara dejar el caso listo si no se resuelve, necesito: ${requiredFields.join(", ")}.`
    : "\n\nYa tengo los datos mínimos para preparar el ticket si la guía no resuelve.";

  const escalationNote =
    priority === "P1"
      ? "\n\nLa criticidad detectada requiere escalamiento inmediato con seguimiento ejecutivo."
      : "\n\nEjecuta la guía y dime si quedó resuelto. Si persiste, registraré el caso con el contexto completo.";

  return {
    assistantMessage: `Clasificación ITIL: ${intentLabel(detectedIntent)} | Prioridad ${priorityLabel(priority)}.\n\n${guide}${missingData}${escalationNote}`,
    classification: detectedIntent,
    priority,
    requiredFields,
    suggestedActions: article?.resolutionSteps ?? ["Recopilar contexto", "Clasificar prioridad", "Escalar si persiste"],
    operationalStatuses: shouldCreateTicket
      ? [
          "Detectando intención",
          "Clasificando según ITIL",
          "Consultando base de conocimiento",
          "Ejecutando guía de descarte",
          "Preparando ticket",
        ]
      : ["Detectando intención", "Clasificando según ITIL", "Consultando base de conocimiento", "Ejecutando guía de descarte"],
    shouldCreateTicket,
    shouldEscalate,
    ticketDraft,
  };
}
