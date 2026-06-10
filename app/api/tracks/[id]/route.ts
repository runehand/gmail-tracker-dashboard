import { NextResponse } from "next/server";
import { getEvents, getTrack } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const track = await getTrack(id);
  if (!track) return NextResponse.json({ error: "Not found" }, { status: 404, headers: { "Access-Control-Allow-Origin": "*" } });
  return NextResponse.json({ track, events: await getEvents(id) }, { headers: { "Access-Control-Allow-Origin": "*" } });
}
