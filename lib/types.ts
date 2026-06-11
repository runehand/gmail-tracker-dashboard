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
  method?: string;
  url?: string;
  ip: string | null;
  userAgent: string | null;
  referer?: string | null;
  origin?: string | null;
  accept?: string | null;
  acceptLanguage?: string | null;
  deviceType: string;
  client: string;
  headers?: Record<string, string>;
  ignored?: boolean;
  ignoredReason?: "initial_system" | "sender_view";
};

export type Stats = {
  total: number;
  opened: number;
  unopened: number;
  openRate: number;
  totalOpens: number;
  totalRawRequests: number;
  systemRequests: number;
  senderRequests: number;
  deviceBreakdown: { label: string; value: number }[];
  clientBreakdown: { label: string; value: number }[];
  requestTypeBreakdown: { label: string; value: number }[];
  dailyOpens: { date: string; opens: number }[];
  dailyRequests: { date: string; receiver: number; sender: number; system: number; raw: number }[];
  hourlyRequests: { hour: string; receiver: number; sender: number; system: number; raw: number }[];
  dailySent: { date: string; sent: number; opened: number; receiverOpens: number }[];
  hourlySent: { hour: string; sent: number; opened: number; receiverOpens: number }[];
  senderPerformance: {
    senderEmail: string;
    sent: number;
    opened: number;
    unopened: number;
    receiverOpens: number;
    openRate: number;
    lastSentAt: string | null;
  }[];
  recipientPerformance: {
    recipientEmail: string;
    sent: number;
    opened: number;
    receiverOpens: number;
    lastSentAt: string | null;
  }[];
  emailTimeActivity: {
    timeLabels: string[];
    rows: {
      email: string;
      totalSent: number;
      totalViewed: number;
      totalReceiverOpens: number;
      cells: {
        time: string;
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
      }[];
    }[];
  };
  todayEmailActivity: {
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
  }[];
};
