import { NextResponse } from "next/server";
import { knowledgeBase } from "@/data/mock/knowledgeBase";

export async function GET() {
  return NextResponse.json({ articles: knowledgeBase });
}
