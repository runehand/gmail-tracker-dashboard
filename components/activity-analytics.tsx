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
  const maxSent = Math.max(...data.map((item) => item.sent), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid items-end gap-3 border-b pb-3" style={{ gridTemplateColumns: `72px repeat(${data.length}, minmax(92px, 1fr))` }}>
                <div className="flex h-64 flex-col justify-between text-right text-[11px] text-muted-foreground">
                  <span>{maxSent}</span>
                  <span>{Math.round(maxSent / 2)}</span>
                  <span>0</span>
                </div>
                {data.map((item) => {
                  const sentHeight = Math.max(4, (item.sent / maxSent) * 240);
                  const receiverHeight = item.sent ? Math.max(0, Math.min(sentHeight, (item.receiverOpens / item.sent) * sentHeight)) : 0;

                  return (
                    <details key={item.email} className="group relative">
                      <summary className="grid cursor-pointer list-none justify-items-center gap-2">
                        <div className="relative flex h-64 w-full items-end justify-center rounded-md bg-muted/40 px-3 pb-2 pt-4 hover:ring-2 hover:ring-primary/40">
                          <div className="relative w-10 overflow-hidden rounded-t-md bg-primary/75" style={{ height: `${sentHeight}px` }}>
                            <div className="absolute bottom-0 left-0 right-0 bg-emerald-500" style={{ height: `${receiverHeight}px` }} />
                          </div>
                          <div className="absolute top-2 text-xs font-semibold">{item.sent}</div>
                          <div className="absolute bottom-2 text-[10px] font-semibold text-white drop-shadow">{item.receiverOpens}</div>
                        </div>
                        <div className="h-10 w-full truncate text-center text-xs font-medium" title={item.email}>{item.email}</div>
                        <div className="text-center text-[11px] text-muted-foreground">{item.viewed} viewed</div>
                      </summary>
                      <div className="absolute z-20 mt-2 w-80 rounded-lg border bg-card p-3 text-xs shadow-xl">
                        <div className="font-semibold">{item.email}</div>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          <MiniMetric label="Sent" value={item.sent} />
                          <MiniMetric label="Viewed" value={item.viewed} />
                          <MiniMetric label="Opens" value={item.receiverOpens} />
                        </div>
                        <div className="mt-3 max-h-56 space-y-2 overflow-auto">
                          {item.emails.map((email) => (
                            <Link key={email.id} href={`/tracks/${email.id}`} className="block rounded border p-2 hover:bg-muted">
                              <div className="truncate font-medium">{email.subject}</div>
                              <div className="truncate text-muted-foreground">To {email.recipientEmail}</div>
                              <div className="mt-1 text-muted-foreground">{email.openCount} receiver opens</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </details>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-4 text-xs text-muted-foreground">
                <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-primary/75" />Sent total height</span>
                <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />Receiver opens</span>
              </div>
            </div>
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

function Empty({ label }: { label: string }) {
  return <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">{label}</div>;
}
