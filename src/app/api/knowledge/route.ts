import { NextResponse } from "next/server";
import { knowledgeBase } from "@/lib/data/knowledgeBase";

export async function GET() {
  return NextResponse.json({ articles: knowledgeBase });
}
