import type { OpenEvent, Track } from "./types";

export function summarizeSenders(tracks: Track[]) {
  const map = new Map<string, Track[]>();
  for (const track of tracks) {
    const items = map.get(track.senderEmail) ?? [];
    items.push(track);
    map.set(track.senderEmail, items);
  }

  return Array.from(map.entries())
    .map(([senderEmail, senderTracks]) => {
      const opened = senderTracks.filter((track) => track.openCount > 0).length;
      const totalOpens = senderTracks.reduce((sum, track) => sum + track.openCount, 0);
      const lastOpenedAt = senderTracks
        .map((track) => track.lastOpenedAt)
        .filter(Boolean)
        .sort()
        .at(-1) ?? null;

      return {
        senderEmail,
        total: senderTracks.length,
        opened,
        unopened: senderTracks.length - opened,
        openRate: senderTracks.length ? Math.round((opened / senderTracks.length) * 100) : 0,
        totalOpens,
        lastOpenedAt
      };
    })
    .sort((a, b) => b.total - a.total || a.senderEmail.localeCompare(b.senderEmail));
}

export function summarizeTrackEvents(events: OpenEvent[]) {
  const counted = events.filter((event) => !event.ignored);
  const ignored = events.filter((event) => event.ignored);
  const deviceMap = new Map<string, number>();

  for (const event of counted) {
    deviceMap.set(event.deviceType, (deviceMap.get(event.deviceType) ?? 0) + 1);
  }

  return {
    counted,
    ignored,
    deviceBreakdown: Array.from(deviceMap.entries()).map(([label, value]) => ({ label, value }))
  };
}
