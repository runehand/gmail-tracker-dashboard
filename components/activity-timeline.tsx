import { Eye, ShieldOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import type { OpenEvent } from "@/lib/types";

export function ActivityTimeline({ events }: { events: OpenEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Open History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex gap-3 rounded-lg border p-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                {event.ignored ? <ShieldOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-primary" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-medium">{eventLabel(event)}</div>
                  {event.requestIndex && <Badge variant="outline">#{event.requestIndex}</Badge>}
                  <Badge variant={event.ignored ? "secondary" : "default"}>{event.deviceType}</Badge>
                  <Badge variant="outline">{event.client}</Badge>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {formatRelativeTime(event.openedAt)} · {formatDate(event.openedAt)}
                </div>
                {event.ip && <div className="mt-1 text-xs text-muted-foreground">IP: {event.ip}</div>}
                <details className="mt-3 rounded-md border bg-muted/30 p-3 text-xs">
                  <summary className="cursor-pointer font-medium text-foreground">Request details</summary>
                  <dl className="mt-3 grid gap-2 md:grid-cols-2">
                    <RequestDetail label="Method" value={event.method} />
                    <RequestDetail label="URL" value={event.url} wide />
                    <RequestDetail label="Referer" value={event.referer} wide />
                    <RequestDetail label="Origin" value={event.origin} />
                    <RequestDetail label="Accept" value={event.accept} wide />
                    <RequestDetail label="Accept language" value={event.acceptLanguage} />
                    <RequestDetail label="User agent" value={event.userAgent} wide />
                  </dl>
                  {event.headers && (
                    <div className="mt-3">
                      <div className="mb-2 font-medium text-foreground">Headers</div>
                      <div className="max-h-56 overflow-auto rounded border bg-background p-2">
                        {Object.entries(event.headers).map(([key, value]) => (
                          <div key={key} className="grid gap-1 border-b py-1 last:border-b-0 md:grid-cols-[160px_1fr]">
                            <span className="font-medium text-muted-foreground">{key}</span>
                            <span className="break-all">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </details>
              </div>
            </div>
          ))}
          {!events.length && (
            <div className="rounded-lg border px-4 py-10 text-center text-sm text-muted-foreground">No open activity recorded yet.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function eventLabel(event: OpenEvent) {
  if (event.ignoredReason === "initial_system") return "Initial system request";
  if (event.ignoredReason === "sender_view") return "Sender activity";
  return "Receiver activity";
}

function RequestDetail({ label, value, wide }: { label: string; value?: string | null; wide?: boolean }) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-all">{value || "Unknown"}</dd>
    </div>
  );
}
