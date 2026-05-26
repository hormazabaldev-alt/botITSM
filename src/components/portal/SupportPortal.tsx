"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Cable,
  ChevronRight,
  CircleHelp,
  KeyRound,
  Laptop,
  LockKeyhole,
  MonitorCog,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { CaseConversation } from "@/components/chat/CaseConversation";
import { BrandMark } from "@/components/shared/BrandMark";

const categories = [
  {
    title: "Reportar incidente",
    description: "Servicio degradado, aplicación no disponible o impacto operacional.",
    icon: ShieldCheck,
    prompt: "Quiero reportar un incidente de servicio",
  },
  {
    title: "Solicitar acceso",
    description: "Permisos, carpeta compartida, sistemas o perfil de usuario.",
    icon: KeyRound,
    prompt: "Necesito solicitar acceso a un recurso corporativo",
  },
  {
    title: "Solicitar software",
    description: "Instalación, licencia o aplicación del catálogo autorizado.",
    icon: PackageCheck,
    prompt: "Necesito instalar software autorizado",
  },
  {
    title: "Problema de conectividad",
    description: "VPN, red corporativa, Wi-Fi o acceso remoto.",
    icon: Cable,
    prompt: "Tengo un problema de conectividad o VPN",
  },
  {
    title: "Problema con equipo",
    description: "Notebook lento, periféricos, rendimiento o soporte en terreno.",
    icon: Laptop,
    prompt: "Tengo un problema con mi equipo corporativo",
  },
  {
    title: "Otro requerimiento",
    description: "Derivación guiada cuando la categoría no es evidente.",
    icon: CircleHelp,
    prompt: "Necesito ayuda con otro requerimiento de TI",
  },
];

export function SupportPortal() {
  const [activePrompt, setActivePrompt] = useState<string | undefined>();
  const [freeText, setFreeText] = useState("");

  if (activePrompt) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_36%),linear-gradient(135deg,#f8fbff_0%,#eef6fb_46%,#f7fbff_100%)] px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <PortalHeader />
          <div className="mt-8">
            <CaseConversation initialPrompt={activePrompt} onBack={() => setActivePrompt(undefined)} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_0%,_rgba(14,165,233,0.18),_transparent_34%),radial-gradient(circle_at_80%_10%,_rgba(15,23,42,0.08),_transparent_30%),linear-gradient(135deg,#f8fbff_0%,#eef6fb_52%,#ffffff_100%)] px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <PortalHeader />

        <section className="grid min-h-[calc(100vh-112px)] items-center gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur">
              <BadgeCheck size={14} className="text-cyan-700" aria-hidden />
              Operación TI asistida por inteligencia operacional
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Soporte corporativo con contexto desde el primer contacto.
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Clasificación ITIL, descarte guiado, trazabilidad y escalamiento con la información necesaria para que
              los equipos resolutores actúen sin reprocesos.
            </p>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              {[
                ["91%", "clasificación"],
                ["42s", "respuesta inicial"],
                ["96%", "SLA protegido"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/80 bg-white/72 p-4 shadow-sm backdrop-blur">
                  <p className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">{value}</p>
                  <p className="mt-1 text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white/88 p-4 shadow-2xl shadow-slate-950/10 backdrop-blur-xl sm:p-6">
            <div className="border-b border-slate-200 pb-5">
              <p className="text-sm font-medium text-slate-500">Centro de asistencia</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-slate-950">
                ¿En qué podemos ayudarte hoy?
              </h2>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {categories.map((category) => (
                <button
                  key={category.title}
                  type="button"
                  onClick={() => setActivePrompt(category.prompt)}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-xl hover:shadow-slate-950/8"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-950 group-hover:text-white">
                      <category.icon size={18} aria-hidden />
                    </span>
                    <ChevronRight size={17} className="mt-2 text-slate-300 transition group-hover:text-cyan-600" aria-hidden />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-950">{category.title}</p>
                  <p className="mt-2 text-sm leading-5 text-slate-500">{category.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
              <label htmlFor="free-text" className="sr-only">
                Texto libre
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="free-text"
                  value={freeText}
                  onChange={(event) => setFreeText(event.target.value)}
                  placeholder="Describe brevemente tu solicitud..."
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/70"
                />
                <button
                  type="button"
                  onClick={() => freeText.trim() && setActivePrompt(freeText)}
                  className="h-11 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={!freeText.trim()}
                >
                  Iniciar caso
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function PortalHeader() {
  return (
    <header className="flex h-14 items-center justify-between rounded-2xl border border-white/80 bg-white/70 px-4 shadow-sm backdrop-blur-xl">
      <BrandMark />
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:flex">
          <LockKeyhole size={13} aria-hidden />
          Gobierno activo
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-cyan-300 hover:text-slate-950"
        >
          <MonitorCog size={14} aria-hidden />
          Administración
        </Link>
      </div>
    </header>
  );
}
