import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Mail, MailOpen } from "lucide-react";
import { EmailTable } from "@/components/email-table";
import { MetricCard } from "@/components/metric-card";
import { Button } from "@/components/ui/button";
import { getTracks } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SenderPage({ params }: { params: Promise<{ sender: string }> }) {
  const { sender } = await params;
  const senderEmail = decodeURIComponent(sender);
  const tracks = (await getTracks()).filter((track) => track.senderEmail === senderEmail);
  if (!tracks.length) notFound();

  const opened = tracks.filter((track) => track.openCount > 0).length;
  const totalOpens = tracks.reduce((sum, track) => sum + track.openCount, 0);
  const openRate = Math.round((opened / tracks.length) * 100);

  return (
    <main className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">{senderEmail}</h1>
            <p className="text-sm text-muted-foreground">Tracked emails and recipient activity for this sender.</p>
          </div>
          <Button asChild variant="secondary"><Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Dashboard</Link></Button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Emails" value={tracks.length} icon={Mail} detail="Tracked from this sender" />
          <MetricCard title="Viewed" value={opened} icon={MailOpen} detail={`${tracks.length - opened} with no view`} />
          <MetricCard title="Open rate" value={`${openRate}%`} icon={Eye} detail="Unique emails viewed" />
          <MetricCard title="Total opens" value={totalOpens} icon={Eye} detail="Recipient opens only" />
        </section>
        <EmailTable tracks={tracks} />
      </div>
    </main>
  );
}
