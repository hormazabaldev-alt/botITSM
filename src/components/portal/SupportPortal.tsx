"use client";

import Link from "next/link";
import { MonitorCog } from "lucide-react";
import { AtlasAssistant } from "@/components/chat/AtlasAssistant";

export function SupportPortal() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_28%_12%,rgba(125,211,252,0.24),transparent_30%),radial-gradient(circle_at_78%_28%,rgba(15,23,42,0.08),transparent_26%),linear-gradient(145deg,#f8fbff_0%,#eef6fb_48%,#ffffff_100%)] px-4 py-5">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-40px)] max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="size-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.18)]" />
            <span className="text-sm font-medium text-slate-600">Disponible</span>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm backdrop-blur-xl transition hover:border-cyan-200 hover:text-slate-950"
          >
            <MonitorCog size={14} aria-hidden />
            Admin
          </Link>
        </header>

        <section className="flex flex-1 items-center justify-center py-8">
          <AtlasAssistant />
        </section>
      </div>
    </main>
  );
}
