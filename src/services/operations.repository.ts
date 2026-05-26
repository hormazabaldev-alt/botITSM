import { operationalCases } from "@/data/mock/operationalCases";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminKpi, ChartPoint, OperationalCase } from "@/types/operational";
import type { ITSMIntent, ITSMPriority } from "@/lib/itsm/types";

// ─── Tipos internos de Supabase ───────────────────────────────────────────────

type RawSession = {
  id: string;
  status: string;
  detected_intent: string | null;
  priority: string | null;
  created_at: string;
  closed_at: string | null;
  context: Record<string, unknown> | null;
};

type RawTicket = {
  id: string;
  type: string;
  priority: string;
  category: string;
  status: string;
  created_at: string;
  payload: Record<string, unknown> | null;
};

// ─── Carga de datos ───────────────────────────────────────────────────────────

async function loadLiveData(): Promise<{ sessions: RawSession[]; tickets: RawTicket[] } | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const [sessionsResult, ticketsResult] = await Promise.all([
    supabase
      .from("chat_sessions")
      .select("id, status, detected_intent, priority, created_at, closed_at, context")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("tickets")
      .select("id, type, priority, category, status, created_at, payload")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  // Si ambas consultas fallan, usar mock
  if (sessionsResult.error && ticketsResult.error) return null;

  return {
    sessions: (sessionsResult.data ?? []) as RawSession[],
    tickets: (ticketsResult.data ?? []) as RawTicket[],
  };
}

function sessionToCase(session: RawSession, index: number): OperationalCase {
  const ctx = session.context as Record<string, unknown> | null;
  const fields = (ctx?.collectedFields as Record<string, string> | undefined) ?? {};
  const createdAt = new Date(session.created_at);
  const closedAt = session.closed_at ? new Date(session.closed_at) : null;
  const durationMinutes = closedAt
    ? Math.round((closedAt.getTime() - createdAt.getTime()) / 60000)
    : Math.round((Date.now() - createdAt.getTime()) / 60000);

  const intent = (session.detected_intent as ITSMIntent) ?? "INCIDENT";
  const priority = (session.priority as ITSMPriority) ?? "P3";

  const statusMap: Record<string, OperationalCase["status"]> = {
    resolved: "Resuelto",
    escalated: "Escalado",
    active: "En diagnóstico",
    open: "En diagnóstico",
    abandoned: "En seguimiento",
  };
  const status = statusMap[session.status] ?? "Nuevo";
  const escalated = session.status === "escalated";
  const resolutionType: OperationalCase["resolution_type"] =
    session.status === "resolved" ? "Autónoma"
    : session.status === "escalated" ? "Escalada"
    : "Pendiente";

  const slaBySeverity: Record<ITSMPriority, number> = { P1: 30, P2: 120, P3: 480, P4: 1440 };
  const slaMinutes = slaBySeverity[priority] ?? 480;

  const intentLabel: Record<ITSMIntent, string> = {
    INCIDENT: "Incidente",
    SERVICE_REQUEST: "Solicitud de servicio",
    ACCESS_REQUEST: "Acceso",
    SOFTWARE_REQUEST: "Software",
    HARDWARE_ISSUE: "Hardware",
    NETWORK_ISSUE: "Red / Conectividad",
    SECURITY_INCIDENT: "Seguridad",
    HUMAN_ESCALATION: "Escalación humana",
  };

  return {
    id: session.id,
    user_name: fields.nombre ?? "Usuario",
    department: fields.area ?? "Sin área",
    issue_type: intent,
    category: intentLabel[intent] ?? intent,
    priority,
    status,
    created_at: session.created_at,
    resolved_at: session.closed_at,
    resolution_type: resolutionType,
    escalated,
    assigned_technician: escalated ? "Mesa N1 → N2" : "Atlas IA",
    sentiment: "Neutral",
    conversation_summary: `Sesión ${session.id.slice(0, 8)} — ${status}`,
    sla_minutes: slaMinutes,
    duration_minutes: Math.max(1, durationMinutes),
    knowledge_article: (ctx?.activeArticleId as string) ?? "Sin KB",
  };
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Versión síncrona — solo devuelve datos mock.
 * Usada por componentes cliente que no pueden hacer await en el render.
 */
export function listOperationalCasesSync(limit = 100): OperationalCase[] {
  return operationalCases.slice(0, limit);
}

/**
 * Versión async — consulta Supabase cuando está disponible.
 * Usada por Server Actions y API routes.
 */
export async function listOperationalCases(limit = 100): Promise<OperationalCase[]> {
  const live = await loadLiveData();
  if (live && live.sessions.length > 0) {
    return live.sessions.slice(0, limit).map((s, i) => sessionToCase(s, i));
  }
  return operationalCases.slice(0, limit);
}

export async function getAdminKpis(): Promise<AdminKpi[]> {
  const live = await loadLiveData();

  if (live && live.sessions.length > 0) {
    const { sessions, tickets } = live;
    const total = sessions.length;
    const resolved = sessions.filter((s) => s.status === "resolved").length;
    const escalated = sessions.filter((s) => s.status === "escalated").length;
    const active = sessions.filter((s) => s.status === "active" || s.status === "open").length;
    const autonomousRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const ticketCount = tickets.length;

    // Tiempo promedio de resolución (solo sesiones cerradas con closed_at)
    const closedWithTime = sessions.filter((s) => s.closed_at);
    const avgResolution = closedWithTime.length > 0
      ? Math.round(
          closedWithTime.reduce((sum, s) => {
            const dur = (new Date(s.closed_at!).getTime() - new Date(s.created_at).getTime()) / 60000;
            return sum + dur;
          }, 0) / closedWithTime.length,
        )
      : 0;

    const slaTarget: Record<string, number> = { P1: 30, P2: 120, P3: 480, P4: 1440 };
    const slaMet = closedWithTime.length > 0
      ? Math.round(
          (closedWithTime.filter((s) => {
            const dur = (new Date(s.closed_at!).getTime() - new Date(s.created_at).getTime()) / 60000;
            const limit = slaTarget[(s.priority ?? "P3")] ?? 480;
            return dur <= limit;
          }).length / closedWithTime.length) * 100,
        )
      : 100;

    return [
      { label: "Conversaciones", value: total.toLocaleString("es-CL"), delta: "desde inicio", emphasis: "neutral" },
      { label: "Tickets generados", value: ticketCount.toString(), delta: `${escalated} escalados`, emphasis: "neutral" },
      { label: "Resolución autónoma", value: `${autonomousRate}%`, delta: `${resolved} resueltas`, emphasis: "positive" },
      { label: "Escalados humanos", value: escalated.toString(), delta: "con contexto completo", emphasis: "neutral" },
      { label: "Tiempo promedio", value: avgResolution > 0 ? `${avgResolution} min` : "—", delta: "casos cerrados", emphasis: "positive" },
      { label: "Cumplimiento SLA", value: `${slaMet}%`, delta: "objetivo 95%", emphasis: slaMet >= 95 ? "positive" : "critical" },
      { label: "Activas ahora", value: active.toString(), delta: "en diagnóstico", emphasis: active > 0 ? "neutral" : "positive" },
      { label: "Críticos activos", value: sessions.filter((s) => s.priority === "P1" && s.status !== "resolved").length.toString(), delta: "requiere seguimiento", emphasis: "critical" },
    ];
  }

  // ── Fallback mock ─────────────────────────────────────────────────────────
  const cases = operationalCases;
  const total = cases.length;
  const generatedTickets = cases.filter((item) => item.status !== "Resuelto" || item.escalated).length;
  const autonomous = cases.filter((item) => item.resolution_type === "Autónoma").length;
  const escalated = cases.filter((item) => item.escalated).length;
  const criticalActive = cases.filter((item) => item.priority === "P1" && item.status !== "Resuelto").length;
  const resolved = cases.filter((item) => item.status === "Resuelto");
  const avgResolution = Math.round(resolved.reduce((sum, item) => sum + item.duration_minutes, 0) / Math.max(1, resolved.length));
  const slaMet = Math.round(
    (cases.filter((item) => item.duration_minutes <= item.sla_minutes * (item.priority === "P1" ? 8 : 1.6)).length / total) * 100,
  );
  const positiveSentiment = Math.round(
    (cases.filter((item) => item.sentiment === "Positivo" || item.sentiment === "Neutral").length / total) * 100,
  );

  return [
    { label: "Conversaciones", value: total.toLocaleString("es-CL"), delta: "+18% últimos 7 días", emphasis: "neutral" },
    { label: "Tickets generados", value: generatedTickets.toString(), delta: "derivación controlada", emphasis: "neutral" },
    { label: "Resolución autónoma", value: `${Math.round((autonomous / total) * 100)}%`, delta: "+7 pts mensual", emphasis: "positive" },
    { label: "Escalados humanos", value: escalated.toString(), delta: "con contexto completo", emphasis: "neutral" },
    { label: "Tiempo promedio", value: `${avgResolution} min`, delta: "casos resueltos", emphasis: "positive" },
    { label: "Cumplimiento SLA", value: `${slaMet}%`, delta: "objetivo 95%", emphasis: slaMet >= 95 ? "positive" : "critical" },
    { label: "Sentiment usuarios", value: `${positiveSentiment}%`, delta: "positivo o neutral", emphasis: "positive" },
    { label: "Críticos activos", value: criticalActive.toString(), delta: "requiere seguimiento", emphasis: criticalActive ? "critical" : "positive" },
  ];
}

export async function getVolumeByDay(): Promise<ChartPoint[]> {
  const cases = await listOperationalCases(500);
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

export async function groupByField<T extends keyof OperationalCase>(field: T, limit = 8): Promise<ChartPoint[]> {
  const cases = await listOperationalCases(500);
  const buckets = new Map<string, number>();
  for (const item of cases) {
    buckets.set(String(item[field]), (buckets.get(String(item[field])) ?? 0) + 1);
  }
  return Array.from(buckets.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export async function getHourlyHeatmap(): Promise<ChartPoint[]> {
  const cases = await listOperationalCases(500);
  const hours = Array.from({ length: 12 }, (_, index) => 8 + index);
  return hours.map((hour) => ({
    label: `${String(hour).padStart(2, "0")}:00`,
    value: cases.filter((item) => new Date(item.created_at).getUTCHours() === hour).length,
  }));
}

export async function getKnowledgeUsage(): Promise<ChartPoint[]> {
  const cases = await listOperationalCases(500);
  const buckets = new Map<string, number>();
  for (const item of cases) {
    buckets.set(item.knowledge_article, (buckets.get(item.knowledge_article) ?? 0) + 1);
  }
  return Array.from(buckets.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);
}

export async function getSlaBreachesByDay(): Promise<ChartPoint[]> {
  const cases = await listOperationalCases(500);
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

export async function getAgingBuckets(): Promise<ChartPoint[]> {
  const cases = await listOperationalCases(500);
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

export async function getEscalationFunnel(): Promise<ChartPoint[]> {
  const cases = await listOperationalCases(500);
  return [
    { label: "Intake", value: cases.length },
    { label: "Clasificados", value: cases.filter((item) => item.issue_type).length },
    { label: "Con KB", value: cases.filter((item) => item.knowledge_article && item.knowledge_article !== "Sin KB").length },
    { label: "Escalados", value: cases.filter((item) => item.escalated).length },
    { label: "Resueltos", value: cases.filter((item) => item.status === "Resuelto").length },
  ];
}

export async function getSentimentBreakdown(): Promise<ChartPoint[]> {
  const cases = await listOperationalCases(500);
  const buckets = new Map<string, number>();
  for (const item of cases) {
    buckets.set(item.sentiment, (buckets.get(item.sentiment) ?? 0) + 1);
  }
  return Array.from(buckets.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}
