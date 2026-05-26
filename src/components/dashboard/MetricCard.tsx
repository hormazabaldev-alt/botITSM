import type { KPI } from "@/lib/itsm/types";

const toneMap = {
  blue: "border-[#cfe2f2] bg-[#f4faff] text-[#08233f]",
  cyan: "border-[#bfe4ef] bg-[#f0fbfe] text-[#007d9a]",
  green: "border-[#c7ecd7] bg-[#f0fbf4] text-[#047857]",
  amber: "border-[#f5d6a3] bg-[#fff8eb] text-[#a15c00]",
};

export function MetricCard({ kpi }: { kpi: KPI }) {
  return (
    <article className="rounded-[8px] border border-[#d7e7f1] bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-[#5a7186]">{kpi.label}</p>
      <strong className="mt-3 block text-3xl font-bold text-[#08233f]">{kpi.value}</strong>
      <span className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${toneMap[kpi.tone]}`}>
        {kpi.delta}
      </span>
    </article>
  );
}
