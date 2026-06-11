"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Stats } from "@/lib/types";

type HeatmapData = Stats["emailTimeActivity"];
type HeatmapRow = HeatmapData["rows"][number];
type HeatmapCell = HeatmapRow["cells"][number];

export function ActivityAnalytics({ stats }: { stats: Stats }) {
  return (
    <section className="space-y-4">
      <EmailTimeHeatmap data={stats.emailTimeActivity} />
      <TodayActivity data={stats.todayEmailActivity} />
    </section>
  );
}

function EmailTimeHeatmap({ data }: { data: HeatmapData }) {
  const max = Math.max(...data.rows.flatMap((row) => row.cells.map((cell) => Math.max(cell.sent, cell.receiverOpens))), 1);
  const firstActive = useMemo(() => {
    for (const row of data.rows) {
      const cell = row.cells.find((item) => item.sent || item.receiverOpens);
      if (cell) return `${row.email}|${cell.time}`;
    }
    return data.rows[0]?.cells[0] ? `${data.rows[0].email}|${data.rows[0].cells[0].time}` : "";
  }, [data.rows]);
  const [selectedKey, setSelectedKey] = useState(firstActive);

  const selected = useMemo(() => {
    const [email, time] = selectedKey.split("|");
    const row = data.rows.find((item) => item.email === email) ?? data.rows[0];
    const cell = row?.cells.find((item) => item.time === time) ?? row?.cells[0];
    return row && cell ? { row, cell } : null;
  }, [data.rows, selectedKey]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Activity by Time</CardTitle>
      </CardHeader>
      <CardContent>
        {data.rows.length ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <div className="min-w-[840px] space-y-2">
                <div className="grid items-center gap-2" style={{ gridTemplateColumns: `220px repeat(${data.timeLabels.length}, minmax(38px, 1fr))` }}>
                  <div />
                  {data.timeLabels.map((label) => (
                    <div key={label} className="truncate text-center text-[11px] text-muted-foreground" title={label}>
                      {label.slice(5)}
                    </div>
                  ))}
                </div>
                {data.rows.map((row) => (
                  <div key={row.email} className="grid items-center gap-2" style={{ gridTemplateColumns: `220px repeat(${data.timeLabels.length}, minmax(38px, 1fr))` }}>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium" title={row.email}>{row.email}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{row.totalSent} sent / {row.totalViewed} viewed / {row.totalReceiverOpens} opens</div>
                    </div>
                    {row.cells.map((cell) => {
                      const key = `${row.email}|${cell.time}`;
                      const isSelected = key === selectedKey;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedKey(key)}
                          className={`h-10 rounded border text-center text-[11px] transition hover:ring-2 hover:ring-primary/40 ${cell.sent || cell.receiverOpens ? heatColor(cell, max) : "bg-muted/40 text-muted-foreground"} ${isSelected ? "ring-2 ring-primary" : ""}`}
                          title={`${row.email} / ${cell.time}: ${cell.sent} sent, ${cell.viewed} viewed, ${cell.receiverOpens} opens`}
                        >
                          {cell.sent || cell.receiverOpens ? `${cell.sent}/${cell.receiverOpens}` : ""}
                        </button>
                      );
                    })}
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
            <HeatmapDetail selected={selected} />
          </div>
        ) : (
          <Empty label="No sent email activity yet" />
        )}
      </CardContent>
    </Card>
  );
}

function HeatmapDetail({ selected }: { selected: { row: HeatmapRow; cell: HeatmapCell } | null }) {
  if (!selected) {
    return <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">Select a cell to inspect activity.</div>;
  }

  const { row, cell } = selected;
  return (
    <div className="rounded-lg border bg-muted/25 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{row.email}</div>
          <div className="text-sm text-muted-foreground">{cell.time}</div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <MiniMetric label="Sent" value={cell.sent} />
          <MiniMetric label="Viewed" value={cell.viewed} />
          <MiniMetric label="Opens" value={cell.receiverOpens} />
        </div>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {cell.emails.length ? cell.emails.map((email) => (
          <Link key={email.id} href={`/tracks/${email.id}`} className="rounded border bg-card p-3 text-sm hover:bg-muted">
            <div className="truncate font-medium">{email.subject}</div>
            <div className="truncate text-xs text-muted-foreground">To {email.recipientEmail}</div>
            <div className="mt-2 text-xs text-muted-foreground">{email.openCount} receiver opens</div>
          </Link>
        )) : (
          <div className="rounded border bg-card p-4 text-sm text-muted-foreground">No emails for this sender and date.</div>
        )}
      </div>
    </div>
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
            <div className="min-w-[560px]">
              <div className="grid items-end gap-3 border-b pb-3" style={{ gridTemplateColumns: `40px repeat(${data.length}, minmax(88px, 1fr))` }}>
                <div className="flex h-48 flex-col justify-between text-right text-[11px] text-muted-foreground">
                  <span>{maxSent}</span>
                  <span>{Math.round(maxSent / 2)}</span>
                  <span>0</span>
                </div>
                {data.map((item) => {
                  const sentHeight = Math.max(4, (item.sent / maxSent) * 176);
                  const viewedHeight = item.sent ? Math.max(0, Math.min(sentHeight, (item.viewed / item.sent) * sentHeight)) : 0;

                  return (
                    <div key={item.email} className="grid justify-items-center gap-2">
                      <div className="relative flex h-48 w-full items-end justify-center rounded-md bg-muted/30 px-2 pb-2 pt-4" title={`${item.email}: ${item.sent} sent, ${item.viewed} viewed`}>
                        <div className="relative w-10 overflow-hidden rounded-t-md bg-primary/75" style={{ height: `${sentHeight}px` }}>
                          <div className="absolute bottom-0 left-0 right-0 bg-amber-300" style={{ height: `${viewedHeight}px` }} />
                        </div>
                        <div className="absolute top-2 text-xs font-semibold">{item.sent}</div>
                        {item.viewed > 0 && (
                          <div className="absolute bottom-2 text-[10px] font-semibold text-amber-950">{item.viewed}</div>
                        )}
                      </div>
                      <div className="h-10 w-full truncate text-center text-xs font-medium" title={item.email}>{item.email}</div>
                      <div className="text-center text-[11px] text-muted-foreground">{item.viewed} viewed</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-4 text-xs text-muted-foreground">
                <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-primary/75" />Sent total height</span>
                <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-300" />Receiver viewed</span>
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

function heatColor(cell: HeatmapCell, max: number) {
  const value = Math.max(cell.sent, cell.receiverOpens);
  const ratio = value / max;
  if (ratio >= 0.75) return "bg-emerald-700 text-white border-emerald-800";
  if (ratio >= 0.5) return "bg-emerald-500 text-white border-emerald-600";
  if (ratio >= 0.25) return "bg-emerald-300 text-emerald-950 border-emerald-400";
  return "bg-emerald-100 text-emerald-950 border-emerald-200";
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded bg-background p-2 text-center">
      <div className="font-semibold">{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">{label}</div>;
}
