import type { ChatMessage } from "@/lib/itsm/types";

export type ServiceDeskAsset =
  | "mouse"
  | "keyboard"
  | "external_monitor"
  | "notebook_display"
  | "printer"
  | "notebook";

type ServiceDeskQualifier = "wired" | "wireless" | "external" | "internal";
type ServiceDeskSymptom = "not_working" | "no_power" | "no_image" | "flicker" | "dim" | "visual_artifact";
type PlaybookStage = "identify_asset" | "qualify_connection" | "run_first_check" | "isolate_component" | "prepare_escalation";

export type ServiceDeskTurn = {
  asset: ServiceDeskAsset;
  qualifier?: ServiceDeskQualifier;
  symptoms: ServiceDeskSymptom[];
  playbookId: string;
  stage: PlaybookStage;
  response: string;
  suggestedActions: string[];
};

type ServiceDeskPlaybook = {
  id: string;
  assets: ServiceDeskAsset[];
  knowledgeArticleId: string;
  firstQuestion: (asset: ServiceDeskAsset) => string;
};

const playbooks: ServiceDeskPlaybook[] = [
  {
    id: "workplace-peripheral-usb",
    assets: ["mouse", "keyboard"],
    knowledgeArticleId: "kb-wired-peripheral",
    firstQuestion: (asset) => `Entendido: ${assetLabel(asset)} con falla.\n\nPrimero validemos conexión. ¿Es USB/cableado o inalámbrico?`,
  },
  {
    id: "workplace-display-external",
    assets: ["external_monitor"],
    knowledgeArticleId: "kb-external-display",
    firstQuestion: () => "Entendido: monitor externo con falla.\n\n¿El monitor enciende y el cable queda firme al equipo?",
  },
  {
    id: "workplace-display-integrated",
    assets: ["notebook_display"],
    knowledgeArticleId: "kb-notebook-display",
    firstQuestion: () =>
      "Entendido: pantalla integrada del notebook.\n\n¿La pantalla queda negra, parpadea, muestra líneas/manchas o solo se ve con poco brillo?",
  },
  {
    id: "workplace-printer",
    assets: ["printer"],
    knowledgeArticleId: "kb-printer-basic",
    firstQuestion: () => "Entendido: impresora con falla.\n\n¿Aparece conectada y muestra algún mensaje de error?",
  },
];

export function resolveServiceDeskTurn(message: string, history: ChatMessage[]): ServiceDeskTurn | undefined {
  const current = normalizeText(message);
  const userHistory = history.filter((item) => item.role === "user").map((item) => normalizeText(item.content));
  const assistantHistory = history.filter((item) => item.role === "assistant").map((item) => normalizeText(item.content));
  const allUserText = [...userHistory, current].join(" ");
  const asset = resolveAsset(current, allUserText);

  if (!asset) {
    return undefined;
  }

  const qualifier = resolveQualifier(allUserText, asset);
  const symptoms = resolveSymptoms(allUserText);
  const playbook = resolvePlaybook(asset);

  if (!playbook) {
    return undefined;
  }

  if (asset === "notebook_display") {
    return resolveNotebookDisplayTurn({ current, assistantHistory, playbook, symptoms });
  }

  if (asset === "external_monitor") {
    return resolveExternalMonitorTurn({ current, assistantHistory, playbook, symptoms });
  }

  if (asset === "mouse" || asset === "keyboard") {
    return resolvePeripheralTurn({ asset, qualifier, current, assistantHistory, playbook, symptoms });
  }

  return {
    asset,
    qualifier,
    symptoms,
    playbookId: playbook.id,
    stage: "identify_asset",
    response: playbook.firstQuestion(asset),
    suggestedActions: [`Playbook ${playbook.id}: identificar activo`],
  };
}

function resolvePeripheralTurn(params: {
  asset: ServiceDeskAsset;
  qualifier?: ServiceDeskQualifier;
  current: string;
  assistantHistory: string[];
  playbook: ServiceDeskPlaybook;
  symptoms: ServiceDeskSymptom[];
}): ServiceDeskTurn {
  const { asset, qualifier, current, assistantHistory, playbook, symptoms } = params;
  const askedConnection = assistantHistory.some((content) => content.includes("usb") && content.includes("inalambrico"));
  const askedPortTest = assistantHistory.some((content) => content.includes("otro puerto usb"));
  const askedReplacementTest = assistantHistory.some((content) => content.includes(`otro ${assetLabel(asset)}`));

  if (mentionsReplacementWorks(current) && askedReplacementTest) {
    return {
      asset,
      qualifier,
      symptoms,
      playbookId: playbook.id,
      stage: "prepare_escalation",
      response: [
        `Entonces el equipo y el puerto quedan operativos; el problema queda aislado al ${assetLabel(asset)} original.`,
        "Corresponde preparar reemplazo. Confírmame tu nombre, correo y área para dejar el caso con el descarte completo.",
      ].join("\n\n"),
      suggestedActions: [`Playbook ${playbook.id}: preparar reemplazo con descarte completo`],
    };
  }

  if (mentionsNoDetection(current) && askedPortTest) {
    return {
      asset,
      qualifier,
      symptoms,
      playbookId: playbook.id,
      stage: "isolate_component",
      response: [
        "Con ese resultado, el descarte apunta al periférico o al puerto USB.",
        `Prueba otro ${assetLabel(asset)} en el mismo equipo. ¿Ese otro ${assetLabel(asset)} funciona?`,
      ].join("\n\n"),
      suggestedActions: [`Playbook ${playbook.id}: aislar periférico versus puerto`],
    };
  }

  if (qualifier === "wired" && askedConnection) {
    return {
      asset,
      qualifier,
      symptoms,
      playbookId: playbook.id,
      stage: "run_first_check",
      response: [
        `Perfecto, queda como ${assetLabel(asset)} cableado.`,
        "Siguiente descarte: conéctalo directo a otro puerto USB, sin hub ni adaptador. ¿Enciende o el equipo muestra algún aviso al conectarlo?",
      ].join("\n\n"),
      suggestedActions: [`Playbook ${playbook.id}: probar puerto USB directo`],
    };
  }

  if (qualifier === "wireless" && askedConnection) {
    return {
      asset,
      qualifier,
      symptoms,
      playbookId: playbook.id,
      stage: "run_first_check",
      response: [
        `Perfecto, queda como ${assetLabel(asset)} inalámbrico.`,
        "Cambia la batería o carga, reconecta el receptor USB y prueba emparejarlo nuevamente. ¿El equipo lo detecta después de eso?",
      ].join("\n\n"),
      suggestedActions: [`Playbook ${playbook.id}: validar energía y receptor inalámbrico`],
    };
  }

  return {
    asset,
    qualifier,
    symptoms,
    playbookId: playbook.id,
    stage: "qualify_connection",
    response: playbook.firstQuestion(asset),
    suggestedActions: [`Playbook ${playbook.id}: calificar tipo de conexión`],
  };
}

function resolveNotebookDisplayTurn(params: {
  current: string;
  assistantHistory: string[];
  playbook: ServiceDeskPlaybook;
  symptoms: ServiceDeskSymptom[];
}): ServiceDeskTurn {
  const { assistantHistory, playbook, symptoms } = params;
  const askedSymptom = assistantHistory.some((content) => content.includes("pantalla integrada") && content.includes("queda negra"));

  if (askedSymptom) {
    return {
      asset: "notebook_display",
      qualifier: "internal",
      symptoms,
      playbookId: playbook.id,
      stage: "run_first_check",
      response: [
        "Bien, sigo con pantalla integrada del notebook.",
        "Sube el brillo, conecta el cargador y reinicia el equipo. ¿Se ve imagen durante el arranque?",
      ].join("\n\n"),
      suggestedActions: [`Playbook ${playbook.id}: validar brillo, energía y arranque`],
    };
  }

  return {
    asset: "notebook_display",
    qualifier: "internal",
    symptoms,
    playbookId: playbook.id,
    stage: "identify_asset",
    response: playbook.firstQuestion("notebook_display"),
    suggestedActions: [`Playbook ${playbook.id}: confirmar síntoma de pantalla integrada`],
  };
}

function resolveExternalMonitorTurn(params: {
  current: string;
  assistantHistory: string[];
  playbook: ServiceDeskPlaybook;
  symptoms: ServiceDeskSymptom[];
}): ServiceDeskTurn {
  const { current, playbook, symptoms } = params;

  if (mentionsInternalDisplay(current)) {
    return resolveNotebookDisplayTurn({
      current,
      assistantHistory: [],
      playbook: playbooks.find((item) => item.id === "workplace-display-integrated")!,
      symptoms,
    });
  }

  return {
    asset: "external_monitor",
    qualifier: "external",
    symptoms,
    playbookId: playbook.id,
    stage: "run_first_check",
    response: playbook.firstQuestion("external_monitor"),
    suggestedActions: [`Playbook ${playbook.id}: validar energía y cable de monitor externo`],
  };
}

function resolveAsset(current: string, allUserText: string): ServiceDeskAsset | undefined {
  if (mentionsInternalDisplay(current) || mentionsInternalDisplay(allUserText)) return "notebook_display";
  if (current.includes("mouse") || allUserText.includes("mouse") || allUserText.includes("raton")) return "mouse";
  if (current.includes("teclado") || allUserText.includes("teclado")) return "keyboard";
  if (current.includes("impresora") || allUserText.includes("impresora")) return "printer";
  if (current.includes("monitor") || allUserText.includes("monitor") || hasAnyText(current, ["pantalla externa", "segunda pantalla"])) return "external_monitor";
  if (current.includes("notebook") || current.includes("note") || current.includes("laptop")) return "notebook";
  return undefined;
}

function resolveQualifier(text: string, asset: ServiceDeskAsset): ServiceDeskQualifier | undefined {
  if (asset === "notebook_display") return "internal";
  if (asset === "external_monitor") return "external";
  if (hasAnyText(text, ["cable", "cableado", "usb", "se ocupa con cable", "con cable"])) return "wired";
  if (hasAnyText(text, ["inalambrico", "bluetooth", "wireless", "receptor", "pila", "bateria"])) return "wireless";
  return undefined;
}

function resolveSymptoms(text: string): ServiceDeskSymptom[] {
  const symptoms = new Set<ServiceDeskSymptom>();
  if (hasAnyText(text, ["no funciona", "falla", "problema"])) symptoms.add("not_working");
  if (hasAnyText(text, ["no enciende", "no prende", "sin energia"])) symptoms.add("no_power");
  if (hasAnyText(text, ["negra", "sin imagen", "no da imagen"])) symptoms.add("no_image");
  if (hasAnyText(text, ["parpadea", "intermitente"])) symptoms.add("flicker");
  if (hasAnyText(text, ["brillo", "oscura", "poco brillo"])) symptoms.add("dim");
  if (hasAnyText(text, ["lineas", "linea", "manchas", "mancha"])) symptoms.add("visual_artifact");
  return Array.from(symptoms);
}

function resolvePlaybook(asset: ServiceDeskAsset) {
  return playbooks.find((playbook) => playbook.assets.includes(asset));
}

function assetLabel(asset: ServiceDeskAsset) {
  const labels: Record<ServiceDeskAsset, string> = {
    mouse: "mouse",
    keyboard: "teclado",
    external_monitor: "monitor",
    notebook_display: "pantalla integrada del notebook",
    printer: "impresora",
    notebook: "notebook",
  };

  return labels[asset];
}

function mentionsNoDetection(text: string) {
  return hasAnyText(text, ["no enciende", "no prende", "no detecta", "no aparece", "nada", "sigue igual", "no funciona"]);
}

function mentionsReplacementWorks(text: string) {
  return hasAnyText(text, ["otro mouse funciona", "otro si funciona", "otro sí funciona", "con otro funciona", "el otro funciona"]);
}

function mentionsInternalDisplay(text: string) {
  return (
    hasAnyText(text, ["pantalla de mi note", "pantalla del note", "pantalla de mi notebook", "pantalla del notebook", "pantalla integrada", "pantalla de laptop"]) ||
    ((text.includes("pantalla") || text.includes("display")) && hasAnyText(text, ["note", "notebook", "laptop"]))
  );
}

function hasAnyText(value: string, terms: string[]) {
  return terms.some((term) => value.includes(normalizeText(term)));
}

function normalizeText(message: string) {
  return message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
