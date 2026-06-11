import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Stats } from "@/lib/types";

export function ActivityAnalytics({ stats }: { stats: Stats }) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <StackedActivityChart data={stats.dailyRequests} />
      <CompactBars title="Request Types" data={stats.requestTypeBreakdown} />
      <CompactBars title="Clients" data={stats.clientBreakdown} />
      <HourlyActivity data={stats.hourlyRequests} />
      <CompactBars title="Receiver Devices" data={stats.deviceBreakdown} />
    </section>
  );
}

function StackedActivityChart({ data }: { data: Stats["dailyRequests"] }) {
  const max = Math.max(...data.map((item) => item.raw), 1);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Open Activity Detail</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <div className="space-y-3">
            {data.map((item) => (
              <div key={item.date} className="grid gap-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{item.date}</span>
                  <span>{item.raw} raw / {item.receiver} receiver</span>
                </div>
                <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                  <div className="bg-primary" style={{ width: `${(item.receiver / max) * 100}%` }} title={`Receiver ${item.receiver}`} />
                  <div className="bg-accent" style={{ width: `${(item.sender / max) * 100}%` }} title={`Sender ${item.sender}`} />
                  <div className="bg-secondary" style={{ width: `${(item.system / max) * 100}%` }} title={`System ${item.system}`} />
                </div>
              </div>
            ))}
            <Legend />
          </div>
        ) : (
          <Empty label="No activity yet" />
        )}
      </CardContent>
    </Card>
  );
}

function HourlyActivity({ data }: { data: Stats["hourlyRequests"] }) {
  const max = Math.max(...data.map((item) => item.raw), 1);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Last 24 Hours</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <div className="flex h-48 items-end gap-1">
            {data.map((item) => (
              <div key={item.hour} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-col justify-end overflow-hidden rounded-t bg-muted" style={{ height: 150 }}>
                  <div className="bg-secondary" style={{ height: `${(item.system / max) * 150}px` }} />
                  <div className="bg-accent" style={{ height: `${(item.sender / max) * 150}px` }} />
                  <div className="bg-primary" style={{ height: `${(item.receiver / max) * 150}px` }} />
                </div>
                <span className="w-full truncate text-center text-[10px] text-muted-foreground">{item.hour.slice(11)}</span>
              </div>
            ))}
          </div>
        ) : (
          <Empty label="No hourly activity yet" />
        )}
      </CardContent>
    </Card>
  );
}

function CompactBars({ title, data }: { title: string; data: { label: string; value: number }[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length ? data.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between gap-2 text-sm">
              <span className="truncate">{item.label}</span>
              <span className="text-muted-foreground">{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(3, (item.value / total) * 100)}%` }} />
            </div>
          </div>
        )) : (
          <Empty label="No data yet" />
        )}
      </CardContent>
    </Card>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-primary" />Receiver</span>
      <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-accent" />Sender</span>
      <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-secondary" />System</span>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">{label}</div>;
}
