import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { OpenChatButton } from "@/components/landing/OpenChatButton";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#d7e7f1]/80 bg-white/86 backdrop-blur-xl">
      <div className="shell flex h-18 items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[#08233f] text-white shadow-md shadow-cyan-950/20">
            <ShieldCheck size={21} aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold tracking-[0.08em] text-[#08233f] uppercase">
              Agente IA ITSM Enterprise
            </span>
            <span className="block truncate text-xs font-medium text-[#5a7186]">SONDA | Partner Estratégico | Geimser</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-[#35566f] md:flex">
          <a href="#arquitectura" className="transition hover:text-[#00a8c8]">
            Arquitectura
          </a>
          <a href="#kpis" className="transition hover:text-[#00a8c8]">
            KPIs
          </a>
          <Link href="/dashboard" className="transition hover:text-[#00a8c8]">
            Dashboard
          </Link>
        </nav>

        <div className="hidden sm:block">
          <OpenChatButton label="Probar agente" />
        </div>
      </div>
    </header>
  );
}
