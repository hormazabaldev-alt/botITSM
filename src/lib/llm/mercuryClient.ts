import { itsmSystemPrompt } from "@/lib/llm/prompts/itsmSystemPrompt";
import { generateMockITSMResponse } from "@/lib/llm/mockClient";
import type { ITSMResponse, ITSMResponseInput } from "@/lib/itsm/types";

type MercuryPayload = ITSMResponseInput & {
  systemPrompt: string;
};

type InceptionChatCompletion = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
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

  const baseUrl = process.env.MERCURY_BASE_URL!.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MERCURY_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.MERCURY_MODEL ?? "mercury-2",
      messages: [
        { role: "system", content: itsmSystemPrompt },
        {
          role: "user",
          content: `Analiza este caso ITSM y responde exclusivamente un JSON válido con la forma ITSMResponse, sin markdown:\n${JSON.stringify(payload)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    return generateMockITSMResponse(input);
  }

  try {
    const completion = (await response.json()) as InceptionChatCompletion;
    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      return generateMockITSMResponse(input);
    }

    return JSON.parse(content) as ITSMResponse;
  } catch {
    return generateMockITSMResponse(input);
  }
}
