import type { KPI } from "@/lib/itsm/types";

export const landingKpis: KPI[] = [
  { label: "Tickets L1 evitados", value: "38%", delta: "+12 pts vs. base", tone: "cyan" },
  { label: "Tiempo promedio de respuesta", value: "42s", delta: "-68% operativo", tone: "blue" },
  { label: "Precisión de clasificación", value: "91%", delta: "mock demo", tone: "green" },
  { label: "Casos escalados con contexto", value: "100%", delta: "sin pérdida de trazabilidad", tone: "amber" },
];

export const dashboardKpis: KPI[] = [
  { label: "Casos procesados", value: "1.248", delta: "+18% semanal", tone: "blue" },
  { label: "Resolución autónoma", value: "54%", delta: "+9 pts", tone: "green" },
  { label: "Escalamiento con contexto", value: "312", delta: "100% documentado", tone: "cyan" },
  { label: "SLA protegido", value: "96%", delta: "riesgo bajo", tone: "amber" },
];

export const ticketTypeDistribution = [
  { label: "Incidentes", value: 34 },
  { label: "Accesos", value: 22 },
  { label: "Software", value: 18 },
  { label: "Hardware", value: 14 },
  { label: "Red", value: 12 },
];

export const priorityDistribution = [
  { label: "P1", value: 8 },
  { label: "P2", value: 17 },
  { label: "P3", value: 49 },
  { label: "P4", value: 26 },
];
