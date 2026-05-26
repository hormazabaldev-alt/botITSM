"use client";

import type { ReactNode } from "react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  Gauge,
  KeyRound,
  LockKeyhole,
  MessageSquareText,
  Settings,
  ShieldAlert,
  Ticket,
  UsersRound,
  Zap,
} from "lucide-react";
import { BrandMark, AtlasHexLogo } from "@/components/shared/BrandMark";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  listOperationalCasesSync as listOperationalCases,
} from "@/services/operations.repository";
import type { Ticket as ITSMDemoTicket } from "@/lib/itsm/types";
import type { AdminKpi, ChartPoint, OperationalCase } from "@/types/operational";

export function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }

  return <AdminWorkspace />;
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const demoUser = "admin";
  const demoPassword = "sonda2026demo";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (user.trim().toLowerCase() === demoUser && (password === demoPassword || password === "demo")) {
      setError("");
      onSuccess();
      return;
    }
    setError("Credenciales no válidas para el panel.");
  }

  function enterDemo() {
    setUser(demoUser);
    setPassword(demoPassword);
    setError("");
    onSuccess();
  }

  return (
    <main
      className="grid min-h-screen place-items-center px-4 py-8"
      style={{
        background: "radial-gradient(ellipse 70% 50% at 20% 0%, rgba(27,61,140,0.3), transparent 50%), linear-gradient(150deg, #070E1C 0%, #0C1629 50%, #070E1C 100%)",
        color: "#EEF2FF",
      }}
    >
      {/* Borde ámbar superior */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #F59E0B 40%, #FCD34D 60%, transparent)" }} />

      <section
        className="w-full max-w-md rounded-3xl p-6 backdrop-blur-2xl"
        style={{
          background: "rgba(17,31,58,0.92)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 32px 80px rgba(4,8,20,0.7), 0 0 0 1px rgba(245,158,11,0.06) inset",
        }}
      >
        <BrandMark variant="dark" />
        <div className="mt-8">
          <div
            className="mb-5 grid size-12 place-items-center rounded-2xl"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
          >
            <LockKeyhole size={22} style={{ color: "#FCD34D" }} aria-hidden />
          </div>
          <h1 className="text-2xl font-bold tracking-[-0.025em]" style={{ color: "#EEF2FF" }}>Consola operacional</h1>
          <p className="mt-2 text-sm leading-6" style={{ color: "#8DA0C4" }}>
            Acceso restringido · Monitoreo, gobierno y seguimiento de casos ITSM.
          </p>
        </div>

        <div
          className="mt-6 rounded-2xl p-4"
          style={{ border: "1px solid rgba(245,158,11,0.18)", background: "rgba(245,158,11,0.06)" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="grid size-9 shrink-0 place-items-center rounded-xl"
              style={{ background: "rgba(245,158,11,0.1)", color: "#FCD34D" }}
            >
              <KeyRound size={17} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold" style={{ color: "#EEF2FF" }}>Credenciales de demostración</p>
              <div className="mt-3 grid gap-2 text-sm">
                <CredentialLine label="Usuario" value={demoUser} />
                <CredentialLine label="Clave" value={demoPassword} />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={enterDemo}
            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
              color: "#070E1C",
              boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
            }}
          >
            Ingresar como demo
            <ChevronRight size={16} aria-hidden />
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label
              className="text-xs font-bold uppercase tracking-[0.12em]"
              htmlFor="admin-user"
              style={{ color: "#4A6091" }}
            >
              Usuario
            </label>
            <input
              id="admin-user"
              value={user}
              onChange={(event) => setUser(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl px-3 text-sm outline-none transition-all duration-200"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                color: "#EEF2FF",
              }}
              autoComplete="username"
            />
          </div>
          <div>
            <label
              className="text-xs font-bold uppercase tracking-[0.12em]"
              htmlFor="admin-password"
              style={{ color: "#4A6091" }}
            >
              Clave
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl px-3 text-sm outline-none transition-all duration-200"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                color: "#EEF2FF",
              }}
              autoComplete="current-password"
            />
          </div>
          {error ? <p className="text-sm" style={{ color: "#FCA5A5" }}>{error}</p> : null}
          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #1B3D8C 0%, #142F6E 100%)",
              border: "1px solid rgba(27,61,140,0.6)",
              color: "#EEF2FF",
            }}
          >
            Ingresar
            <ChevronRight size={16} aria-hidden />
          </button>
        </form>
      </section>
    </main>
  );
}

function CredentialLine({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2"
      style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(7,14,28,0.4)" }}
    >
      <span className="text-xs font-medium uppercase tracking-[0.12em]" style={{ color: "#4A6091" }}>{label}</span>
      <span className="font-data text-xs font-semibold" style={{ color: "#FCD34D" }}>{value}</span>
    </div>
  );
}

function kpiValue(kpis: AdminKpi[], label: string) {
  return kpis.find((kpi) => kpi.label === label)?.value ?? "-";
}

function ticketToOperationalCase(ticket: ITSMDemoTicket): OperationalCase {
  const duration = Math.max(1, Math.round((Date.now() - new Date(ticket.createdAt).getTime()) / 60000));
  const escalated = ticket.status === "escalated" || ticket.status === "created";

  return {
    id: ticket.id,
    user_name: ticket.requesterName,
    department: ticket.businessArea ?? "Área pendiente",
    issue_type: ticket.type,
    category: ticket.category,
    priority: ticket.priority,
    status: ticketStatusToCaseStatus(ticket.status),
    created_at: ticket.createdAt,
    resolved_at: ticket.status === "resolved" ? ticket.createdAt : null,
    resolution_type: ticket.status === "resolved" ? "Autónoma" : escalated ? "Escalada" : "Pendiente",
    escalated,
    assigned_technician: ticket.assignedTeam,
    sentiment: ticket.priority === "P1" ? "Crítico" : escalated ? "Tenso" : "Neutral",
    conversation_summary: ticket.description,
    sla_minutes: slaMinutes(ticket.priority),
    duration_minutes: duration,
    knowledge_article: extractKnowledgeArticle(ticket.description),
  };
}

function mergeOperationalCases(realCases: OperationalCase[], mockCases: OperationalCase[]) {
  const seen = new Set(realCases.map((item) => item.id));
  return [...realCases, ...mockCases.filter((item) => !seen.has(item.id))]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 100);
}

function ticketStatusToCaseStatus(status: ITSMDemoTicket["status"]): OperationalCase["status"] {
  if (status === "resolved") return "Resuelto";
  if (status === "escalated" || status === "created") return "Escalado";
  return "En diagnóstico";
}

function slaMinutes(priority: ITSMDemoTicket["priority"]) {
  const minutes: Record<ITSMDemoTicket["priority"], number> = {
    P1: 240,
    P2: 480,
    P3: 1440,
    P4: 4320,
  };

  return minutes[priority];
}

function extractKnowledgeArticle(description: string) {
  return description.match(/Referencia KB:\s*([^|]+)/)?.[1]?.trim() ?? description.match(/Playbook:\s*([^|]+)/)?.[1]?.trim() ?? "Diagnóstico conversacional";
}

function buildAdminKpis(cases: OperationalCase[]): AdminKpi[] {
  const total = Math.max(cases.length, 1);
  const generatedTickets = cases.filter((item) => item.status !== "Resuelto" || item.escalated).length;
  const autonomous = cases.filter((item) => item.resolution_type === "Autónoma").length;
  const escalated = cases.filter((item) => item.escalated).length;
  const criticalActive = cases.filter((item) => item.priority === "P1" && item.status !== "Resuelto").length;
  const resolved = cases.filter((item) => item.status === "Resuelto");
  const avgResolution = resolved.length
    ? Math.round(resolved.reduce((sum, item) => sum + item.duration_minutes, 0) / resolved.length)
    : Math.round(cases.reduce((sum, item) => sum + item.duration_minutes, 0) / total);
  const slaMet = Math.round((cases.filter((item) => item.duration_minutes <= item.sla_minutes).length / total) * 100);
  const positiveSentiment = Math.round(
    (cases.filter((item) => item.sentiment === "Positivo" || item.sentiment === "Neutral").length / total) * 100,
  );

  return [
    { label: "Conversaciones", value: cases.length.toLocaleString("es-CL"), delta: "incluye tickets reales", emphasis: "neutral" },
    { label: "Tickets generados", value: generatedTickets.toString(), delta: "desde bot + demo", emphasis: "neutral" },
    { label: "Resolución autónoma", value: `${Math.round((autonomous / total) * 100)}%`, delta: "sin derivación humana", emphasis: "positive" },
    { label: "Escalados humanos", value: escalated.toString(), delta: "con contexto completo", emphasis: "neutral" },
    { label: "Tiempo promedio", value: `${avgResolution} min`, delta: "casos gestionados", emphasis: "positive" },
    { label: "Cumplimiento SLA", value: `${slaMet}%`, delta: "según prioridad", emphasis: slaMet >= 95 ? "positive" : "critical" },
    { label: "Sentiment usuarios", value: `${positiveSentiment}%`, delta: "positivo o neutral", emphasis: "positive" },
    { label: "Críticos activos", value: criticalActive.toString(), delta: "requiere seguimiento", emphasis: criticalActive ? "critical" : "positive" },
  ];
}

function getVolumeByDay(cases: OperationalCase[]): ChartPoint[] {
  const buckets = new Map<string, number>();
  for (const item of cases) {
    const label = new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short", timeZone: "UTC" }).format(
      new Date(item.created_at),
    );
    buckets.set(label, (buckets.get(label) ?? 0) + 1);
  }

  return Array.from(buckets.entries())
    .map(([label, value]) => ({ label, value }))
    .reverse()
    .slice(-10);
}

function groupByField<T extends keyof OperationalCase>(cases: OperationalCase[], field: T, limit = 8): ChartPoint[] {
  const buckets = new Map<string, number>();
  for (const item of cases) {
    buckets.set(String(item[field]), (buckets.get(String(item[field])) ?? 0) + 1);
  }

  return Array.from(buckets.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function getHourlyHeatmap(cases: OperationalCase[]): ChartPoint[] {
  const hours = Array.from({ length: 12 }, (_, index) => 8 + index);

  return hours.map((hour) => ({
    label: `${String(hour).padStart(2, "0")}:00`,
    value: cases.filter((item) => new Date(item.created_at).getUTCHours() === hour).length,
  }));
}

function getKnowledgeUsage(cases: OperationalCase[]): ChartPoint[] {
  const buckets = new Map<string, number>();
  for (const item of cases) {
    buckets.set(item.knowledge_article, (buckets.get(item.knowledge_article) ?? 0) + 1);
  }

  return Array.from(buckets.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);
}

function getSlaBreachesByDay(cases: OperationalCase[]): ChartPoint[] {
  const buckets = new Map<string, number>();
  for (const item of cases) {
    if (item.duration_minutes <= item.sla_minutes) continue;

    const label = new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short", timeZone: "UTC" }).format(
      new Date(item.created_at),
    );
    buckets.set(label, (buckets.get(label) ?? 0) + 1);
  }

  return Array.from(buckets.entries())
    .map(([label, value]) => ({ label, value }))
    .reverse()
    .slice(-10);
}

function getEscalationFunnel(cases: OperationalCase[]): ChartPoint[] {
  return [
    { label: "Intake", value: cases.length },
    { label: "Clasificados", value: cases.filter((item) => item.issue_type).length },
    { label: "Con KB", value: cases.filter((item) => item.knowledge_article).length },
    { label: "Escalados", value: cases.filter((item) => item.escalated).length },
    { label: "Resueltos", value: cases.filter((item) => item.status === "Resuelto").length },
  ];
}

function getAgingBuckets(cases: OperationalCase[]): ChartPoint[] {
  const buckets = [
    { label: "<4h", value: 0 },
    { label: "4-8h", value: 0 },
    { label: "8-24h", value: 0 },
    { label: ">24h", value: 0 },
  ];

  for (const item of cases) {
    if (item.status === "Resuelto") continue;
    const hours = item.duration_minutes / 60;
    if (hours < 4) buckets[0].value += 1;
    else if (hours < 8) buckets[1].value += 1;
    else if (hours < 24) buckets[2].value += 1;
    else buckets[3].value += 1;
  }

  return buckets;
}

function AdminWorkspace() {
  const [activeSection, setActiveSection] = useState("overview");
  const [realTickets, setRealTickets] = useState<ITSMDemoTicket[]>([]);
  const [ticketSource, setTicketSource] = useState<"cargando" | "supabase" | "demo">("cargando");
  const [showOnlyReal, setShowOnlyReal] = useState(false);

  const mockCases = useMemo(() => listOperationalCases(100), []);
  const realCases = useMemo(() => realTickets.map(ticketToOperationalCase), [realTickets]);
  const cases = useMemo(() => {
    if (showOnlyReal) {
      return realCases;
    }
    return mergeOperationalCases(realCases, mockCases);
  }, [realCases, mockCases, showOnlyReal]);

  const kpis = useMemo(() => buildAdminKpis(cases), [cases]);
  const byDay = useMemo(() => getVolumeByDay(cases), [cases]);
  const byType = useMemo(() => groupByField(cases, "category", 7), [cases]);
  const byPriority = useMemo(() => groupByField(cases, "priority", 4), [cases]);
  const heatmap = useMemo(() => getHourlyHeatmap(cases), [cases]);
  const topIntents = useMemo(() => groupByField(cases, "issue_type", 7), [cases]);
  const escalated = useMemo(() => cases.filter((item) => item.escalated).slice(0, 7), [cases]);
  const knowledge = useMemo(() => getKnowledgeUsage(cases), [cases]);
  const slaBreachesByDay = useMemo(() => getSlaBreachesByDay(cases), [cases]);
  const escalationFunnel = useMemo(() => getEscalationFunnel(cases), [cases]);
  const agingBuckets = useMemo(() => getAgingBuckets(cases), [cases]);
  const sentimentBreakdown = useMemo(() => groupByField(cases, "sentiment", 5), [cases]);
  const operationalModel = useMemo(() => buildOperationalModel(cases, kpis, knowledge), [cases, kpis, knowledge]);

  const incidentCases = useMemo(() => cases.filter((item) =>
    ["INCIDENT", "NETWORK_ISSUE", "HARDWARE_ISSUE", "SECURITY_INCIDENT"].includes(item.issue_type)
  ), [cases]);

  const requestCases = useMemo(() => cases.filter((item) => ["SERVICE_REQUEST", "SOFTWARE_REQUEST"].includes(item.issue_type)), [cases]);

  const accessCases = useMemo(() => cases.filter((item) => item.issue_type === "ACCESS_REQUEST"), [cases]);

  useEffect(() => {
    let active = true;

    async function loadTickets() {
      try {
        const response = await fetch("/api/tickets", { cache: "no-store" });
        if (!response.ok) throw new Error("tickets unavailable");
        const payload = (await response.json()) as { tickets?: ITSMDemoTicket[]; source?: "supabase" | "memory" };
        if (!active) return;
        setRealTickets(payload.tickets ?? []);
        setTicketSource(payload.source === "supabase" ? "supabase" : "demo");
      } catch {
        if (!active) return;
        setTicketSource("demo");
      }
    }

    void loadTickets();
    const interval = window.setInterval(loadTickets, 15000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  function goToSection(id: string) {
    setActiveSection(id);
  }

  const navSections = [
    { id: "overview",       label: "Vista General",              icon: Activity },
    { id: "incidents",      label: "Gestión de Incidentes",      icon: ShieldAlert },
    { id: "requests",       label: "Gestión de Requerimientos",  icon: BarChart3 },
    { id: "access",         label: "Gestión de Accesos",         icon: UsersRound },
    { id: "knowledge",      label: "Base de Conocimiento",       icon: BookOpen },
    { id: "analytics",      label: "Analítica Avanzada",         icon: Gauge },
    { id: "cases",          label: "Bitácora de Casos",          icon: Ticket },
    { id: "configuration",  label: "Gobernanza",                 icon: Settings },
  ];

  return (
    <main className="min-h-screen text-[12px]" style={{ background: "#070E1C", color: "#EEF2FF" }}>
      {/* Borde ámbar superior */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #F59E0B 40%, #FCD34D 60%, transparent)" }} />

      <div className="grid min-h-screen lg:grid-cols-[240px_1fr]">
        {/* ── Sidebar ── */}
        <aside
          className="border-b lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:overflow-y-auto lg:flex lg:flex-col"
          style={{
            background: "linear-gradient(180deg, #0C1629 0%, #0A1220 100%)",
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 p-4 pb-3">
            <AtlasHexLogo size={36} />
            <div className="min-w-0">
              <p className="text-[14px] font-bold leading-tight tracking-[-0.02em]" style={{ color: "#EEF2FF" }}>Atlas</p>
              <p className="text-[11px] font-medium tracking-[0.03em]" style={{ color: "#4A6091" }}>SONDA · Panel ITSM</p>
            </div>
          </div>

          {/* Línea separadora ámbar */}
          <div className="mx-4 mb-3 h-px" style={{ background: "linear-gradient(90deg, #F59E0B, transparent)" }} />

          {/* Fuente de datos */}
          <div className="mx-3 mb-3 rounded-xl px-3 py-2" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <div className="flex items-center gap-2">
              <Database size={11} style={{ color: "#F59E0B" }} />
              <span className="text-[11px] font-bold" style={{ color: ticketSource === "supabase" ? "#6EE7B7" : "#FCD34D" }}>
                {ticketSource === "cargando" ? "Conectando..." : ticketSource === "supabase" ? `${realTickets.length} tickets en BD` : "Modo demo"}
              </span>
            </div>
          </div>

          <nav className="flex-1 px-2 grid gap-0.5">
            {navSections.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToSection(item.id)}
                  className="flex w-full items-center text-left gap-3 rounded-xl px-3 py-2.5 text-[12px] font-semibold transition-all duration-150"
                  style={{
                    background: active ? "rgba(245,158,11,0.1)" : "transparent",
                    border: active ? "1px solid rgba(245,158,11,0.2)" : "1px solid transparent",
                    color: active ? "#FCD34D" : "#8DA0C4",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                      (e.currentTarget as HTMLElement).style.color = "#EEF2FF";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "#8DA0C4";
                    }
                  }}
                >
                  <item.icon size={14} className="shrink-0" aria-hidden />
                  <span className="truncate">{item.label}</span>
                  {active && <span className="ml-auto size-1.5 rounded-full" style={{ background: "#F59E0B" }} />}
                </button>
              );
            })}
          </nav>

          {/* Footer sidebar */}
          <div className="p-4 pt-3">
            <div className="h-px mb-3" style={{ background: "rgba(255,255,255,0.05)" }} />
            <label
              className="flex items-center gap-2 cursor-pointer select-none rounded-xl px-3 py-2 text-[11px] font-semibold transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", color: "#8DA0C4" }}
            >
              <input
                type="checkbox"
                checked={showOnlyReal}
                onChange={(e) => setShowOnlyReal(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-7 h-4 rounded-full transition-all" style={{ background: showOnlyReal ? "#F59E0B" : "rgba(255,255,255,0.1)" }}>
                <span className="absolute top-0.5 left-0.5 size-3 rounded-full bg-white transition-all" style={{ transform: showOnlyReal ? "translateX(12px)" : "translateX(0)" }} />
              </div>
              <span>Solo datos reales</span>
            </label>
            <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: "#4A6091" }}>ITIL v4 · Atlas v2.0</p>
          </div>
        </aside>

        <section className="min-w-0">
          {/* ── Header del workspace ── */}
          <header
            className="sticky top-0 z-20 px-5 py-3 backdrop-blur-xl"
            style={{
              background: "rgba(7,14,28,0.88)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "#4A6091" }}>Centro de Operaciones ITSM</p>
                <h1 className="mt-0.5 text-[20px] font-bold leading-7 tracking-[-0.025em]" style={{ color: "#EEF2FF" }}>Panel ejecutivo ITSM</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.07)", color: "#6EE7B7" }}>
                  <Zap size={10} />
                  ITIL v4
                </div>
                <StatusBadge tone={ticketSource === "supabase" ? "green" : "amber"}>
                  {ticketSource === "supabase" ? `${realTickets.length} tickets reales` : "modo demo"}
                </StatusBadge>
                <StatusBadge tone="slate">Supabase</StatusBadge>
              </div>
            </div>
          </header>

          <div className="space-y-3 p-4">
            {showOnlyReal && cases.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center rounded-2xl p-12 text-center my-10"
                style={{ border: "1px dashed rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
              >
                <div className="grid size-14 place-items-center rounded-2xl" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <Ticket size={28} style={{ color: "#FCD34D" }} />
                </div>
                <h3 className="mt-4 text-base font-bold" style={{ color: "#EEF2FF" }}>Sin tickets reales en Supabase</h3>
                <p className="mt-2 max-w-sm" style={{ color: "#8DA0C4" }}>
                  Aún no hay casos reales registrados. Inicia una conversación en el chatbot y completa el diagnóstico para poblar la base de datos.
                </p>
              </div>
            ) : (
              <>
                {activeSection === "overview" && (
                  <div className="space-y-3">
                    <section id="overview" className="scroll-mt-4">
                      <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
                        {operationalModel.executive.map((kpi) => (
                          <ExecutiveKpiCard key={kpi.label} kpi={kpi} />
                        ))}
                      </div>
                    </section>
                    <section className="grid gap-2 xl:grid-cols-4">
                      <DomainCard id="incidents" title="Gestión de Incidentes" metrics={operationalModel.incident} />
                      <DomainCard id="requests" title="Gestión de Requerimientos" metrics={operationalModel.request} />
                      <DomainCard id="access" title="Gestión de Accesos" metrics={operationalModel.access} />
                      <DomainCard id="knowledge" title="Efectividad de Base de Conocimiento" metrics={operationalModel.knowledge} />
                    </section>
                    <div id="analytics" className="grid gap-2.5 xl:grid-cols-[1.15fr_0.85fr_0.85fr]">
                      <Panel title="Volumen por día" icon={Activity}>
                        <LineBars items={byDay} />
                      </Panel>
                      <Panel title="Prioridades" icon={ShieldAlert}>
                        <PriorityStack items={byPriority} />
                      </Panel>
                      <Panel title="Demanda horaria" icon={Clock3}>
                        <Heatmap items={heatmap} />
                      </Panel>
                    </div>
                  </div>
                )}
                {activeSection === "incidents" && (
                  <div className="space-y-3">
                    <div className="rounded-xl p-4" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                      <h2 className="text-base font-bold" style={{ color: "#EEF2FF" }}>Gestión de Incidentes</h2>
                      <p className="mt-1" style={{ color: "#8DA0C4" }}>Monitoreo técnico de fallas activas de hardware, sistemas operativos, VPN y conectividad.</p>
                    </div>
                    <div className="grid gap-2.5 xl:grid-cols-[1fr_3fr]">
                      <DomainCard id="incidents-detail" title="Métricas de Incidentes" metrics={operationalModel.incident} />
                      <div className="grid gap-2.5">
                        <Panel title="Tendencia de Incidentes" icon={BarChart3}>
                          <HorizontalBars items={topIntents.filter(x => ["INCIDENT", "NETWORK_ISSUE", "HARDWARE_ISSUE"].includes(x.label))} />
                        </Panel>
                      </div>
                    </div>
                    <OperationalTable cases={incidentCases} />
                  </div>
                )}
                {activeSection === "requests" && (
                  <div className="space-y-3">
                    <div className="rounded-xl p-4" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                      <h2 className="text-base font-bold" style={{ color: "#EEF2FF" }}>Gestión de Requerimientos</h2>
                      <p className="mt-1" style={{ color: "#8DA0C4" }}>Seguimiento de solicitudes de instalación de software autorizado, compras de licencias y aprovisionamiento base.</p>
                    </div>
                    <div className="grid gap-2.5 xl:grid-cols-[1fr_3fr]">
                      <DomainCard id="requests-detail" title="Métricas de Requerimientos" metrics={operationalModel.request} />
                      <div className="grid gap-2.5">
                        <Panel title="Distribución de Requerimientos" icon={BarChart3}>
                          <HorizontalBars items={topIntents.filter(x => ["SERVICE_REQUEST", "SOFTWARE_REQUEST"].includes(x.label))} />
                        </Panel>
                      </div>
                    </div>
                    <OperationalTable cases={requestCases} />
                  </div>
                )}
                {activeSection === "access" && (
                  <div className="space-y-3">
                    <div className="rounded-xl p-4" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                      <h2 className="text-base font-bold" style={{ color: "#EEF2FF" }}>Gestión de Accesos e Identidades</h2>
                      <p className="mt-1" style={{ color: "#8DA0C4" }}>Aprobación y provisión de accesos de red, reseteo de contraseñas, onboarding y carpetas compartidas.</p>
                    </div>
                    <div className="grid gap-2.5 xl:grid-cols-[1fr_3fr]">
                      <DomainCard id="access-detail" title="Métricas de Accesos" metrics={operationalModel.access} />
                      <div className="grid gap-2.5">
                        <Panel title="Distribución de Categorías" icon={Gauge}>
                          <HorizontalBars items={byType.filter(x => ["Acceso a correo", "Permisos", "Password reset"].includes(x.label))} />
                        </Panel>
                      </div>
                    </div>
                    <OperationalTable cases={accessCases} />
                  </div>
                )}
                {activeSection === "knowledge" && (
                  <div className="space-y-3">
                    <div className="rounded-xl p-4" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                      <h2 className="text-base font-bold" style={{ color: "#EEF2FF" }}>Base de Conocimiento</h2>
                      <p className="mt-1" style={{ color: "#8DA0C4" }}>Efectividad en el uso de artículos L2 y desvío autónomo de casos por el bot.</p>
                    </div>
                    <div className="grid gap-2.5 xl:grid-cols-[1fr_3fr]">
                      <DomainCard id="knowledge-detail" title="Resumen de Base de Conocimiento" metrics={operationalModel.knowledge} />
                      <Panel title="Artículos de Conocimiento Utilizados" icon={BookOpen}>
                        <KnowledgeList items={knowledge} />
                      </Panel>
                    </div>
                  </div>
                )}
                {activeSection === "analytics" && (
                  <div className="space-y-3">
                    <div className="grid gap-2.5 xl:grid-cols-2">
                      <Panel title="Volumen por día" icon={Activity}>
                        <LineBars items={byDay} />
                      </Panel>
                      <Panel title="Mapa de calor de demanda horaria" icon={Clock3}>
                        <Heatmap items={heatmap} />
                      </Panel>
                    </div>
                    <div className="grid gap-2.5 xl:grid-cols-3">
                      <Panel title="Prioridades" icon={ShieldAlert}>
                        <PriorityStack items={byPriority} />
                      </Panel>
                      <Panel title="Incumplimientos de SLA por día" icon={Clock3}>
                        <LineBars items={slaBreachesByDay} />
                      </Panel>
                      <Panel title="Carga de trabajo pendiente por antigüedad" icon={Gauge}>
                        <HorizontalBars items={agingBuckets} />
                      </Panel>
                    </div>
                    <div className="grid gap-2.5 xl:grid-cols-3">
                      <Panel title="Distribución por categorías" icon={Gauge}>
                        <HorizontalBars items={byType} />
                      </Panel>
                      <Panel title="Tendencia de incidentes" icon={BarChart3}>
                        <HorizontalBars items={topIntents} compact />
                      </Panel>
                      <Panel title="Distribución de sentimiento de usuarios" icon={UsersRound}>
                        <HorizontalBars items={sentimentBreakdown} />
                      </Panel>
                    </div>
                  </div>
                )}
                {activeSection === "cases" && (
                  <div className="space-y-3">
                    <div id="cases" className="grid gap-2.5 xl:grid-cols-[0.32fr_0.68fr]">
                      <Panel title="Casos escalados" icon={Ticket}>
                        <EscalatedList cases={escalated} />
                      </Panel>
                      <OperationalTable cases={cases} />
                    </div>
                  </div>
                )}
                {activeSection === "configuration" && (
                  <section id="configuration" className="rounded-2xl px-5 py-4 space-y-4" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}>
                    <div>
                      <h2 className="text-base font-bold" style={{ color: "#EEF2FF" }}>Gobernanza y Configuración</h2>
                      <p className="mt-1 text-[11px]" style={{ color: "#4A6091" }}>Configuración de la mesa de soporte inteligente bajo el modelo ITIL v4 de SONDA.</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { title: "Taxonomía ITIL", body: "Categorización inteligente automatizada con 8 intents estándar y más de 30 categorías de servicio." },
                        { title: "SLA y Prioridades", body: "Cálculo de severidad autónomo (P1-P4) correlacionando impacto operacional y urgencia reportada." },
                        { title: "Base de Datos", body: "Conectado en tiempo real a Supabase para auditorías operativas rápidas y analítica sin latencia." },
                      ].map((card) => (
                        <div key={card.title} className="rounded-xl p-3.5" style={{ background: "rgba(7,14,28,0.5)", border: "1px solid rgba(245,158,11,0.12)" }}>
                          <p className="text-xs font-bold" style={{ color: "#FCD34D" }}>{card.title}</p>
                          <p className="mt-2 leading-5" style={{ color: "#8DA0C4" }}>{card.body}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

const PRIORITY_DOT: Record<string, string> = {
  P1: "#EF4444",
  P2: "#F97316",
  P3: "#F59E0B",
  P4: "#10B981",
};

function PriorityDot({ priority }: { priority: string }) {
  const color = PRIORITY_DOT[priority] ?? "#8DA0C4";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-2 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 5px ${color}` }} />
      <span className="font-data font-semibold" style={{ color }}>{priority}</span>
    </span>
  );
}

function OperationalTable({ cases }: { cases: OperationalCase[] }) {
  return (
    <article
      className="overflow-hidden rounded-2xl shadow-sm"
      style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <h2 className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "#EEF2FF" }}>
          <CheckCircle2 size={14} style={{ color: "#10B981" }} aria-hidden />
          Bitácora de casos
        </h2>
        <span className="text-[11px] font-medium" style={{ color: "#4A6091" }}>actualización en vivo</span>
      </div>
      <div className="thin-scrollbar max-h-[480px] overflow-auto">
        <table className="w-full min-w-[1040px] border-collapse text-left text-xs">
          <thead className="sticky top-0" style={{ background: "#0A1220" }}>
            <tr>
              {["Ticket ID", "Usuario", "Tipo", "Categoría", "Prioridad", "Estado", "Asignado a", "Creado", "Duración", "Escalado", "SLA"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-3 py-2.5 font-bold text-[11px] uppercase tracking-[0.07em]"
                    style={{ color: "#4A6091" }}
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {cases.map((item, i) => (
              <tr
                key={item.id}
                className="transition-colors duration-100"
                style={{
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.05)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)"; }}
              >
                <td className="px-3 py-2.5 font-data font-semibold" style={{ color: "#FCD34D" }}>{item.id}</td>
                <td className="px-3 py-2.5 font-semibold" style={{ color: "#EEF2FF" }}>{item.user_name || "—"}</td>
                <td className="px-3 py-2.5" style={{ color: "#8DA0C4" }}>{item.issue_type.replaceAll("_", " ")}</td>
                <td className="px-3 py-2.5" style={{ color: "#8DA0C4" }}>{item.category}</td>
                <td className="px-3 py-2.5"><PriorityDot priority={item.priority} /></td>
                <td className="px-3 py-2.5">
                  <span
                    className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{
                      background: item.status === "Resuelto" ? "rgba(16,185,129,0.12)" : item.status === "Escalado" ? "rgba(139,92,246,0.12)" : "rgba(59,130,246,0.12)",
                      color: item.status === "Resuelto" ? "#6EE7B7" : item.status === "Escalado" ? "#C4B5FD" : "#93C5FD",
                      border: `1px solid ${item.status === "Resuelto" ? "rgba(16,185,129,0.25)" : item.status === "Escalado" ? "rgba(139,92,246,0.25)" : "rgba(59,130,246,0.25)"}`,
                    }}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-3 py-2.5" style={{ color: "#8DA0C4" }}>{item.assigned_technician}</td>
                <td className="px-3 py-2.5 font-data" style={{ color: "#4A6091" }}>{formatDate(item.created_at)}</td>
                <td className="px-3 py-2.5" style={{ color: "#8DA0C4" }}>{item.duration_minutes} min</td>
                <td className="px-3 py-2.5">
                  <span style={{ color: item.escalated ? "#C4B5FD" : "#4A6091" }}>{item.escalated ? "Sí" : "No"}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={{
                      background: item.duration_minutes > item.sla_minutes ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)",
                      color: item.duration_minutes > item.sla_minutes ? "#FCA5A5" : "#6EE7B7",
                      border: `1px solid ${item.duration_minutes > item.sla_minutes ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"}`,
                    }}
                  >
                    {item.duration_minutes > item.sla_minutes ? "Incumplido" : "OK"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function buildOperationalModel(cases: OperationalCase[], kpis: AdminKpi[], knowledge: ChartPoint[]) {
  const incidentCases = cases.filter((item) =>
    ["INCIDENT", "NETWORK_ISSUE", "HARDWARE_ISSUE", "SECURITY_INCIDENT"].includes(item.issue_type),
  );
  const requestCases = cases.filter((item) => ["SERVICE_REQUEST", "SOFTWARE_REQUEST"].includes(item.issue_type));
  const accessCases = cases.filter((item) => item.issue_type === "ACCESS_REQUEST");
  const autonomous = cases.filter((item) => item.resolution_type === "Autónoma").length;
  const escalated = cases.filter((item) => item.escalated).length;
  const slaBreaches = cases.filter((item) => item.duration_minutes > item.sla_minutes).length;

  return {
    executive: [
      { label: "Conversaciones totales", value: kpiValue(kpis, "Conversaciones"), meta: "+18% últimos 7 días", tone: "neutral" },
      { label: "Casos gestionados", value: cases.length.toString(), meta: "pipeline operativo", tone: "neutral" },
      { label: "Resolución autónoma", value: kpiValue(kpis, "Resolución autónoma"), meta: `${autonomous} casos`, tone: "positive" },
      { label: "Escalados humanos", value: kpiValue(kpis, "Escalados humanos"), meta: "con contexto", tone: "neutral" },
      { label: "SLA cumplimiento", value: kpiValue(kpis, "Cumplimiento SLA"), meta: `${slaBreaches} breaches`, tone: slaBreaches ? "warning" : "positive" },
      { label: "Tiempo promedio", value: kpiValue(kpis, "Tiempo promedio"), meta: "resolución", tone: "neutral" },
    ],
    incident: [
      { label: "abiertos", value: countOpen(incidentCases).toString() },
      { label: "cerrados", value: countClosed(incidentCases).toString() },
      { label: "críticos", value: incidentCases.filter((item) => item.priority === "P1").length.toString() },
      { label: "MTTR", value: `${averageDuration(incidentCases)} min` },
      { label: "aging", value: incidentCases.filter((item) => item.duration_minutes > item.sla_minutes).length.toString() },
    ],
    request: [
      { label: "abiertas", value: countOpen(requestCases).toString() },
      { label: "completadas", value: countClosed(requestCases).toString() },
      { label: "tiempo promedio", value: `${averageDuration(requestCases)} min` },
    ],
    access: [
      { label: "solicitados", value: accessCases.length.toString() },
      { label: "aprobados", value: countClosed(accessCases).toString() },
      { label: "pendientes", value: countOpen(accessCases).toString() },
    ],
    knowledge: [
      { label: "artículos usados", value: knowledge.reduce((sum, item) => sum + item.value, 0).toString() },
      { label: "self-service success", value: kpiValue(kpis, "Resolución autónoma") },
      { label: "fallback humano", value: escalated.toString() },
    ],
  };
}

function countOpen(items: OperationalCase[]) {
  return items.filter((item) => item.status !== "Resuelto").length;
}

function countClosed(items: OperationalCase[]) {
  return items.filter((item) => item.status === "Resuelto").length;
}

function averageDuration(items: OperationalCase[]) {
  if (!items.length) return 0;
  return Math.round(items.reduce((sum, item) => sum + item.duration_minutes, 0) / items.length);
}

function ExecutiveKpiCard({ kpi }: { kpi: { label: string; value: string; meta: string; tone: string } }) {
  const borderColor = kpi.tone === "warning"
    ? "rgba(245,158,11,0.22)"
    : kpi.tone === "positive"
      ? "rgba(16,185,129,0.2)"
      : "rgba(255,255,255,0.07)";
  const bgColor = kpi.tone === "warning"
    ? "rgba(245,158,11,0.06)"
    : kpi.tone === "positive"
      ? "rgba(16,185,129,0.05)"
      : "rgba(255,255,255,0.03)";
  const valueColor = kpi.tone === "warning"
    ? "#FCD34D"
    : kpi.tone === "positive"
      ? "#6EE7B7"
      : "#EEF2FF";

  return (
    <article
      className="rounded-xl px-3 py-2.5 transition-all duration-200 hover:scale-[1.02]"
      style={{ border: `1px solid ${borderColor}`, background: bgColor, boxShadow: "0 4px 16px rgba(4,8,20,0.3)" }}
    >
      <p className="text-[10.5px] font-medium uppercase tracking-[0.07em]" style={{ color: "#4A6091" }}>{kpi.label}</p>
      <p className="mt-1.5 text-[22px] font-bold leading-6 tracking-[-0.03em]" style={{ color: valueColor }}>{kpi.value}</p>
      <p className="mt-1 text-[11px]" style={{ color: "#4A6091" }}>{kpi.meta}</p>
    </article>
  );
}

function DomainCard({ id, title, metrics }: { id: string; title: string; metrics: Array<{ label: string; value: string }> }) {
  return (
    <article
      id={id}
      className="scroll-mt-4 rounded-xl p-3"
      style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}
    >
      <h2 className="text-[13px] font-bold" style={{ color: "#EEF2FF" }}>{title}</h2>
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl px-2.5 py-2"
            style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(7,14,28,0.4)" }}
          >
            <p className="text-[10px] uppercase tracking-[0.08em] font-bold" style={{ color: "#4A6091" }}>{metric.label}</p>
            <p className="mt-1 text-[16px] font-bold leading-5" style={{ color: "#EEF2FF" }}>{metric.value}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof Activity; children: ReactNode }) {
  return (
    <article
      className="rounded-xl p-3.5"
      style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className="grid size-6 place-items-center rounded-lg"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.18)" }}
        >
          <Icon size={13} style={{ color: "#F59E0B" }} aria-hidden />
        </span>
        <h2 className="text-[13px] font-bold" style={{ color: "#EEF2FF" }}>{title}</h2>
      </div>
      {children}
    </article>
  );
}

function LineBars({ items }: { items: ChartPoint[] }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="flex h-32 items-end gap-1">
      {items.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex h-24 w-full items-end rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div
              className="w-full rounded-md transition-all duration-500"
              style={{
                height: `${Math.max((item.value / max) * 100, 8)}%`,
                background: "linear-gradient(to top, #F59E0B, rgba(245,158,11,0.3))",
              }}
            />
          </div>
          <span className="text-[9px] font-medium" style={{ color: "#4A6091" }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function HorizontalBars({ items, compact = false }: { items: ChartPoint[]; compact?: boolean }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between gap-3 text-xs">
            <span className="truncate" style={{ color: "#8DA0C4" }}>{item.label.replaceAll("_", " ")}</span>
            <span className="font-bold" style={{ color: "#EEF2FF" }}>{item.value}</span>
          </div>
          <div className={`overflow-hidden rounded-full ${compact ? "h-1" : "h-1.5"}`} style={{ background: "rgba(255,255,255,0.07)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max((item.value / max) * 100, 6)}%`, background: "linear-gradient(90deg, #1B3D8C, #F59E0B)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function FunnelBars({ items }: { items: ChartPoint[] }) {
  const max = Math.max(...items.map((item) => item.value));

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={item.label} className="grid grid-cols-[78px_1fr_34px] items-center gap-2 text-xs">
          <span className="truncate text-slate-400">{item.label}</span>
          <div className="h-5 overflow-hidden rounded-md bg-white/[0.055]">
            <div
              className={`h-full rounded-md ${index < 3 ? "bg-cyan-300/85" : index === 3 ? "bg-amber-300/80" : "bg-emerald-300/80"}`}
              style={{ width: `${Math.max((item.value / max) * 100, 6)}%` }}
            />
          </div>
          <span className="text-right font-semibold text-white">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function PriorityStack({ items }: { items: ChartPoint[] }) {
  const total = Math.max(items.reduce((sum, item) => sum + item.value, 0), 1);
  const colors: Record<string, string> = {
    P1: "#EF4444",
    P2: "#F97316",
    P3: "#F59E0B",
    P4: "#10B981",
  };

  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        {items.map((item) => (
          <div
            key={item.label}
            style={{ width: `${(item.value / total) * 100}%`, background: colors[item.label] ?? "#8DA0C4", opacity: 0.88 }}
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${colors[item.label]}22` }}>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: colors[item.label] ?? "#8DA0C4", boxShadow: `0 0 5px ${colors[item.label]}` }} />
              <p className="text-xs font-bold" style={{ color: colors[item.label] ?? "#8DA0C4" }}>{item.label}</p>
            </div>
            <p className="mt-1 text-[18px] font-bold" style={{ color: "#EEF2FF" }}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Heatmap({ items }: { items: ChartPoint[] }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="grid grid-cols-4 gap-1">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl px-2 py-2 text-center"
          style={{
            background: `rgba(245,158,11,${0.04 + (item.value / max) * 0.2})`,
            border: `1px solid rgba(245,158,11,${0.08 + (item.value / max) * 0.18})`,
          }}
        >
          <p className="text-[10.5px] font-semibold" style={{ color: "#EEF2FF" }}>{item.label}</p>
          <p className="mt-0.5 text-[11px] font-bold" style={{ color: item.value > max * 0.6 ? "#F59E0B" : "#4A6091" }}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function KnowledgeList({ items }: { items: ChartPoint[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-start justify-between gap-3 rounded-xl p-2.5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs leading-5" style={{ color: "#8DA0C4" }}>{item.label}</p>
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-bold shrink-0"
            style={{ background: "rgba(245,158,11,0.12)", color: "#FCD34D", border: "1px solid rgba(245,158,11,0.22)" }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function EscalatedList({ cases }: { cases: OperationalCase[] }) {
  return (
    <div className="space-y-2">
      {cases.map((item) => (
        <div
          key={item.id}
          className="rounded-xl p-2.5"
          style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-data text-xs font-semibold" style={{ color: "#FCD34D" }}>{item.id}</p>
            <PriorityDot priority={item.priority} />
          </div>
          <p className="mt-1.5 text-[13px] font-semibold" style={{ color: "#EEF2FF" }}>{item.category}</p>
          <p className="mt-1 text-xs" style={{ color: "#4A6091" }}>{item.assigned_technician}</p>
        </div>
      ))}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
}
