import { NextResponse } from "next/server";
import { getEvents, getTrack, updateTrack } from "@/lib/db";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const senderEmail = new URL(request.url).searchParams.get("senderEmail");
  if (!senderEmail?.trim()) return NextResponse.json({ error: "senderEmail is required" }, { status: 400, headers: corsHeaders });

  const track = await getTrack(id);
  if (!track || track.senderEmail.toLowerCase().trim() !== senderEmail.toLowerCase().trim()) {
    return NextResponse.json({ error: "Not found or sender mismatch" }, { status: 404, headers: corsHeaders });
  }

  return NextResponse.json({ track, events: await getEvents(id) }, { headers: corsHeaders });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (!body.senderEmail) {
    return NextResponse.json({ error: "senderEmail is required" }, { status: 400, headers: corsHeaders });
  }

  const track = await updateTrack(id, {
    expectedSenderEmail: String(body.senderEmail),
    recipientEmail: body.recipientEmail ? String(body.recipientEmail) : undefined,
    subject: typeof body.subject === "string" ? body.subject : undefined,
    bodyHtml: typeof body.bodyHtml === "string" ? body.bodyHtml : undefined,
    bodyText: typeof body.bodyText === "string" ? body.bodyText : undefined,
    sentAt: typeof body.sentAt === "string" ? body.sentAt : undefined,
    sent: typeof body.sent === "boolean" ? body.sent : undefined
  });

  if (!track) return NextResponse.json({ error: "Not found or sender mismatch" }, { status: 404, headers: corsHeaders });
  return NextResponse.json({ track }, { headers: corsHeaders });
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}
