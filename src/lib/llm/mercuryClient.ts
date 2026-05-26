import { itsmSystemPrompt } from "@/lib/llm/prompts/itsmSystemPrompt";
import { generateMockITSMResponse } from "@/lib/llm/mockClient";
import type { ITSMResponse, ITSMResponseInput } from "@/lib/itsm/types";

type MercuryPayload = ITSMResponseInput & {
  systemPrompt: string;
};

export function hasMercuryConfig() {
  return Boolean(process.env.MERCURY_API_KEY && process.env.MERCURY_BASE_URL);
}

export async function generateMercuryITSMResponse(input: ITSMResponseInput): Promise<ITSMResponse> {
  if (!hasMercuryConfig()) {
    return generateMockITSMResponse(input);
  }

  const payload: MercuryPayload = {
    ...input,
    systemPrompt: itsmSystemPrompt,
  };

  const response = await fetch(`${process.env.MERCURY_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MERCURY_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.MERCURY_MODEL ?? "inception-itsm-enterprise",
      messages: [
        { role: "system", content: itsmSystemPrompt },
        { role: "user", content: JSON.stringify(payload) },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    return generateMockITSMResponse(input);
  }

  try {
    return (await response.json()) as ITSMResponse;
  } catch {
    return generateMockITSMResponse(input);
  }
}
