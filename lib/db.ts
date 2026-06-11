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
  gmailMessageKey: string;
  createdAt: string;
  sentAt: string;
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

function hydrateTrack(track: TrackDocument, events: OpenEventDocument[]): Track {
  const allTrackEvents = events
    .filter((event) => event.trackId === track.id)
    .sort((a, b) => a.openedAt.localeCompare(b.openedAt));
  const trackEvents = allTrackEvents.filter((event) => !event.ignored);
  const last = trackEvents.at(-1);

  return {
    ...track,
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
  gmailMessageKey?: string;
  sentAt?: string;
}) {
  const { tracks } = await getCollections();
  const now = new Date().toISOString();
  const track: TrackDocument = {
    id: randomUUID(),
    senderEmail: input.senderEmail,
    recipientEmail: input.recipientEmail,
    subject: input.subject ?? "",
    gmailMessageKey: input.gmailMessageKey || `${input.senderEmail}:${Date.now()}:${randomUUID()}`,
    createdAt: now,
    sentAt: input.sentAt ?? now
  };

  await tracks.insertOne(track);
  return hydrateTrack(track, []);
}

export async function getTracks() {
  const { tracks, events } = await getCollections();
  const [trackDocs, eventDocs] = await Promise.all([
    tracks.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray(),
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

export async function recordOpen(trackId: string, userAgent: string | null, ip: string | null) {
  const { tracks, events, counters } = await getCollections();
  const track = await tracks.findOne({ id: trackId });
  if (!track) return null;

  const detected = detectDevice(userAgent);
  await events.insertOne({
    id: await nextEventId(counters),
    trackId,
    openedAt: new Date().toISOString(),
    ip,
    userAgent,
    deviceType: detected.deviceType,
    client: detected.client,
    ignored: false
  });

  return getTrack(trackId);
}

export async function markSenderView(trackId: string) {
  const { tracks, events } = await getCollections();
  const track = await tracks.findOne({ id: trackId });
  if (!track) return null;

  const recentCutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  await events.findOneAndUpdate(
    { trackId, ignored: { $ne: true }, openedAt: { $gte: recentCutoff } },
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
  const events = (await getEvents()).filter((event) => !event.ignored);
  const opened = tracks.filter((track) => track.status === "opened").length;
  const deviceMap = new Map<string, number>();
  const dailyMap = new Map<string, number>();

  for (const event of events) {
    deviceMap.set(event.deviceType, (deviceMap.get(event.deviceType) ?? 0) + 1);
    const date = event.openedAt.slice(0, 10);
    dailyMap.set(date, (dailyMap.get(date) ?? 0) + 1);
  }

  return {
    total: tracks.length,
    opened,
    unopened: tracks.length - opened,
    openRate: tracks.length ? Math.round((opened / tracks.length) * 100) : 0,
    totalOpens: events.length,
    deviceBreakdown: Array.from(deviceMap.entries()).map(([label, value]) => ({ label, value })),
    dailyOpens: Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, opens]) => ({ date, opens }))
  };
}
