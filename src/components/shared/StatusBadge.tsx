import type { ReactNode } from "react";

type StatusBadgeProps = {
  children: ReactNode;
  tone?: "slate" | "cyan" | "green" | "amber" | "red" | "violet";
};

const toneClass = {
  slate: "border-white/10 bg-white/[0.055] text-slate-300",
  cyan: "border-cyan-300/18 bg-cyan-300/[0.08] text-cyan-100",
  green: "border-emerald-300/16 bg-emerald-300/[0.075] text-emerald-100",
  amber: "border-amber-300/18 bg-amber-300/[0.08] text-amber-100",
  red: "border-rose-300/20 bg-rose-300/[0.085] text-rose-100",
  violet: "border-violet-300/18 bg-violet-300/[0.08] text-violet-100",
};

export function StatusBadge({ children, tone = "slate" }: StatusBadgeProps) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneClass[tone]}`}>{children}</span>;
}
