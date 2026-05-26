import type { ITSMIntent, ITSMPriority } from "@/lib/itsm/types";

export type CaseStatus = "Nuevo" | "En diagnóstico" | "Resuelto" | "Escalado" | "En seguimiento";
export type ResolutionType = "Autónoma" | "Asistida" | "Escalada" | "Pendiente";
export type UserSentiment = "Positivo" | "Neutral" | "Tenso" | "Crítico";

export type OperationalCase = {
  id: string;
  user_name: string;
  department: string;
  issue_type: ITSMIntent;
  category: string;
  priority: ITSMPriority;
  status: CaseStatus;
  created_at: string;
  resolved_at: string | null;
  resolution_type: ResolutionType;
  escalated: boolean;
  assigned_technician: string;
  sentiment: UserSentiment;
  conversation_summary: string;
  sla_minutes: number;
  duration_minutes: number;
  knowledge_article: string;
};

export type AdminKpi = {
  label: string;
  value: string;
  delta: string;
  emphasis?: "critical" | "positive" | "neutral";
};

export type ChartPoint = {
  label: string;
  value: number;
};
