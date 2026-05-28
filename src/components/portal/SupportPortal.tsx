"use client";

import Link from "next/link";
import {
  Bell,
  CalendarDays,
  Cloud,
  Folder,
  HardDrive,
  LayoutDashboard,
  Search,
  Settings,
  TerminalSquare,
  Wifi,
} from "lucide-react";
import { SondaAssistant } from "@/components/chat/AtlasAssistant";
import { SondaLogo } from "@/components/shared/BrandMark";

const desktopShortcuts = [
  { label: "Mesa TI", icon: LayoutDashboard, color: "#55F4FF" },
  { label: "Tickets", icon: Folder, color: "#F9C74F" },
  { label: "Inventario", icon: HardDrive, color: "#A7F3D0" },
];

const dockApps = [
  { label: "Finder", icon: Folder, color: "#60A5FA" },
  { label: "Terminal", icon: TerminalSquare, color: "#CBD5E1" },
  { label: "Ajustes", icon: Settings, color: "#94A3B8" },
  { label: "Buscar", icon: Search, color: "#F472B6" },
];

export function SupportPortal() {
  return (
    <main className="mac-desktop" aria-label="Escritorio SONDA">
      <div className="mac-wallpaper" aria-hidden />

      <header className="mac-menu-bar">
        <div className="mac-menu-left">
          <SondaLogo width={92} />
          <span>Service Desk</span>
          <span>Archivo</span>
          <span>Soporte</span>
        </div>
        <div className="mac-menu-right">
          <Wifi size={15} aria-hidden />
          <Cloud size={15} aria-hidden />
          <Bell size={15} aria-hidden />
          <span>Jue 28 May</span>
          <span>09:41</span>
        </div>
      </header>

      <aside className="mac-desktop-icons" aria-label="Accesos del escritorio">
        {desktopShortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <button key={shortcut.label} type="button" className="mac-desktop-icon">
              <span style={{ color: shortcut.color }}>
                <Icon size={25} aria-hidden />
              </span>
              <span>{shortcut.label}</span>
            </button>
          );
        })}
      </aside>

      <section className="mac-window" aria-label="Panel de contexto de soporte">
        <div className="mac-window-titlebar">
          <div className="mac-traffic-lights" aria-hidden>
            <span style={{ background: "#FF5F57" }} />
            <span style={{ background: "#FFBD2E" }} />
            <span style={{ background: "#28C840" }} />
          </div>
          <div className="mac-window-title">SONDA Support Console</div>
          <CalendarDays size={16} aria-hidden />
        </div>

        <div className="mac-window-content">
          <div className="mac-window-copy">
            <p className="mac-kicker">Entorno demo corporativo</p>
            <h1>Escritorio de soporte TI SONDA</h1>
            <p>
              Simulación de puesto de trabajo con accesos, estado operacional y asistente disponible
              como widget de ayuda en tiempo real.
            </p>
          </div>

          <div className="mac-status-grid" aria-label="Estado operacional">
            <article>
              <span>Casos activos</span>
              <strong>24</strong>
              <small>7 en atención</small>
            </article>
            <article>
              <span>SLA promedio</span>
              <strong>96%</strong>
              <small>últimas 24 h</small>
            </article>
            <article>
              <span>Servicios</span>
              <strong>OK</strong>
              <small>sin incidentes P1</small>
            </article>
          </div>
        </div>
      </section>

      <nav className="mac-dock" aria-label="Dock del escritorio">
        {dockApps.map((app) => {
          const Icon = app.icon;
          return (
            <button key={app.label} type="button" className="mac-dock-item" title={app.label}>
              <Icon size={24} style={{ color: app.color }} aria-hidden />
            </button>
          );
        })}
        <Link href="/admin" className="mac-dock-item" title="Panel Admin" aria-label="Panel Admin">
          <LayoutDashboard size={24} style={{ color: "#55F4FF" }} aria-hidden />
        </Link>
      </nav>

      <div className="chat-corner-anchor">
        <SondaAssistant />
      </div>
    </main>
  );
}
