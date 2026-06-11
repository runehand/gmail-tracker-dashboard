import { NextResponse } from "next/server";
import { markSenderView } from "@/lib/db";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: { detectedAt?: unknown; senderEmail?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  if (!body.senderEmail) {
    return NextResponse.json({ error: "senderEmail is required" }, { status: 400, headers: corsHeaders });
  }

  const track = await markSenderView(id, String(body.senderEmail), typeof body.detectedAt === "string" ? body.detectedAt : undefined);
  if (!track) {
    return NextResponse.json({ error: "Not found or sender mismatch" }, { status: 404, headers: corsHeaders });
  }

  return NextResponse.json({ track }, { headers: corsHeaders });
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}
