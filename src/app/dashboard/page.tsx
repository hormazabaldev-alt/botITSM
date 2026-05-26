import Link from "next/link";
import { ArrowLeft, BarChart3, Bot, CheckCircle2, GitBranch } from "lucide-react";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { DistributionChart } from "@/components/dashboard/DistributionChart";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TicketsTable } from "@/components/dashboard/TicketsTable";
import { dashboardKpis, priorityDistribution, ticketTypeDistribution } from "@/lib/data/kpis";
import { listTickets } from "@/services/tickets.repository";

export default async function DashboardPage() {
  const tickets = await listTickets();
  const autonomousResolved = 672;
  const escalated = 312;

  return (
    <>
      <main className="min-h-screen bg-[#f7fbff]">
        <header className="border-b border-[#d7e7f1] bg-white">
          <div className="shell flex min-h-20 flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
            <div>
              <Link
                href="/"
                className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#0d5374] transition hover:text-[#00a8c8]"
              >
                <ArrowLeft size={17} aria-hidden />
                Volver a landing
              </Link>
              <h1 className="text-2xl font-bold text-[#08233f] sm:text-3xl">Dashboard operativo ITSM</h1>
              <p className="mt-1 text-sm text-[#5a7186]">Gobierno, KPIs y trazabilidad de la demo enterprise.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#bfe4ef] bg-[#f0fbfe] px-4 py-2 text-sm font-bold text-[#007d9a]">
              <Bot size={18} aria-hidden />
              Modo mock local
            </div>
          </div>
        </header>

        <section className="shell py-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dashboardKpis.map((kpi) => (
              <MetricCard key={kpi.label} kpi={kpi} />
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_0.8fr]">
            <DistributionChart title="Distribución por tipo" items={ticketTypeDistribution} />
            <DistributionChart title="Distribución por prioridad" items={priorityDistribution} />
            <article className="rounded-[8px] border border-[#d7e7f1] bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-[#08233f]">Resolución y escalamiento</h2>
              <div className="mt-6 grid gap-4">
                <div className="rounded-[8px] bg-[#f0fbf4] p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#047857]">
                    <CheckCircle2 size={18} aria-hidden />
                    Casos resueltos autónomamente
                  </div>
                  <strong className="mt-3 block text-3xl text-[#08233f]">{autonomousResolved}</strong>
                </div>
                <div className="rounded-[8px] bg-[#eef7ff] p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#0d5374]">
                    <GitBranch size={18} aria-hidden />
                    Casos escalados
                  </div>
                  <strong className="mt-3 block text-3xl text-[#08233f]">{escalated}</strong>
                </div>
              </div>
            </article>
          </div>

          <div className="mt-6">
            <TicketsTable tickets={tickets} />
          </div>

          <div className="mt-6 rounded-[8px] border border-[#bfe4ef] bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="grid size-10 place-items-center rounded-[8px] bg-[#dff8fd] text-[#007d9a]">
                <BarChart3 size={20} aria-hidden />
              </span>
              <div>
                <h2 className="text-base font-bold text-[#08233f]">Auditoría operacional</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5a7186]">
                  Cada conversación genera clasificación, prioridad, acciones sugeridas, decisión de cierre o
                  escalamiento y un borrador de ticket. La persistencia está desacoplada para activar Supabase cuando
                  existan variables de entorno.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <ChatWidget />
    </>
  );
}
