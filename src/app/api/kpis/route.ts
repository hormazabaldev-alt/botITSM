import { NextResponse } from "next/server";
import { dashboardKpis, landingKpis, priorityDistribution, ticketTypeDistribution } from "@/lib/data/kpis";
import { listTickets } from "@/services/tickets.repository";

export async function GET() {
  const tickets = await listTickets();

  return NextResponse.json({
    landingKpis,
    dashboardKpis,
    ticketTypeDistribution,
    priorityDistribution,
    recentTickets: tickets.slice(0, 10),
  });
}
