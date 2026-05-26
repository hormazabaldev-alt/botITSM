import { ClipboardCheck, GitBranch, Headphones, ShieldCheck } from "lucide-react";

const values = [
  {
    title: "Reducción de carga Nivel 1",
    description: "Contención de consultas repetitivas con guías operativas, clasificación inicial y cierre asistido.",
    icon: Headphones,
  },
  {
    title: "Resolución autónoma",
    description: "Flujos de descarte seguros para correo, VPN, software, accesos y puesto de trabajo.",
    icon: ClipboardCheck,
  },
  {
    title: "Escalamiento con contexto",
    description: "Ticket simulado con impacto, urgencia, pasos ejecutados, grupo resolutor y SLA estimado.",
    icon: GitBranch,
  },
  {
    title: "Gobierno y trazabilidad",
    description: "Eventos, decisiones y criterios de prioridad listos para auditoría operacional.",
    icon: ShieldCheck,
  },
];

export function ValueCards() {
  return (
    <section className="bg-white py-20">
      <div className="shell grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {values.map((value) => (
          <article
            key={value.title}
            className="group rounded-[8px] border border-[#d7e7f1] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/10"
          >
            <div className="mb-6 grid size-12 place-items-center rounded-[8px] bg-[#dff8fd] text-[#007d9a] transition group-hover:bg-[#08233f] group-hover:text-white">
              <value.icon size={23} aria-hidden />
            </div>
            <h2 className="text-lg font-bold text-[#08233f]">{value.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#5a7186]">{value.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
