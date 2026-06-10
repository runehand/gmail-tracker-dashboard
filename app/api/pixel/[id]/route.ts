import { NextRequest } from "next/server";
import { recordOpen } from "@/lib/db";

export const runtime = "nodejs";

const trackingImage = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGjSURBVHhe7dGhFYBAEMTQa4R+6L8DiuAhwec8WRHxzcjJuo7zzRyLQ1wFGaYgw2xB3vvJj/h/QWT8vyAy/l8QGf8viIz/F0TG/wsi4/8FkfH/gsj4f0Fk/L8gMv5fEBn/L4iM/xdExv8LIuP/BZHx/4LI+H9BZPy/IDL+XxAZ/y+IjP8XRMb/CyLj/wWR8f+CyPh/QWT8vyAy/l8QGf8viIz/F0TG/wsi4/8FkfH/gsj4f0Fk/L8gMv5fEBn/L4iM/xdExv8LIuP/BZHx/4LI+H9BZPy/IDL+XxAZ/y+IjP8XRMb/CyLj/wWR8f+CyPh/QWT8vyAy/l8QGf8viIz/F0TG/wsi4/8FkfH/gsj4f0Fk/L8gMv5fEBn/L4iM/xdExv8LIuP/BZHx/4LI+H9BZPy/IDL+XxAZ/y+IjP8XRMb/CyLj/wWR8f+CyPh/QWT8vyAy/l8QGf8viIz/F0TG/wsi4/8FkfH/gsj4f0Fk/L8gMv5fEBn/L4iM/xdExv8LIuP/BZHx/4LI+H9BZPy/IDL+XxAZ/9+CxFWQYQoyTEGG+QBNsA8CZlYdzAAAAABJRU5ErkJggg==",
  "base64"
);

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trackId = id.replace(/\.(gif|png|jpe?g|webp)$/i, "");
  const userAgent = request.headers.get("user-agent");
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip");
  await recordOpen(trackId, userAgent, ip);

  return new Response(trackingImage, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="${trackId}.png"`,
      "Content-Length": String(trackingImage.length),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0"
    }
  });
}
