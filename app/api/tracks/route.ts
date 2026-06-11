import { NextRequest, NextResponse } from "next/server";
import { createTrack, getTracks } from "@/lib/db";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function absoluteBaseUrl(request: NextRequest) {
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const host = request.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function GET() {
  return NextResponse.json({ tracks: await getTracks() }, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.senderEmail || !body?.recipientEmail) {
    return NextResponse.json({ error: "senderEmail and recipientEmail are required" }, { status: 400, headers: corsHeaders });
  }

  const track = await createTrack({
    senderEmail: String(body.senderEmail),
    recipientEmail: String(body.recipientEmail),
    subject: body.subject ? String(body.subject) : "",
    bodyHtml: body.bodyHtml ? String(body.bodyHtml) : "",
    bodyText: body.bodyText ? String(body.bodyText) : "",
    gmailMessageKey: body.gmailMessageKey ? String(body.gmailMessageKey) : undefined,
    sentAt: body.sentAt ? String(body.sentAt) : undefined,
    sent: typeof body.sent === "boolean" ? body.sent : false
  });

  if (!track) {
    return NextResponse.json({ error: "Unable to create tracking record" }, { status: 500, headers: corsHeaders });
  }

  return NextResponse.json({
    track,
    pixelUrl: `${absoluteBaseUrl(request)}/api/pixel/${track.id}.png`
  }, {
    headers: corsHeaders
  });
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}
