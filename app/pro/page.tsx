import { Activity, Eye, Mail, MailOpen } from "lucide-react";
import { ActivityAnalytics } from "@/components/activity-analytics";
import { EmailTable } from "@/components/email-table";
import { MetricCard } from "@/components/metric-card";
import { PasswordGate } from "@/components/password-gate";
import { SenderTable } from "@/components/sender-table";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/brand-mark";
import { summarizeSenders } from "@/lib/analytics";
import { getStats, getTracks } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProDashboardPage() {
  const [stats, tracks] = await Promise.all([getStats(), getTracks()]);
  const senders = summarizeSenders(tracks);

  return (
    <PasswordGate storageKey="gt_pro_unlocked" password="hl" title="Pro Dashboard" description="Enter the Pro password to view analytics.">
      <main className="min-h-screen">
        <header className="border-b bg-card">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <BrandMark />
              <div>
                <h1 className="text-xl font-semibold">Gmail Tracker Pro</h1>
                <p className="text-sm text-muted-foreground">Sent email volume, sender usage, and receiver view performance.</p>
              </div>
            </div>
            <Badge variant="outline">Tracking Pixel Backend</Badge>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Tracked emails" value={stats.total} icon={Mail} detail="Messages created by the extension" />
            <MetricCard title="Opened" value={stats.opened} icon={MailOpen} detail={`${stats.unopened} still unread`} />
            <MetricCard title="Open rate" value={`${stats.openRate}%`} icon={Eye} detail="Unique emails with at least one open" />
            <MetricCard title="Receiver opens" value={stats.totalOpens} icon={Activity} detail="Receiver activity only" />
          </section>

          <ActivityAnalytics stats={stats} />

          <SenderTable senders={senders} />

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">Tracked Emails</h2>
              <p className="text-sm text-muted-foreground">Status updates when the email tracking image is requested.</p>
            </div>
            <EmailTable tracks={tracks} />
          </section>
        </div>
      </main>
    </PasswordGate>
  );
}
