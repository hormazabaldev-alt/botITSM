import { NextResponse } from "next/server";
import {
  getAdminKpis,
  getHourlyHeatmap,
  getKnowledgeUsage,
  getVolumeByDay,
  groupByField,
  listOperationalCases,
} from "@/services/operations.repository";

export async function GET() {
  return NextResponse.json({
    kpis: getAdminKpis(),
    volumeByDay: getVolumeByDay(),
    incidentsByType: groupByField("category", 10),
    priorities: groupByField("priority", 4),
    heatmap: getHourlyHeatmap(),
    topIntents: groupByField("issue_type", 10),
    technicians: groupByField("assigned_technician", 10),
    knowledge: getKnowledgeUsage(),
    recentCases: listOperationalCases(100),
  });
}
