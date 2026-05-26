import { findKnowledgeMatches } from "@/data/mock/knowledgeBase";
import {
  buildTicketDraft,
  detectIntent,
  determinePriority,
  extractFields,
  getMissingFields,
  isResolvedMessage,
  shouldCreateTicketFromMessage,
} from "@/lib/itsm/engine";
import type { ITSMIntent, ITSMResponse, ITSMResponseInput, KnowledgeArticle, SessionContext } from "@/lib/itsm/types";

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
        "Perfecto, lo dejo cerrado. Me alegra que haya quedado operativo. Si vuelve a ocurrir, escríbeme con el mensaje de error o el sistema afectado y lo retomamos con contexto.",
      classification: detectedIntent,
      priority,
      requiredFields: [],
      suggestedActions: ["Registrar cierre autónomo", "Actualizar base de conocimiento si aplica"],
      operationalStatuses: ["Detectando intención", "Consultando base de conocimiento", "Cerrando caso"],
      shouldCreateTicket: false,
      shouldEscalate: false,
      ticketDraft: { ...ticketDraft, status: "resolved" },
    };
  }

  return {
    assistantMessage: buildConciergeMessage({
      intent: detectedIntent,
      article,
      requiredFields,
      shouldCreateTicket,
    }),
    classification: detectedIntent,
    priority,
    requiredFields,
    suggestedActions: article?.resolutionSteps ?? ["Recopilar contexto", "Clasificar prioridad", "Escalar si persiste"],
    operationalStatuses: shouldCreateTicket
      ? ["Detectando intención", "Consultando base de conocimiento", "Preparando ticket"]
      : ["Detectando intención", "Consultando base de conocimiento", "Ejecutando guía de descarte"],
    shouldCreateTicket,
    shouldEscalate,
    ticketDraft,
  };
}

function buildConciergeMessage({
  intent,
  article,
  requiredFields,
  shouldCreateTicket,
}: {
  intent: ITSMIntent;
  article?: KnowledgeArticle;
  requiredFields: string[];
  shouldCreateTicket: boolean;
}) {
  if (shouldCreateTicket) {
    return [
      "Entiendo. Para no hacerte repetir información, voy a dejar el caso registrado con el contexto que ya reunimos.",
      "Lo derivaré al equipo correspondiente y mantendré el resumen operativo con las acciones ya revisadas.",
    ].join("\n\n");
  }

  const introByIntent: Record<ITSMIntent, string> = {
    INCIDENT: "Hugo, te ayudo. Primero necesito dimensionar el impacto para actuar con la prioridad correcta.",
    SERVICE_REQUEST: "Hugo, te ayudo. Revisemos lo necesario para gestionar tu solicitud sin vueltas.",
    ACCESS_REQUEST: "Hugo, te ayudo con el acceso. Necesito validar algunos datos mínimos para orientarlo bien.",
    SOFTWARE_REQUEST: "Hugo, te ayudo con la instalación. Revisemos si corresponde a software autorizado y qué equipo usas.",
    HARDWARE_ISSUE: "Hugo, te ayudo. Veamos si podemos aislar la causa antes de escalarlo.",
    NETWORK_ISSUE: "Hugo, te ayudo con la conectividad. Revisemos lo básico para saber si es tu equipo, la red o el servicio.",
    SECURITY_INCIDENT: "Hugo, lo tomo con prioridad. Evitemos hacer cambios hasta preservar el contexto del incidente.",
    HUMAN_ESCALATION: "Hugo, puedo derivarlo a soporte humano con contexto, pero antes reuniré lo mínimo para que no partan desde cero.",
  };

  const questionsByIntent: Record<ITSMIntent, string[]> = {
    INCIDENT: ["¿Afecta solo a tu usuario o a más personas?", "¿Qué sistema o aplicación está impactado?"],
    SERVICE_REQUEST: ["¿Para qué área o proceso lo necesitas?", "¿Hay alguna fecha límite asociada?"],
    ACCESS_REQUEST: ["¿A qué sistema, carpeta o recurso necesitas entrar?", "¿Tu jefatura o dueño del recurso ya lo aprobó?"],
    SOFTWARE_REQUEST: ["¿Qué software necesitas instalar?", "¿Es para tu equipo corporativo o para otro activo?"],
    HARDWARE_ISSUE: ["¿Desde cuándo notas el problema?", "¿Ocurre con todo el equipo o con una aplicación puntual?"],
    NETWORK_ISSUE: ["¿Estás conectado por VPN, Wi-Fi o red cableada?", "¿Te aparece algún mensaje de error?"],
    SECURITY_INCIDENT: ["¿Qué señal te hizo sospechar del incidente?", "¿Afecta correo, equipo, archivos o una aplicación?"],
    HUMAN_ESCALATION: ["¿Qué necesitas que revise soporte?", "¿Hay algún impacto urgente para tu trabajo?"],
  };

  const guide = article?.resolutionSteps.slice(0, 2).map((step) => `• ${step}`).join("\n");
  const fieldHint = requiredFields.length ? `\n\nSi esto persiste, después te pediré solo: ${requiredFields.join(", ")}.` : "";

  return [
    introByIntent[intent],
    questionsByIntent[intent].join("\n"),
    guide ? `\nMientras me respondes, puedes revisar esto:\n${guide}` : "",
    fieldHint,
  ]
    .filter(Boolean)
    .join("\n\n");
}
