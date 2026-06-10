export type Track = {
  id: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  gmailMessageKey: string;
  createdAt: string;
  sentAt: string;
  status: "opened" | "unopened";
  openCount: number;
  firstOpenedAt: string | null;
  lastOpenedAt: string | null;
  lastDevice: string | null;
  lastClient: string | null;
};

export type OpenEvent = {
  id: number;
  trackId: string;
  openedAt: string;
  ip: string | null;
  userAgent: string | null;
  deviceType: string;
  client: string;
};

export type Stats = {
  total: number;
  opened: number;
  unopened: number;
  openRate: number;
  totalOpens: number;
  deviceBreakdown: { label: string; value: number }[];
  dailyOpens: { date: string; opens: number }[];
};
