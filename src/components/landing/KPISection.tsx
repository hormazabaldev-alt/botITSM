import { landingKpis } from "@/lib/data/kpis";

const toneMap = {
  blue: "text-[#08233f] bg-[#eef7ff]",
  cyan: "text-[#007d9a] bg-[#dff8fd]",
  green: "text-[#047857] bg-[#e7f8ef]",
  amber: "text-[#a15c00] bg-[#fff4df]",
};

export function KPISection() {
  return (
    <section id="kpis" className="bg-white py-20">
      <div className="shell">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#00a8c8]">KPIs de demo</p>
            <h2 className="mt-3 text-3xl font-bold text-[#08233f] sm:text-4xl">Gobierno medible desde el primer flujo</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#5a7186]">
            Métricas simuladas para presentar impacto operacional, contención L1 y calidad de escalamiento.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {landingKpis.map((kpi) => (
            <article key={kpi.label} className="metric-gradient rounded-[8px] border border-[#d7e7f1] p-6">
              <p className="text-sm font-semibold text-[#5a7186]">{kpi.label}</p>
              <strong className="mt-4 block text-4xl font-bold text-[#08233f]">{kpi.value}</strong>
              <span className={`mt-5 inline-flex rounded-full px-3 py-1 text-xs font-bold ${toneMap[kpi.tone]}`}>
                {kpi.delta}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
