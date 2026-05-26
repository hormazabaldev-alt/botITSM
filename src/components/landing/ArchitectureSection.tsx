import { Bot, Cable, Database, Lock, MessagesSquare, Network, ScanSearch } from "lucide-react";

const layers = [
  { title: "Canales", text: "Web, Teams, WhatsApp corporativo, portal interno.", icon: MessagesSquare },
  { title: "Núcleo IA", text: "Clasificación, intención, prioridad y guía conversacional.", icon: Bot },
  { title: "Contexto", text: "Usuario, activo, sistema, impacto, urgencia y conocimiento.", icon: Database },
  { title: "Motor operacional", text: "Reglas ITIL, SLAs, resolución L1 y decisión de escalamiento.", icon: ScanSearch },
  { title: "Autoatención", text: "Flujos guiados para incidentes y requerimientos recurrentes.", icon: Network },
  { title: "Integración ITSM", text: "Preparado para ServiceNow, Jira, GLPI, Freshservice o Aranda.", icon: Cable },
  { title: "Gobierno y seguridad", text: "Auditoría, trazabilidad, datos mínimos y derivación segura.", icon: Lock },
];

export function ArchitectureSection() {
  return (
    <section id="arquitectura" className="bg-[#f7fbff] py-22">
      <div className="shell">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#00a8c8]">Arquitectura preparada</p>
          <h2 className="mt-3 text-3xl font-bold text-[#08233f] sm:text-4xl">Middleware operacional, no chatbot genérico</h2>
          <p className="mt-4 text-base leading-7 text-[#5a7186]">
            La demo separa presentación, motor ITIL, conocimiento, repositorios, LLM adapter y rutas API internas para
            permitir una conexión posterior limpia con Supabase, Mercury/Inception y plataformas ITSM reales.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {layers.map((layer, index) => (
            <article
              key={layer.title}
              className="relative rounded-[8px] border border-[#d7e7f1] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#9bd9e8] hover:shadow-lg lg:col-span-1"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-[8px] bg-[#08233f] text-white">
                  <layer.icon size={19} aria-hidden />
                </span>
                <span className="font-mono text-xs font-bold text-[#00a8c8]">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="text-base font-bold text-[#08233f]">{layer.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#5a7186]">{layer.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
