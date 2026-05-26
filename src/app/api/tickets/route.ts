import { NextResponse } from "next/server";
import type { TicketDraft } from "@/lib/itsm/types";
import { createTicket, listTickets } from "@/services/tickets.repository";

export async function GET() {
  const tickets = await listTickets();
  return NextResponse.json({ tickets });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { ticketDraft?: TicketDraft };

  if (!body.ticketDraft) {
    return NextResponse.json({ error: "ticketDraft requerido" }, { status: 400 });
  }

  const ticket = await createTicket(body.ticketDraft);
  return NextResponse.json({ ticket });
}
