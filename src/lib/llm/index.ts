import type { ITSMResponse, ITSMResponseInput } from "@/lib/itsm/types";
import { generateMercuryITSMResponse, hasMercuryConfig } from "@/lib/llm/mercuryClient";
import { generateMockITSMResponse } from "@/lib/llm/mockClient";

export async function generateITSMResponse(input: ITSMResponseInput): Promise<ITSMResponse> {
  if (hasMercuryConfig()) {
    return generateMercuryITSMResponse(input);
  }

  return generateMockITSMResponse(input);
}
