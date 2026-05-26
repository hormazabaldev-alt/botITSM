"use client";

import Link from "next/link";
import { MonitorCog, Signal } from "lucide-react";
import { AtlasAssistant } from "@/components/chat/AtlasAssistant";
import { AtlasHexLogo } from "@/components/shared/BrandMark";

export function SupportPortal() {
  return (
    <main className="relative h-dvh overflow-hidden sonda-topo-bg">
      {/* Líneas de cuadrícula muy sutiles */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(27,61,140,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(27,61,140,0.07) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)",
        }}
      />

      {/* Borde ámbar superior — acento corporativo */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent 0%, #F59E0B 40%, #FCD34D 60%, transparent 100%)" }}
      />

      <div className="relative mx-auto flex h-full max-w-6xl flex-col px-5 py-4">
        {/* ── Header ── */}
        <header className="flex h-12 shrink-0 items-center justify-between">
          {/* Marca SONDA */}
          <div className="flex items-center gap-3">
            <AtlasHexLogo size={32} />
            <div className="flex flex-col justify-center">
              <span
                className="text-[13px] font-bold leading-tight tracking-[-0.02em]"
                style={{ color: "#EEF2FF" }}
              >
                Atlas
                <span className="mx-1.5 font-semibold opacity-50">·</span>
                <span className="font-semibold opacity-70">SONDA</span>
              </span>
              <span
                className="text-[10px] font-medium tracking-[0.06em] uppercase"
                style={{ color: "#4A6091" }}
              >
                Soporte Inteligente
              </span>
            </div>
          </div>

          {/* Estado del sistema + link admin */}
          <div className="flex items-center gap-3">
            {/* Indicador en línea */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border px-2.5 py-1"
              style={{ borderColor: "rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.06)" }}
            >
              <Signal size={11} style={{ color: "#10B981" }} />
              <span className="text-[11px] font-medium" style={{ color: "#6EE7B7" }}>
                Disponible
              </span>
            </div>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all duration-200"
              style={{
                borderColor: "rgba(245,158,11,0.22)",
                background: "rgba(245,158,11,0.06)",
                color: "#FCD34D",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.14)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,158,11,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.06)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,158,11,0.22)";
              }}
            >
              <MonitorCog size={12} aria-hidden />
              Panel Admin
            </Link>
          </div>
        </header>

        {/* ── Área central con el chatbot ── */}
        <section className="flex min-h-0 flex-1 items-center justify-center pb-4 pt-2">
          {/* Texto de bienvenida lateral (solo desktop) */}
          <div className="hidden lg:flex flex-col gap-4 mr-10 max-w-xs flex-shrink-0">
            <div>
              <h1
                className="text-3xl font-bold leading-tight tracking-[-0.03em]"
                style={{ color: "#EEF2FF" }}
              >
                Soporte TI
                <br />
                <span style={{ color: "#F59E0B" }}>sin esperas</span>
              </h1>
              <p
                className="mt-3 text-sm leading-relaxed"
                style={{ color: "#8DA0C4" }}
              >
                Atlas gestiona tu caso, aplica guías ITIL y escala al equipo
                correcto con todo el contexto ya cargado.
              </p>
            </div>

            {/* Pills de capacidad */}
            <div className="flex flex-wrap gap-2">
              {["Incidentes", "Requerimientos", "Accesos", "Hardware", "Software"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                  style={{
                    borderColor: "rgba(27,61,140,0.5)",
                    background: "rgba(27,61,140,0.15)",
                    color: "#8DA0C4",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Separador */}
            <div
              className="h-px w-16"
              style={{ background: "linear-gradient(90deg, #F59E0B, transparent)" }}
            />

            <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: "#4A6091" }}>
              Basado en ITIL v4 · IA generativa
            </p>
          </div>

          {/* Widget de chat */}
          <AtlasAssistant />
        </section>

        {/* ── Footer ── */}
        <footer className="flex h-8 shrink-0 items-center justify-between text-[10px]" style={{ color: "#4A6091" }}>
          <span>© 2026 SONDA S.A. · Todos los derechos reservados</span>
          <span className="hidden sm:block">Atlas v2.0 · ITIL v4 Compliant</span>
        </footer>
      </div>
    </main>
  );
}
