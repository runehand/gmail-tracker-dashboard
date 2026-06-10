import { NextResponse } from "next/server";
import { getStats } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ stats: await getStats() }, { headers: { "Access-Control-Allow-Origin": "*" } });
}
