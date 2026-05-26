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
import type { ITSMIntent, ITSMResponse, ITSMResponseInput, SessionContext } from "@/lib/itsm/types";

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

  if (isGreetingOnly(input.userMessage)) {
    return {
      assistantMessage: "Hola. ¿Qué necesitas resolver?",
      classification: detectedIntent,
      priority,
      requiredFields: [],
      suggestedActions: ["Esperar descripción del caso"],
      operationalStatuses: ["Detectando intención"],
      shouldCreateTicket: false,
      shouldEscalate: false,
      ticketDraft,
    };
  }

  if (isResolvedMessage(input.userMessage)) {
    return {
      assistantMessage:
        "Perfecto, lo dejo cerrado. Si vuelve a ocurrir, escríbeme el sistema afectado y el mensaje de error.",
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
    assistantMessage: buildOperationalMessage({
      intent: detectedIntent,
      message: input.userMessage,
      context: input.sessionContext,
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

function buildOperationalMessage({
  intent,
  message,
  context,
  requiredFields,
  shouldCreateTicket,
}: {
  intent: ITSMIntent;
  message: string;
  context: SessionContext;
  requiredFields: string[];
  shouldCreateTicket: boolean;
}) {
  if (shouldCreateTicket) {
    return [
      "Entendido. Lo dejo listo para derivar con el contexto actual.",
      requiredFields.length ? `Confírmame solo esto: ${requiredFields.join(", ")}.` : "Te aviso el siguiente paso apenas quede registrado.",
    ].join("\n\n");
  }

  const hardwareFlow = buildHardwareFlowMessage(message, context);
  if (intent === "HARDWARE_ISSUE" && hardwareFlow) {
    return hardwareFlow;
  }

  const introByIntent: Record<ITSMIntent, string> = {
    INCIDENT: "Te ayudo. Necesito ubicar el impacto.",
    SERVICE_REQUEST: "Te ayudo. Revisemos lo mínimo para gestionarlo.",
    ACCESS_REQUEST: "Te ayudo con el acceso.",
    SOFTWARE_REQUEST: "Te ayudo con la instalación.",
    HARDWARE_ISSUE: "Te ayudo. Aislemos la causa.",
    NETWORK_ISSUE: "Te ayudo con la conectividad.",
    SECURITY_INCIDENT: "Lo tomo con prioridad. Evita hacer cambios por ahora.",
    HUMAN_ESCALATION: "Puedo derivarlo con contexto.",
  };

  const questionsByIntent: Record<ITSMIntent, string> = {
    INCIDENT: "¿Qué sistema falla y afecta solo a tu usuario o a más personas?",
    SERVICE_REQUEST: "Cuéntame qué necesitas resolver.",
    ACCESS_REQUEST: "¿A qué sistema o carpeta necesitas entrar y ya está aprobado?",
    SOFTWARE_REQUEST: "¿Qué software necesitas y en qué equipo?",
    HARDWARE_ISSUE: "¿Desde cuándo pasa y afecta todo el equipo o una app?",
    NETWORK_ISSUE: "¿Estás por VPN, Wi-Fi o cable, y qué error aparece?",
    SECURITY_INCIDENT: "¿Qué viste y qué servicio está afectado?",
    HUMAN_ESCALATION: "¿Qué debe revisar soporte y qué tan urgente es?",
  };

  return [
    introByIntent[intent],
    questionsByIntent[intent],
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildHardwareFlowMessage(message: string, context: SessionContext) {
  const current = normalizeText(message);
  const history = context.messages
    .filter((item) => item.role === "user")
    .map((item) => normalizeText(item.content));
  const allUserText = [...history, current].join(" ");
  const asset = hardwareAsset(allUserText);
  const connection = connectionType(allUserText);
  const askedConnection = context.messages.some((item) => {
    const content = normalizeText(item.content);
    return item.role === "assistant" && content.includes("usb") && content.includes("inalambrico");
  });
  const askedPortTest = context.messages.some((item) => item.role === "assistant" && normalizeText(item.content).includes("otro puerto usb"));
  const askedReplacementTest = context.messages.some((item) => item.role === "assistant" && normalizeText(item.content).includes("otro mouse"));

  if (!asset) {
    return undefined;
  }

  if (mentionsNoDetection(current) && askedPortTest) {
    return [
      "Con ese resultado, el descarte apunta al periférico o al puerto USB.",
      "Prueba otro mouse en el mismo equipo. ¿Ese otro mouse funciona?",
    ].join("\n\n");
  }

  if (mentionsReplacementWorks(current) && askedReplacementTest) {
    return [
      "Entonces el equipo y el puerto quedan operativos; el problema queda aislado al mouse original.",
      "Corresponde preparar reemplazo. Confírmame tu nombre, correo y área para dejar el caso con el descarte completo.",
    ].join("\n\n");
  }

  if (connection === "wired" && askedConnection) {
    return [
      `Perfecto, queda como ${hardwareAssetLabel(asset)} cableado.`,
      "Siguiente descarte: conéctalo directo a otro puerto USB, sin hub ni adaptador. ¿Enciende o el equipo muestra algún aviso al conectarlo?",
    ].join("\n\n");
  }

  if (connection === "wireless" && askedConnection) {
    return [
      `Perfecto, queda como ${hardwareAssetLabel(asset)} inalámbrico.`,
      "Cambia la batería o carga, reconecta el receptor USB y prueba emparejarlo nuevamente. ¿El equipo lo detecta después de eso?",
    ].join("\n\n");
  }

  if (asset === "mouse") {
    return "Entendido: mouse con falla.\n\nPrimero validemos conexión. ¿Es USB/cableado o inalámbrico?";
  }

  if (asset === "keyboard") {
    return "Entendido: teclado con falla.\n\nPrimero validemos conexión. ¿Es USB/cableado o inalámbrico?";
  }

  if (asset === "monitor") {
    return "Entendido: pantalla o monitor con falla.\n\n¿El monitor enciende y el cable queda firme al equipo?";
  }

  if (asset === "printer") {
    return "Entendido: impresora con falla.\n\n¿Aparece conectada y muestra algún mensaje de error?";
  }

  return undefined;
}

function hardwareAsset(text: string) {
  if (text.includes("mouse") || text.includes("raton")) return "mouse";
  if (text.includes("teclado")) return "keyboard";
  if (text.includes("monitor") || text.includes("pantalla")) return "monitor";
  if (text.includes("impresora")) return "printer";
  return undefined;
}

function hardwareAssetLabel(asset: string) {
  const labels: Record<string, string> = {
    mouse: "mouse",
    keyboard: "teclado",
    monitor: "monitor",
    printer: "impresora",
  };

  return labels[asset] ?? "periférico";
}

function connectionType(text: string) {
  if (hasAnyText(text, ["cable", "cableado", "usb", "se ocupa con cable", "con cable"])) return "wired";
  if (hasAnyText(text, ["inalambrico", "bluetooth", "wireless", "receptor", "pila", "bateria"])) return "wireless";
  return undefined;
}

function mentionsNoDetection(text: string) {
  return hasAnyText(text, ["no enciende", "no prende", "no detecta", "no aparece", "nada", "sigue igual", "no funciona"]);
}

function mentionsReplacementWorks(text: string) {
  return hasAnyText(text, ["otro mouse funciona", "otro si funciona", "otro sí funciona", "con otro funciona", "el otro funciona"]);
}

function hasAnyText(value: string, terms: string[]) {
  return terms.some((term) => value.includes(normalizeText(term)));
}

function normalizeText(message: string) {
  return message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function isGreetingOnly(message: string) {
  const text = normalizeText(message);
  return /^(hola|buenas|buenos dias|buenas tardes|buenas noches|hello|hi)[.!¡! ]*$/.test(text);
}
