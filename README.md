# Gmail Tracker Dashboard

Next.js + shadcn-style dashboard/backend for Gmail open tracking.

## Run

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

The backend stores data in MongoDB. Set `MONGODB_URI` in `.env.local`.

## Tracking Flow

1. The browser extension creates a tracking record before send.
2. It inserts a development-visible image with a URL like `/api/pixel/:trackingId.png`.
3. When the recipient opens the email and images load, the backend records an open event.
4. Dashboard shows sent/open/unread counts, open rate, recent opens, device guesses, and per-email history.

## Limits

Email open tracking depends on remote image loading. If the recipient blocks images, no open is recorded. Gmail and other clients may proxy image requests, so device, IP, and location are approximate.

For real email delivery, the dashboard URL must be public HTTPS. `http://localhost:3000` works in your browser, but Gmail's image proxy cannot fetch it from Google's servers.
