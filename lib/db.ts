import "server-only";
import { randomUUID } from "node:crypto";
import { MongoClient, type Collection } from "mongodb";
import { detectDevice } from "./device";
import type { OpenEvent, Stats, Track } from "./types";

type TrackDocument = {
  id: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  gmailMessageKey: string;
  createdAt: string;
  sentAt: string;
  sent?: boolean;
};

type OpenEventDocument = OpenEvent;

type MongoCollections = {
  tracks: Collection<TrackDocument>;
  events: Collection<OpenEventDocument>;
  counters: Collection<{ _id: string; seq: number }>;
};

declare global {
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

function getMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required");
  return uri;
}

async function getClient() {
  if (!globalThis.mongoClientPromise) {
    const client = new MongoClient(getMongoUri());
    globalThis.mongoClientPromise = client.connect();
  }
  return globalThis.mongoClientPromise;
}

async function getCollections(): Promise<MongoCollections> {
  const client = await getClient();
  const db = client.db();
  const collections = {
    tracks: db.collection<TrackDocument>("tracks"),
    events: db.collection<OpenEventDocument>("open_events"),
    counters: db.collection<{ _id: string; seq: number }>("counters")
  };

  await Promise.all([
    collections.tracks.createIndex({ id: 1 }, { unique: true }),
    collections.tracks.createIndex({ createdAt: -1 }),
    collections.events.createIndex({ trackId: 1 }),
    collections.events.createIndex({ openedAt: -1 })
  ]);

  return collections;
}

async function nextEventId(counters: MongoCollections["counters"]) {
  const result = await counters.findOneAndUpdate(
    { _id: "open_events" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  return result?.seq ?? 1;
}

async function nextTrackRequestIndex(counters: MongoCollections["counters"], trackId: string) {
  const result = await counters.findOneAndUpdate(
    { _id: `track_events:${trackId}` },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  return result?.seq ?? 1;
}

function hydrateTrack(track: TrackDocument, events: OpenEventDocument[]): Track {
  const allTrackEvents = events
    .filter((event) => event.trackId === track.id)
    .sort((a, b) => a.openedAt.localeCompare(b.openedAt));
  const trackEvents = allTrackEvents.filter((event) => !event.ignored);
  const last = trackEvents.at(-1);

  return {
    ...track,
    bodyHtml: track.bodyHtml ?? "",
    bodyText: track.bodyText ?? "",
    sent: track.sent ?? true,
    status: trackEvents.length > 0 ? "opened" : "unopened",
    openCount: trackEvents.length,
    selfOpenCount: allTrackEvents.length - trackEvents.length,
    firstOpenedAt: trackEvents[0]?.openedAt ?? null,
    lastOpenedAt: last?.openedAt ?? null,
    lastDevice: last?.deviceType ?? null,
    lastClient: last?.client ?? null
  };
}

export async function createTrack(input: {
  senderEmail: string;
  recipientEmail: string;
  subject?: string;
  bodyHtml?: string;
  bodyText?: string;
  gmailMessageKey?: string;
  sentAt?: string;
  sent?: boolean;
}) {
  const { tracks } = await getCollections();
  const now = new Date().toISOString();
  const track: TrackDocument = {
    id: randomUUID(),
    senderEmail: input.senderEmail,
    recipientEmail: input.recipientEmail,
    subject: input.subject ?? "",
    bodyHtml: input.bodyHtml ?? "",
    bodyText: input.bodyText ?? "",
    gmailMessageKey: input.gmailMessageKey || `${input.senderEmail}:${Date.now()}:${randomUUID()}`,
    createdAt: now,
    sentAt: input.sentAt ?? now,
    sent: input.sent ?? false
  };

  await tracks.insertOne(track);
  return hydrateTrack(track, []);
}

export async function getTracks() {
  const { tracks, events } = await getCollections();
  const [trackDocs, eventDocs] = await Promise.all([
    tracks.find({ sent: { $ne: false } }, { projection: { _id: 0 } }).sort({ sentAt: -1, createdAt: -1 }).toArray(),
    events.find({}, { projection: { _id: 0 } }).toArray()
  ]);

  return trackDocs.map((track) => hydrateTrack(track, eventDocs));
}

export async function getTrack(id: string) {
  const { tracks, events } = await getCollections();
  const track = await tracks.findOne({ id }, { projection: { _id: 0 } });
  if (!track) return null;

  const eventDocs = await events.find({ trackId: id }, { projection: { _id: 0 } }).toArray();
  return hydrateTrack(track, eventDocs);
}

export async function updateTrack(id: string, input: {
  senderEmail?: string;
  recipientEmail?: string;
  subject?: string;
  bodyHtml?: string;
  bodyText?: string;
  sentAt?: string;
  sent?: boolean;
}) {
  const { tracks } = await getCollections();
  const update: Partial<TrackDocument> = {};
  if (input.senderEmail) update.senderEmail = input.senderEmail;
  if (input.recipientEmail) update.recipientEmail = input.recipientEmail;
  if (typeof input.subject === "string") update.subject = input.subject;
  if (typeof input.bodyHtml === "string") update.bodyHtml = input.bodyHtml;
  if (typeof input.bodyText === "string") update.bodyText = input.bodyText;
  if (typeof input.sentAt === "string") update.sentAt = input.sentAt;
  if (typeof input.sent === "boolean") update.sent = input.sent;

  if (Object.keys(update).length) {
    await tracks.updateOne({ id }, { $set: update });
  }

  return getTrack(id);
}

export async function recordOpen(trackId: string, requestInfo: {
  method: string;
  url: string;
  ip: string | null;
  headers: Record<string, string>;
}) {
  const { tracks, events, counters } = await getCollections();
  const track = await tracks.findOne({ id: trackId });
  if (!track) return null;

  const userAgent = requestInfo.headers["user-agent"] ?? null;
  const detected = detectDevice(userAgent);
  const requestIndex = await nextTrackRequestIndex(counters, trackId);
  const isInitialSystemRequest = isGmailInitialActivity(requestInfo.headers);
  const openedAt = new Date().toISOString();

  await events.insertOne({
    id: await nextEventId(counters),
    trackId,
    requestIndex,
    openedAt,
    method: requestInfo.method,
    url: requestInfo.url,
    ip: requestInfo.ip,
    userAgent,
    referer: requestInfo.headers.referer ?? requestInfo.headers.referrer ?? null,
    origin: requestInfo.headers.origin ?? null,
    accept: requestInfo.headers.accept ?? null,
    acceptLanguage: requestInfo.headers["accept-language"] ?? null,
    deviceType: detected.deviceType,
    client: detected.client,
    headers: requestInfo.headers,
    ignored: isInitialSystemRequest || undefined,
    ignoredReason: isInitialSystemRequest ? "initial_system" : undefined
  });

  return getTrack(trackId);
}

function isGmailInitialActivity(headers: Record<string, string>) {
  const userAgent = (headers["user-agent"] ?? "").toLowerCase();
  const referer = (headers.referer ?? headers.referrer ?? "").toLowerCase();
  const from = headers.from;
  const hasEmptyFromHeader = Object.prototype.hasOwnProperty.call(headers, "from") && !String(from ?? "").trim();
  const isGoogleImageProxyRender = userAgent.includes("googleimageproxy") || userAgent.includes("ggpht.com");
  const isGmailPrefetch = referer.includes("mail.google.com") || hasEmptyFromHeader;

  return isGmailPrefetch && !isGoogleImageProxyRender;
}

export async function markSenderView(trackId: string, detectedAt?: string) {
  const { tracks, events } = await getCollections();
  const track = await tracks.findOne({ id: trackId });
  if (!track) return null;

  const detectedAtMs = detectedAt ? new Date(detectedAt).getTime() : Date.now();
  const markTime = Number.isNaN(detectedAtMs) ? Date.now() : detectedAtMs;
  const recentCutoff = new Date(markTime - 6 * 1000).toISOString();
  const futureCutoff = new Date(markTime + 2 * 1000).toISOString();

  await events.findOneAndUpdate(
    { trackId, ignored: { $ne: true }, openedAt: { $gte: recentCutoff, $lte: futureCutoff } },
    { $set: { ignored: true, ignoredReason: "sender_view" } },
    { sort: { openedAt: -1 } }
  );

  return getTrack(trackId);
}

export async function getEvents(trackId?: string) {
  const { events } = await getCollections();
  const query = trackId ? { trackId } : {};
  const cursor = events.find(query, { projection: { _id: 0 } }).sort({ openedAt: -1 });
  if (!trackId) cursor.limit(100);
  return cursor.toArray();
}

export async function getStats(): Promise<Stats> {
  const tracks = await getTracks();
  const { events: eventCollection } = await getCollections();
  const rawEvents = await eventCollection.find({}, { projection: { _id: 0 } }).toArray();
  const events = rawEvents.filter((event) => !event.ignored);
  const systemRequests = rawEvents.filter((event) => event.ignoredReason === "initial_system").length;
  const senderRequests = rawEvents.filter((event) => event.ignoredReason === "sender_view").length;
  const opened = tracks.filter((track) => track.status === "opened").length;
  const deviceMap = new Map<string, number>();
  const clientMap = new Map<string, number>();
  const requestTypeMap = new Map<string, number>([
    ["Receiver", events.length],
    ["Sender", senderRequests],
    ["System", systemRequests]
  ]);
  const dailyMap = new Map<string, number>();
  const dailyRequestMap = new Map<string, { date: string; receiver: number; sender: number; system: number; raw: number }>();
  const hourlyRequestMap = new Map<string, { hour: string; receiver: number; sender: number; system: number; raw: number }>();
  const dailySentMap = new Map<string, { date: string; sent: number; opened: number; receiverOpens: number }>();
  const hourlySentMap = new Map<string, { hour: string; sent: number; opened: number; receiverOpens: number }>();
  const senderMap = new Map<string, {
    senderEmail: string;
    sent: number;
    opened: number;
    unopened: number;
    receiverOpens: number;
    openRate: number;
    lastSentAt: string | null;
  }>();
  const recipientMap = new Map<string, {
    recipientEmail: string;
    sent: number;
    opened: number;
    receiverOpens: number;
    lastSentAt: string | null;
  }>();
  const heatmapLabels = buildRecentDateLabels(14);
  const heatmapLabelSet = new Set(heatmapLabels);
  const heatmapRows = new Map<string, Map<string, {
    sent: number;
    viewed: number;
    receiverOpens: number;
    emails: {
      id: string;
      subject: string;
      recipientEmail: string;
      sentAt: string;
      openCount: number;
      lastOpenedAt: string | null;
    }[];
  }>>();
  const todayLabel = new Date().toISOString().slice(0, 10);
  const todayMap = new Map<string, {
    email: string;
    sent: number;
    viewed: number;
    receiverOpens: number;
    emails: {
      id: string;
      subject: string;
      recipientEmail: string;
      sentAt: string;
      openCount: number;
      lastOpenedAt: string | null;
    }[];
  }>();

  for (const event of events) {
    deviceMap.set(event.deviceType, (deviceMap.get(event.deviceType) ?? 0) + 1);
    clientMap.set(event.client, (clientMap.get(event.client) ?? 0) + 1);
    const date = event.openedAt.slice(0, 10);
    dailyMap.set(date, (dailyMap.get(date) ?? 0) + 1);
  }

  for (const event of rawEvents) {
    const date = event.openedAt.slice(0, 10);
    const hour = event.openedAt.slice(0, 13) + ":00";
    const type = event.ignoredReason === "initial_system"
      ? "system"
      : event.ignoredReason === "sender_view"
        ? "sender"
        : "receiver";
    const daily = dailyRequestMap.get(date) ?? { date, receiver: 0, sender: 0, system: 0, raw: 0 };
    const hourly = hourlyRequestMap.get(hour) ?? { hour, receiver: 0, sender: 0, system: 0, raw: 0 };
    daily[type] += 1;
    daily.raw += 1;
    hourly[type] += 1;
    hourly.raw += 1;
    dailyRequestMap.set(date, daily);
    hourlyRequestMap.set(hour, hourly);
  }

  for (const track of tracks) {
    const sentAt = track.sentAt || track.createdAt;
    const date = sentAt.slice(0, 10);
    const hour = sentAt.slice(0, 13) + ":00";
    const wasOpened = track.openCount > 0;
    const daily = dailySentMap.get(date) ?? { date, sent: 0, opened: 0, receiverOpens: 0 };
    const hourly = hourlySentMap.get(hour) ?? { hour, sent: 0, opened: 0, receiverOpens: 0 };
    daily.sent += 1;
    hourly.sent += 1;
    daily.receiverOpens += track.openCount;
    hourly.receiverOpens += track.openCount;
    if (wasOpened) {
      daily.opened += 1;
      hourly.opened += 1;
    }
    dailySentMap.set(date, daily);
    hourlySentMap.set(hour, hourly);

    const sender = senderMap.get(track.senderEmail) ?? {
      senderEmail: track.senderEmail,
      sent: 0,
      opened: 0,
      unopened: 0,
      receiverOpens: 0,
      openRate: 0,
      lastSentAt: null
    };
    sender.sent += 1;
    sender.receiverOpens += track.openCount;
    sender.opened += wasOpened ? 1 : 0;
    sender.unopened = sender.sent - sender.opened;
    sender.openRate = sender.sent ? Math.round((sender.opened / sender.sent) * 100) : 0;
    sender.lastSentAt = !sender.lastSentAt || sentAt > sender.lastSentAt ? sentAt : sender.lastSentAt;
    senderMap.set(track.senderEmail, sender);

    const recipient = recipientMap.get(track.recipientEmail) ?? {
      recipientEmail: track.recipientEmail,
      sent: 0,
      opened: 0,
      receiverOpens: 0,
      lastSentAt: null
    };
    recipient.sent += 1;
    recipient.receiverOpens += track.openCount;
    recipient.opened += wasOpened ? 1 : 0;
    recipient.lastSentAt = !recipient.lastSentAt || sentAt > recipient.lastSentAt ? sentAt : recipient.lastSentAt;
    recipientMap.set(track.recipientEmail, recipient);

    const emailSummary = {
      id: track.id,
      subject: track.subject || "(No subject)",
      recipientEmail: track.recipientEmail,
      sentAt,
      openCount: track.openCount,
      lastOpenedAt: track.lastOpenedAt
    };

    if (heatmapLabelSet.has(date)) {
      const row = heatmapRows.get(track.senderEmail) ?? new Map();
      const cell = row.get(date) ?? { sent: 0, viewed: 0, receiverOpens: 0, emails: [] };
      cell.sent += 1;
      cell.receiverOpens += track.openCount;
      cell.viewed += wasOpened ? 1 : 0;
      cell.emails.push(emailSummary);
      row.set(date, cell);
      heatmapRows.set(track.senderEmail, row);
    }

    if (date === todayLabel) {
      const today = todayMap.get(track.senderEmail) ?? {
        email: track.senderEmail,
        sent: 0,
        viewed: 0,
        receiverOpens: 0,
        emails: []
      };
      today.sent += 1;
      today.receiverOpens += track.openCount;
      today.viewed += wasOpened ? 1 : 0;
      today.emails.push(emailSummary);
      todayMap.set(track.senderEmail, today);
    }
  }

  return {
    total: tracks.length,
    opened,
    unopened: tracks.length - opened,
    openRate: tracks.length ? Math.round((opened / tracks.length) * 100) : 0,
    totalOpens: events.length,
    totalRawRequests: rawEvents.length,
    systemRequests,
    senderRequests,
    deviceBreakdown: Array.from(deviceMap.entries()).map(([label, value]) => ({ label, value })),
    clientBreakdown: Array.from(clientMap.entries()).map(([label, value]) => ({ label, value })),
    requestTypeBreakdown: Array.from(requestTypeMap.entries()).map(([label, value]) => ({ label, value })),
    dailyOpens: Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, opens]) => ({ date, opens })),
    dailyRequests: Array.from(dailyRequestMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14),
    hourlyRequests: Array.from(hourlyRequestMap.values())
      .sort((a, b) => a.hour.localeCompare(b.hour))
      .slice(-24),
    dailySent: Array.from(dailySentMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30),
    hourlySent: Array.from(hourlySentMap.values())
      .sort((a, b) => a.hour.localeCompare(b.hour))
      .slice(-24),
    senderPerformance: Array.from(senderMap.values())
      .sort((a, b) => b.sent - a.sent || b.receiverOpens - a.receiverOpens || a.senderEmail.localeCompare(b.senderEmail)),
    recipientPerformance: Array.from(recipientMap.values())
      .sort((a, b) => b.sent - a.sent || b.receiverOpens - a.receiverOpens || a.recipientEmail.localeCompare(b.recipientEmail))
      .slice(0, 12),
    emailTimeActivity: {
      timeLabels: heatmapLabels,
      rows: Array.from(heatmapRows.entries())
        .map(([email, cells]) => {
          const renderedCells = heatmapLabels.map((time) => {
            const cell = cells.get(time) ?? { sent: 0, viewed: 0, receiverOpens: 0, emails: [] };
            return { time, ...cell };
          });
          return {
            email,
            totalSent: renderedCells.reduce((sum, cell) => sum + cell.sent, 0),
            totalViewed: renderedCells.reduce((sum, cell) => sum + cell.viewed, 0),
            totalReceiverOpens: renderedCells.reduce((sum, cell) => sum + cell.receiverOpens, 0),
            cells: renderedCells
          };
        })
        .sort((a, b) => b.totalSent - a.totalSent || b.totalReceiverOpens - a.totalReceiverOpens || a.email.localeCompare(b.email)),
    },
    todayEmailActivity: Array.from(todayMap.values())
      .sort((a, b) => b.sent - a.sent || b.receiverOpens - a.receiverOpens || a.email.localeCompare(b.email))
  };
}

function buildRecentDateLabels(days: number) {
  const labels: string[] = [];
  const today = new Date();
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - offset);
    labels.push(date.toISOString().slice(0, 10));
  }
  return labels;
}
