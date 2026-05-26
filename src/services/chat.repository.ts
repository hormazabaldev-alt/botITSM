import type { ChatMessage, SessionContext } from "@/lib/itsm/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const inMemoryMessages = new Map<string, ChatMessage[]>();

export async function persistChatTurn(context: SessionContext, messages: ChatMessage[]) {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    await supabase.from("chat_sessions").upsert({
      id: context.sessionId,
      channel: "portal-web",
      status: context.awaitingResolutionConfirmation ? "active" : "open",
    });

    await supabase.from("chat_messages").insert(
      messages.map((message) => ({
        id: message.id,
        session_id: context.sessionId,
        role: message.role,
        content: message.content,
        metadata: message.metadata ?? null,
        created_at: message.createdAt,
      })),
    );

    return;
  }

  const current = inMemoryMessages.get(context.sessionId) ?? [];
  inMemoryMessages.set(context.sessionId, [...current, ...messages]);
}

export async function listSessionMessages(sessionId: string) {
  return inMemoryMessages.get(sessionId) ?? [];
}
