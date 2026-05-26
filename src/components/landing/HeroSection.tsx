import Image from "next/image";
import { Activity, ArrowRight, CheckCircle2, LockKeyhole, Workflow } from "lucide-react";
import { OpenChatButton } from "@/components/landing/OpenChatButton";

const trustSignals = [
  { icon: Activity, label: "Clasificación ITIL en línea" },
  { icon: Workflow, label: "Middleware operacional" },
  { icon: LockKeyhole, label: "Gobierno y trazabilidad" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#f7fbff]">
      <div className="absolute inset-0">
        <Image
          src="/enterprise-ops-visual.png"
          alt="Centro operacional ITSM con paneles de clasificación, trazabilidad y métricas"
          fill
          priority
          className="object-cover object-center opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f7fbff] via-[#f7fbff]/88 to-[#f7fbff]/38" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f7fbff] to-transparent" />
      </div>

      <div className="shell relative grid min-h-[calc(100vh-72px)] grid-cols-1 items-center gap-10 py-16 lg:grid-cols-[0.98fr_1.02fr]">
        <div className="max-w-3xl">
          <div className="mb-7 inline-flex max-w-full items-center gap-2 rounded-full border border-[#bfe4ef] bg-white/86 px-4 py-2 text-xs font-bold tracking-[0.08em] text-[#0d5374] uppercase shadow-sm">
            SONDA | Partner Estratégico | Geimser
          </div>
          <h1 className="text-balance text-4xl font-bold leading-[1.02] text-[#08233f] sm:text-5xl lg:text-6xl">
            IA operacional para resolver, clasificar y escalar servicios TI en tiempo real.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#35566f]">
            Una capa inteligente para mesa de ayuda enterprise: reduce carga Nivel 1, aplica lógica ITIL, documenta
            trazabilidad y prepara integraciones futuras con plataformas ITSM reales.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <OpenChatButton />
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#b7d8e8] bg-white/88 px-5 py-3 text-sm font-semibold text-[#08233f] transition hover:-translate-y-0.5 hover:border-[#00b8d9]"
            >
              Ver dashboard operativo
              <ArrowRight size={18} aria-hidden />
            </a>
          </div>
          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {trustSignals.map((signal) => (
              <div key={signal.label} className="flex items-center gap-2 text-sm font-semibold text-[#35566f]">
                <span className="grid size-8 place-items-center rounded-lg bg-[#dff8fd] text-[#007d9a]">
                  <signal.icon size={16} aria-hidden />
                </span>
                {signal.label}
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex justify-end">
          <div className="enterprise-card w-full max-w-md rounded-[8px] p-5">
            <div className="flex items-center justify-between border-b border-[#d7e7f1] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#00a8c8]">Operación ITSM</p>
                <h2 className="mt-1 text-xl font-bold text-[#08233f]">Ciclo de resolución</h2>
              </div>
              <CheckCircle2 className="text-[#00a878]" size={28} aria-hidden />
            </div>
            <div className="mt-5 space-y-4">
              {["Detectar intención", "Clasificar prioridad", "Consultar conocimiento", "Resolver o escalar"].map(
                (item, index) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#08233f] text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="h-3 flex-1 rounded-full bg-[#dff8fd]">
                      <div
                        className="h-3 rounded-full bg-[#00b8d9]"
                        style={{ width: `${92 - index * 12}%` }}
                      />
                    </div>
                    <span className="w-36 text-sm font-semibold text-[#35566f]">{item}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
