import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Stats } from "@/lib/types";

export function ActivityAnalytics({ stats }: { stats: Stats }) {
  return (
    <section className="space-y-4">
      <EmailTimeHeatmap data={stats.emailTimeActivity} />
      <TodayActivity data={stats.todayEmailActivity} />
    </section>
  );
}

function EmailTimeHeatmap({ data }: { data: Stats["emailTimeActivity"] }) {
  const max = Math.max(...data.rows.flatMap((row) => row.cells.map((cell) => Math.max(cell.sent, cell.receiverOpens))), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Activity by Time</CardTitle>
      </CardHeader>
      <CardContent>
        {data.rows.length ? (
          <div className="overflow-x-auto">
            <div className="min-w-[920px] space-y-2">
              <div className="grid items-center gap-2" style={{ gridTemplateColumns: `220px repeat(${data.timeLabels.length}, minmax(42px, 1fr)) 132px` }}>
                <div />
                {data.timeLabels.map((label) => (
                  <div key={label} className="truncate text-center text-[11px] text-muted-foreground" title={label}>
                    {label.slice(5)}
                  </div>
                ))}
                <div className="text-right text-[11px] text-muted-foreground">Totals</div>
              </div>
              {data.rows.map((row) => (
                <div key={row.email} className="grid items-center gap-2" style={{ gridTemplateColumns: `220px repeat(${data.timeLabels.length}, minmax(42px, 1fr)) 132px` }}>
                  <div className="truncate text-sm font-medium" title={row.email}>{row.email}</div>
                  {row.cells.map((cell) => (
                    <details key={`${row.email}-${cell.time}`} className="group relative">
                      <summary
                        className={`block h-10 cursor-pointer list-none rounded border text-center text-[11px] leading-10 transition hover:ring-2 hover:ring-primary/40 ${cell.sent || cell.receiverOpens ? heatColor(cell, max) : "bg-muted/40 text-muted-foreground"}`}
                        title={`${row.email} / ${cell.time}: ${cell.sent} sent, ${cell.viewed} viewed, ${cell.receiverOpens} opens`}
                      >
                        {cell.sent || cell.receiverOpens ? `${cell.sent}/${cell.receiverOpens}` : ""}
                      </summary>
                      <div className="absolute z-20 mt-2 w-80 rounded-lg border bg-card p-3 text-xs shadow-xl">
                        <div className="font-semibold">{row.email}</div>
                        <div className="mt-1 text-muted-foreground">{cell.time}</div>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          <MiniMetric label="Sent" value={cell.sent} />
                          <MiniMetric label="Viewed" value={cell.viewed} />
                          <MiniMetric label="Opens" value={cell.receiverOpens} />
                        </div>
                        <div className="mt-3 max-h-56 space-y-2 overflow-auto">
                          {cell.emails.length ? cell.emails.map((email) => (
                            <Link key={email.id} href={`/tracks/${email.id}`} className="block rounded border p-2 hover:bg-muted">
                              <div className="truncate font-medium">{email.subject}</div>
                              <div className="truncate text-muted-foreground">To {email.recipientEmail}</div>
                              <div className="mt-1 text-muted-foreground">{email.openCount} receiver opens</div>
                            </Link>
                          )) : (
                            <div className="rounded border p-3 text-center text-muted-foreground">No emails for this time.</div>
                          )}
                        </div>
                      </div>
                    </details>
                  ))}
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{row.totalSent} sent</div>
                    <div>{row.totalViewed} viewed</div>
                    <div>{row.totalReceiverOpens} opens</div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-end gap-2 pt-2 text-xs text-muted-foreground">
                <span>Less</span>
                <span className="h-3 w-3 rounded bg-muted/40" />
                <span className="h-3 w-3 rounded bg-emerald-100" />
                <span className="h-3 w-3 rounded bg-emerald-300" />
                <span className="h-3 w-3 rounded bg-emerald-500" />
                <span className="h-3 w-3 rounded bg-emerald-700" />
                <span>More</span>
              </div>
            </div>
          </div>
        ) : (
          <Empty label="No sent email activity yet" />
        )}
      </CardContent>
    </Card>
  );
}

function TodayActivity({ data }: { data: Stats["todayEmailActivity"] }) {
  const max = Math.max(...data.map((item) => Math.max(item.sent, item.receiverOpens)), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <div className="space-y-4">
            {data.map((item) => (
              <details key={item.email} className="rounded-lg border p-3">
                <summary className="cursor-pointer list-none">
                  <div className="grid gap-2 md:grid-cols-[220px_1fr_96px] md:items-center">
                    <div className="truncate font-medium" title={item.email}>{item.email}</div>
                    <div className="grid gap-1">
                      <Bar label="Sent" value={item.sent} max={max} tone="primary" />
                      <Bar label="Receiver opens" value={item.receiverOpens} max={max} tone="accent" />
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>{item.viewed} viewed</div>
                      <div>{item.sent - item.viewed} no view</div>
                    </div>
                  </div>
                </summary>
                <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {item.emails.map((email) => (
                    <Link key={email.id} href={`/tracks/${email.id}`} className="rounded border p-3 text-sm hover:bg-muted">
                      <div className="truncate font-medium">{email.subject}</div>
                      <div className="truncate text-xs text-muted-foreground">To {email.recipientEmail}</div>
                      <div className="mt-2 text-xs text-muted-foreground">{email.openCount} receiver opens</div>
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </div>
        ) : (
          <Empty label="No emails sent today" />
        )}
      </CardContent>
    </Card>
  );
}

function heatColor(cell: Stats["emailTimeActivity"]["rows"][number]["cells"][number], max: number) {
  const value = Math.max(cell.sent, cell.receiverOpens);
  const ratio = value / max;
  if (ratio >= 0.75) return "bg-emerald-700 text-white border-emerald-800";
  if (ratio >= 0.5) return "bg-emerald-500 text-white border-emerald-600";
  if (ratio >= 0.25) return "bg-emerald-300 text-emerald-950 border-emerald-400";
  return "bg-emerald-100 text-emerald-950 border-emerald-200";
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded bg-muted p-2 text-center">
      <div className="font-semibold">{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}

function Bar({ label, value, max, tone }: { label: string; value: number; max: number; tone: "primary" | "accent" }) {
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
