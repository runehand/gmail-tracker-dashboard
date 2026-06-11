import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, MailOpen, ShieldOff, Smartphone } from "lucide-react";
import { ActivityTimeline } from "@/components/activity-timeline";
import { DeviceChart } from "@/components/device-chart";
import { MetricCard } from "@/components/metric-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEvents, getTrack } from "@/lib/db";
import { summarizeTrackEvents } from "@/lib/analytics";
import { formatDate, formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [track, events] = await Promise.all([getTrack(id), getEvents(id)]);
  if (!track) notFound();

  const summary = summarizeTrackEvents(events);

  return (
    <main className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">{track.subject || "(No subject)"}</h1>
            <p className="text-sm text-muted-foreground">To {track.recipientEmail} · From {track.senderEmail}</p>
          </div>
          <Button asChild variant="secondary">
            <Link href={`/senders/${encodeURIComponent(track.senderEmail)}`}><ArrowLeft className="mr-2 h-4 w-4" />Sender</Link>
          </Button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Recipient opens" value={track.openCount} icon={Eye} detail={track.openCount ? `Last ${formatRelativeTime(track.lastOpenedAt)}` : "No views yet"} />
          <MetricCard title="Sender views ignored" value={track.selfOpenCount} icon={ShieldOff} detail="Removed from recipient count" />
          <MetricCard title="Last device" value={track.lastDevice ?? "Unknown"} icon={Smartphone} detail={track.lastClient ?? "No client yet"} />
          <MetricCard title="Status" value={track.status === "opened" ? "Viewed" : "No view"} icon={MailOpen} detail={formatDate(track.lastOpenedAt)} />
        </section>
        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Email Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm md:grid-cols-2">
              <Detail label="Recipient" value={track.recipientEmail} />
              <Detail label="Sender" value={track.senderEmail} />
              <Detail label="Sent" value={formatDate(track.sentAt)} />
              <Detail label="Tracking ID" value={track.id} />
              <div className="md:col-span-2">
                <Badge variant={track.status === "opened" ? "default" : "secondary"}>{track.status === "opened" ? "Recipient viewed" : "No recipient view"}</Badge>
              </div>
            </CardContent>
          </Card>
          <DeviceChart data={summary.deviceBreakdown} />
        </section>
        <ActivityTimeline events={events} />
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 break-words font-medium">{value}</div>
    </div>
  );
}
