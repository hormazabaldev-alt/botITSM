"use client";

import Link from "next/link";
import { MonitorCog } from "lucide-react";
import { AtlasAssistant } from "@/components/chat/AtlasAssistant";

export function SupportPortal() {
  return (
    <main className="relative h-dvh overflow-hidden bg-[radial-gradient(circle_at_50%_18%,rgba(34,211,238,0.12),transparent_30%),linear-gradient(145deg,#020617_0%,#07111f_48%,#0b1220_100%)] px-4 py-4">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:48px_48px] opacity-45 [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      <div className="relative mx-auto flex h-full max-w-6xl flex-col">
        <header className="flex h-10 shrink-0 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="size-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.16),0_0_18px_rgba(52,211,153,0.7)]" />
            <span className="text-sm font-medium text-slate-300">Disponible</span>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-slate-300 shadow-sm backdrop-blur-xl transition hover:border-cyan-300/35 hover:bg-cyan-300/10 hover:text-cyan-50"
          >
            <MonitorCog size={13} aria-hidden />
            Admin
          </Link>
        </header>

        <section className="flex min-h-0 flex-1 items-center justify-center pb-3 pt-1">
          <AtlasAssistant />
        </section>
      </div>
    </main>
  );
}
