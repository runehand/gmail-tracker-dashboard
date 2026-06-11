import Link from "next/link";
import { Eye, EyeOff, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";

type SenderSummary = {
  senderEmail: string;
  total: number;
  opened: number;
  unopened: number;
  openRate: number;
  totalOpens: number;
  lastOpenedAt: string | null;
};

export function SenderTable({ senders }: { senders: SenderSummary[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Senders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Sender</th>
                <th className="px-4 py-3">Emails</th>
                <th className="px-4 py-3">Viewed</th>
                <th className="px-4 py-3">Open rate</th>
                <th className="px-4 py-3">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {senders.map((sender) => (
                <tr key={sender.senderEmail} className="border-t">
                  <td className="px-4 py-3">
                    <Link className="font-medium text-primary hover:underline" href={`/senders/${encodeURIComponent(sender.senderEmail)}`}>
                      {sender.senderEmail}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="gap-1.5"><Mail className="h-3.5 w-3.5" />{sender.total}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Badge className="gap-1.5"><Eye className="h-3.5 w-3.5" />{sender.opened}</Badge>
                      <Badge variant="secondary" className="gap-1.5"><EyeOff className="h-3.5 w-3.5" />{sender.unopened}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">{sender.openRate}%</td>
                  <td className="px-4 py-3">{formatRelativeTime(sender.lastOpenedAt)}</td>
                </tr>
              ))}
              {!senders.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No senders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
