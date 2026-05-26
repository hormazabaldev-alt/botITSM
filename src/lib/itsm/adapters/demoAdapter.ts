import { createTicket } from "@/services/tickets.repository";
import type { ITSMAdapter, ITSMCreateTicketInput, ITSMCreateTicketResult } from "@/lib/itsm/adapters/types";

export const demoITSMAdapter: ITSMAdapter = {
  provider: "demo",
  mode: "demo",
  async createTicket(input: ITSMCreateTicketInput): Promise<ITSMCreateTicketResult> {
    const ticket = await createTicket({
      ...input.draft,
      description: buildTicketDescription(input),
    });

    return {
      provider: "demo",
      mode: "demo",
      ticket,
      externalId: ticket.id,
    };
  },
};

function buildTicketDescription(input: ITSMCreateTicketInput) {
  const userSummary = input.transcript
    .filter((message) => message.role === "user")
    .slice(-6)
    .map((message) => `Usuario: ${message.content}`)
    .join(" | ");
  const diagnosticSummary = input.diagnostic
    ? [
        `Playbook: ${input.diagnostic.playbookId}`,
        `Etapa: ${input.diagnostic.stage}`,
        `Activo: ${input.diagnostic.asset}`,
        `Hechos: ${formatFacts(input.diagnostic.facts)}`,
      ].join(" | ")
    : undefined;

  return [input.draft.description, diagnosticSummary, userSummary ? `Contexto conversación: ${userSummary}` : undefined]
    .filter(Boolean)
    .join(" | ");
}

function formatFacts(facts: Record<string, unknown>) {
  return Object.entries(facts ?? {})
    .filter(([, value]) => value === true || typeof value === "string")
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");
}
