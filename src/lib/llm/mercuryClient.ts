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

    const parsed = JSON.parse(extractJson(content)) as Partial<ITSMResponse>;

    if (!isITSMResponse(parsed)) {
      return generateMockITSMResponse(input);
    }

    return parsed;
  } catch {
    return generateMockITSMResponse(input);
  }
}

function extractJson(content: string) {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  if (fenced) return fenced.trim();

  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return content.slice(firstBrace, lastBrace + 1);
  }

  return content;
}

function isITSMResponse(value: Partial<ITSMResponse>): value is ITSMResponse {
  return (
    typeof value.assistantMessage === "string" &&
    typeof value.classification === "string" &&
    typeof value.priority === "string" &&
    Array.isArray(value.requiredFields) &&
    Array.isArray(value.suggestedActions) &&
    Array.isArray(value.operationalStatuses) &&
    typeof value.shouldCreateTicket === "boolean" &&
    typeof value.shouldEscalate === "boolean" &&
    typeof value.ticketDraft === "object" &&
    value.ticketDraft !== null
  );
}
