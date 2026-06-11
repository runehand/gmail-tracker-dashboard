import { NextResponse } from "next/server";
import { getEvents, getTrack, updateTrack } from "@/lib/db";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const track = await getTrack(id);
  if (!track) return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
  return NextResponse.json({ track, events: await getEvents(id) }, { headers: corsHeaders });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const track = await updateTrack(id, {
    senderEmail: body.senderEmail ? String(body.senderEmail) : undefined,
    recipientEmail: body.recipientEmail ? String(body.recipientEmail) : undefined,
    subject: typeof body.subject === "string" ? body.subject : undefined,
    bodyHtml: typeof body.bodyHtml === "string" ? body.bodyHtml : undefined,
    bodyText: typeof body.bodyText === "string" ? body.bodyText : undefined,
    sentAt: typeof body.sentAt === "string" ? body.sentAt : undefined,
    sent: typeof body.sent === "boolean" ? body.sent : undefined
  });

  if (!track) return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders });
  return NextResponse.json({ track }, { headers: corsHeaders });
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}
