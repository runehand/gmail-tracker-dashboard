import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Track } from "@/lib/types";

export function EmailTable({ tracks }: { tracks: Track[] }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Recipient</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Opens</th>
            <th className="px-4 py-3">Last open</th>
            <th className="px-4 py-3">Device</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track) => (
            <tr key={track.id} className="border-t">
              <td className="max-w-[320px] px-4 py-3">
                <div className="truncate font-medium">{track.subject || "(No subject)"}</div>
                <div className="truncate text-xs text-muted-foreground">{track.senderEmail}</div>
              </td>
              <td className="px-4 py-3">{track.recipientEmail}</td>
              <td className="px-4 py-3">
                <Badge variant={track.status === "opened" ? "default" : "secondary"}>
                  {track.status === "opened" ? "Opened" : "Unread"}
                </Badge>
              </td>
              <td className="px-4 py-3">{track.openCount}</td>
              <td className="px-4 py-3">{formatDate(track.lastOpenedAt)}</td>
              <td className="px-4 py-3">{track.lastDevice ?? "Unknown"}</td>
            </tr>
          ))}
          {!tracks.length && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                Send a tracked Gmail message to start collecting activity.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
