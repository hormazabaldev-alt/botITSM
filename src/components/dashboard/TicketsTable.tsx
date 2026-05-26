import type { Ticket } from "@/lib/itsm/types";

const priorityClass = {
  P1: "bg-[#fff0f0] text-[#b42318]",
  P2: "bg-[#fff8eb] text-[#a15c00]",
  P3: "bg-[#eef7ff] text-[#0d5374]",
  P4: "bg-[#f0fbf4] text-[#047857]",
};

export function TicketsTable({ tickets }: { tickets: Ticket[] }) {
  return (
    <article className="overflow-hidden rounded-[8px] border border-[#d7e7f1] bg-white shadow-sm">
      <div className="border-b border-[#d7e7f1] p-5">
        <h2 className="text-base font-bold text-[#08233f]">Últimos tickets</h2>
        <p className="mt-1 text-sm text-[#5a7186]">Casos simulados listos para reemplazo por integración ITSM real.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-[#f7fbff] text-xs uppercase tracking-[0.08em] text-[#5a7186]">
            <tr>
              <th className="px-5 py-3 font-bold">ID</th>
              <th className="px-5 py-3 font-bold">Tipo</th>
              <th className="px-5 py-3 font-bold">Prioridad</th>
              <th className="px-5 py-3 font-bold">Categoría</th>
              <th className="px-5 py-3 font-bold">Asignación</th>
              <th className="px-5 py-3 font-bold">SLA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf4f8]">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="transition hover:bg-[#f7fbff]">
                <td className="px-5 py-4 font-mono font-bold text-[#08233f]">{ticket.id}</td>
                <td className="px-5 py-4 font-semibold text-[#35566f]">{ticket.type}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${priorityClass[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-5 py-4 text-[#35566f]">{ticket.category}</td>
                <td className="px-5 py-4 text-[#35566f]">{ticket.assignedTeam}</td>
                <td className="px-5 py-4 text-[#35566f]">{ticket.estimatedSla}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
