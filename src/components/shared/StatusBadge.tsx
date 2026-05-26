import type { ReactNode } from "react";

type StatusBadgeProps = {
  children: ReactNode;
  tone?: "slate" | "cyan" | "green" | "amber" | "red" | "violet";
};

const toneClass = {
  slate: "border-slate-200 bg-slate-50 text-slate-600",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  red: "border-rose-200 bg-rose-50 text-rose-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
};

export function StatusBadge({ children, tone = "slate" }: StatusBadgeProps) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${toneClass[tone]}`}>{children}</span>;
}
