import { Badge } from "@/components/ui/badge";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import type { Track } from "@/lib/types";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export function EmailTable({ tracks }: { tracks: Track[] }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Recipient</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Views</th>
            <th className="px-4 py-3">Opens</th>
            <th className="px-4 py-3">Last activity</th>
            <th className="px-4 py-3">Device</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track) => (
            <tr key={track.id} className="border-t">
              <td className="px-4 py-3">
                <div className="font-medium">{track.recipientEmail}</div>
                <div className="text-xs text-muted-foreground">from {track.senderEmail}</div>
              </td>
              <td className="max-w-[320px] px-4 py-3">
                <Link href={`/tracks/${track.id}`} className="block truncate font-medium text-primary hover:underline">
                  {track.subject || "(No subject)"}
                </Link>
                <div className="truncate text-xs text-muted-foreground">{track.id}</div>
              </td>
              <td className="px-4 py-3">
                <Badge variant={track.status === "opened" ? "default" : "secondary"} className="gap-1.5">
                  {track.status === "opened" ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  {track.status === "opened" ? "Viewed" : "No view"}
                </Badge>
              </td>
              <td className="px-4 py-3">{track.openCount}</td>
              <td className="px-4 py-3">
                <div>{formatRelativeTime(track.lastOpenedAt)}</div>
                <div className="text-xs text-muted-foreground">{formatDate(track.lastOpenedAt)}</div>
                {track.selfOpenCount > 0 && (
                  <div className="text-xs text-muted-foreground">{track.selfOpenCount} non-receiver requests</div>
                )}
              </td>
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
