import type { ITSMResponse, ITSMResponseInput } from "@/lib/itsm/types";
import { resolveContextualContinuation } from "@/lib/itsm/continuation";
import { generateMercuryITSMResponse, hasMercuryConfig } from "@/lib/llm/mercuryClient";
import { generateMockITSMResponse } from "@/lib/llm/mockClient";

export async function generateITSMResponse(input: ITSMResponseInput): Promise<ITSMResponse> {
  if (isGreetingOnly(input.userMessage)) {
    return generateMockITSMResponse(input);
  }

  const contextualResponse = resolveContextualContinuation(input);
  if (contextualResponse) {
    return contextualResponse;
  }

  if (hasMercuryConfig()) {
    return generateMercuryITSMResponse(input);
  }

  return generateMockITSMResponse(input);
}

function isGreetingOnly(message: string) {
  const text = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return /^(hola|buenas|buenos dias|buenas tardes|buenas noches|hello|hi)[.!¡! ]*$/.test(text);
}
