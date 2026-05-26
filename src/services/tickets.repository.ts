import { demoTickets } from "@/lib/data/demoTickets";
import type { Ticket, TicketDraft } from "@/lib/itsm/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const inMemoryTickets: Ticket[] = [...demoTickets];

export async function listTickets(): Promise<Ticket[]> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase.from("tickets").select("*").order("created_at", { ascending: false }).limit(25);

    if (!error && data) {
      return data.map((row) => ({
        ...((row.payload as unknown as TicketDraft) ?? {}),
        id: row.id,
        type: row.type as Ticket["type"],
        priority: row.priority as Ticket["priority"],
        category: row.category,
        description: row.description,
        status: row.status as Ticket["status"],
        createdAt: row.created_at,
        requesterName: ((row.payload as { requesterName?: string })?.requesterName ?? "Usuario demo") as string,
        requesterEmail: ((row.payload as { requesterEmail?: string })?.requesterEmail ?? "pendiente@example.com") as string,
      }));
    }
  }

  return inMemoryTickets;
}

export async function createTicket(draft: TicketDraft): Promise<Ticket> {
  const ticket: Ticket = {
    ...draft,
    id: draft.id ?? createTicketId(),
    status: draft.priority === "P1" || draft.status === "escalated" ? "escalated" : "created",
    createdAt: new Date().toISOString(),
    requesterName: draft.requesterName ?? "Usuario demo pendiente",
    requesterEmail: draft.requesterEmail ?? "pendiente@example.com",
  };

  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { error } = await supabase.from("tickets").insert({
      id: ticket.id,
      type: ticket.type,
      priority: ticket.priority,
      category: ticket.category,
      description: ticket.description,
      status: ticket.status,
      payload: ticket,
    });

    if (!error) return ticket;
  }

  inMemoryTickets.unshift(ticket);
  return ticket;
}

function createTicketId() {
  const now = new Date();
  const datePart = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const sequence = Math.floor(100 + Math.random() * 900);
  return `ITS-${datePart}-${sequence}`;
}
