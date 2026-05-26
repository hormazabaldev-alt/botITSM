import { Boxes } from "lucide-react";

export function BrandMark({ compact = false, variant = "light" }: { compact?: boolean; variant?: "light" | "dark" }) {
  const titleClass = variant === "dark" ? "text-white" : "text-slate-950";
  const subtitleClass = variant === "dark" ? "text-slate-400" : "text-slate-500";

  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded-lg border border-sky-200/70 bg-white/85 text-slate-900 shadow-sm">
        <Boxes size={18} aria-hidden />
      </span>
      {!compact ? (
        <div>
          <p className={`text-sm font-semibold tracking-[-0.01em] ${titleClass}`}>Portal de soporte inteligente</p>
          <p className={`text-xs ${subtitleClass}`}>SONDA | Partner Estratégico | Geimser</p>
        </div>
      ) : null}
    </div>
  );
}
