export type Track = {
  id: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  gmailMessageKey: string;
  createdAt: string;
  sentAt: string;
  sent: boolean;
  status: "opened" | "unopened";
  openCount: number;
  selfOpenCount: number;
  firstOpenedAt: string | null;
  lastOpenedAt: string | null;
  lastDevice: string | null;
  lastClient: string | null;
};

export type OpenEvent = {
  id: number;
  trackId: string;
  requestIndex?: number;
  openedAt: string;
  ip: string | null;
  userAgent: string | null;
  deviceType: string;
  client: string;
  ignored?: boolean;
  ignoredReason?: "initial_system" | "sender_view";
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
