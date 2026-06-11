import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Stats } from "@/lib/types";

export function ActivityAnalytics({ stats }: { stats: Stats }) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <SentByDayChart data={stats.dailySent} />
      <SenderPerformance data={stats.senderPerformance} />
      <SentByHourChart data={stats.hourlySent} />
      <RecipientPerformance data={stats.recipientPerformance} />
    </section>
  );
}

function SentByDayChart({ data }: { data: Stats["dailySent"] }) {
  const max = Math.max(...data.map((item) => Math.max(item.sent, item.receiverOpens)), 1);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Emails Sent by Day</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <div className="space-y-3">
            {data.map((item) => (
              <div key={item.date} className="grid gap-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{item.date}</span>
                  <span>{item.sent} sent / {item.opened} viewed / {item.receiverOpens} opens</span>
                </div>
                <div className="grid gap-1">
                  <MetricBar label="Sent" value={item.sent} max={max} tone="primary" />
                  <MetricBar label="Receiver opens" value={item.receiverOpens} max={max} tone="accent" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty label="No sent emails yet" />
        )}
      </CardContent>
    </Card>
  );
}

function SentByHourChart({ data }: { data: Stats["hourlySent"] }) {
  const max = Math.max(...data.map((item) => Math.max(item.sent, item.receiverOpens)), 1);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Emails Sent by Time</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <div className="flex h-52 items-end gap-1">
            {data.map((item) => (
              <div key={item.hour} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-col justify-end gap-0.5 rounded-t bg-muted p-0.5" style={{ height: 160 }}>
                  <div className="rounded-sm bg-accent" style={{ height: `${Math.max(2, (item.receiverOpens / max) * 150)}px` }} title={`${item.receiverOpens} receiver opens`} />
                  <div className="rounded-sm bg-primary" style={{ height: `${Math.max(2, (item.sent / max) * 150)}px` }} title={`${item.sent} sent`} />
                </div>
                <span className="w-full truncate text-center text-[10px] text-muted-foreground">{item.hour.slice(11)}</span>
              </div>
            ))}
          </div>
        ) : (
          <Empty label="No hourly sent data yet" />
        )}
      </CardContent>
    </Card>
  );
}

function SenderPerformance({ data }: { data: Stats["senderPerformance"] }) {
  const max = Math.max(...data.map((item) => item.sent), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sent by Sender Email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length ? data.map((item) => (
          <div key={item.senderEmail} className="space-y-1.5">
            <div className="flex justify-between gap-3 text-sm">
              <span className="truncate font-medium">{item.senderEmail}</span>
              <span className="text-muted-foreground">{item.sent}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(4, (item.sent / max) * 100)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{item.opened} viewed</span>
              <span>{item.receiverOpens} receiver opens</span>
              <span>{item.openRate}%</span>
            </div>
          </div>
        )) : (
          <Empty label="No sender data yet" />
        )}
      </CardContent>
    </Card>
  );
}

function RecipientPerformance({ data }: { data: Stats["recipientPerformance"] }) {
  const max = Math.max(...data.map((item) => item.sent), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Recipient Emails</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length ? data.map((item) => (
          <div key={item.recipientEmail} className="space-y-1.5">
            <div className="flex justify-between gap-3 text-sm">
              <span className="truncate font-medium">{item.recipientEmail}</span>
              <span className="text-muted-foreground">{item.sent}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-accent" style={{ width: `${Math.max(4, (item.sent / max) * 100)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{item.opened} viewed</span>
              <span>{item.receiverOpens} opens</span>
            </div>
          </div>
        )) : (
          <Empty label="No recipient data yet" />
        )}
      </CardContent>
    </Card>
  );
}

function MetricBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: "primary" | "accent" }) {
  return (
    <div className="grid grid-cols-[104px_1fr_36px] items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="h-2 rounded-full bg-muted">
        <div className={`h-2 rounded-full ${tone === "primary" ? "bg-primary" : "bg-accent"}`} style={{ width: `${Math.max(3, (value / max) * 100)}%` }} />
      </div>
      <span className="text-right text-muted-foreground">{value}</span>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">{label}</div>;
}
