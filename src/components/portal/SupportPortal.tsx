"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Activity, MonitorCog, Network, ServerCog } from "lucide-react";
import { AtlasAssistant } from "@/components/chat/AtlasAssistant";

export function SupportPortal() {
  return (
    <main className="relative h-dvh overflow-hidden bg-[radial-gradient(circle_at_24%_12%,rgba(34,211,238,0.18),transparent_27%),radial-gradient(circle_at_76%_26%,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_50%_92%,rgba(20,184,166,0.1),transparent_30%),linear-gradient(145deg,#020617_0%,#08111f_46%,#0f172a_100%)] px-4 py-4">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:44px_44px] opacity-70 [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
      <div className="pointer-events-none absolute left-1/2 top-[52%] h-[560px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-[48px] border border-cyan-100/10 bg-white/[0.035] shadow-[0_40px_140px_rgba(34,211,238,0.08)]" />
      <div className="pointer-events-none absolute left-1/2 top-[52%] h-[360px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-28 mx-auto hidden max-w-5xl justify-between px-8 text-slate-400/65 lg:flex">
        <div className="grid gap-3">
          <StatusPill icon={<ServerCog size={15} aria-hidden />} label="Core services" />
          <StatusPill icon={<Network size={15} aria-hidden />} label="Network" />
        </div>
        <div className="grid gap-3 pt-14">
          <StatusPill icon={<Activity size={15} aria-hidden />} label="Operations" />
          <StatusPill icon={<MonitorCog size={15} aria-hidden />} label="Workplace" />
        </div>
      </div>

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

function StatusPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 text-xs font-medium text-slate-300 shadow-sm backdrop-blur-xl">
      {icon}
      {label}
    </div>
  );
}
