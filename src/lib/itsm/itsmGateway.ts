import { demoITSMAdapter } from "@/lib/itsm/adapters/demoAdapter";
import type { ITSMAdapter, ITSMCreateTicketInput, ITSMCreateTicketResult, ITSMProvider } from "@/lib/itsm/adapters/types";

const adapters: Record<ITSMProvider, ITSMAdapter | undefined> = {
  demo: demoITSMAdapter,
  servicenow: undefined,
  "jira-service-management": undefined,
  freshservice: undefined,
  glpi: undefined,
};

export async function createTicketThroughITSM(input: ITSMCreateTicketInput): Promise<ITSMCreateTicketResult> {
  const adapter = resolveAdapter();
  return adapter.createTicket(input);
}

export function resolveAdapter() {
  const provider = resolveProvider();
  return adapters[provider] ?? demoITSMAdapter;
}

function resolveProvider(): ITSMProvider {
  const configured = process.env.ITSM_PROVIDER?.trim().toLowerCase();

  if (
    configured === "servicenow" ||
    configured === "jira-service-management" ||
    configured === "freshservice" ||
    configured === "glpi"
  ) {
    return configured;
  }

  return "demo";
}
