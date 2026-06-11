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
