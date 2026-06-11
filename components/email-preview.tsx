import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmailPreview({ html, text }: { html: string; text: string }) {
  const srcDoc = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            margin: 0;
            padding: 16px;
            color: #111827;
            background: #ffffff;
            font: 14px/1.55 Arial, sans-serif;
            overflow-wrap: anywhere;
          }
          img { max-width: 100%; height: auto; }
          table { max-width: 100%; border-collapse: collapse; }
          a { color: #047857; }
        </style>
      </head>
      <body>${html || escapeHtml(text)}</body>
    </html>
  `;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Content</CardTitle>
      </CardHeader>
      <CardContent>
        {html || text ? (
          <iframe
            className="h-[520px] w-full rounded-lg border bg-white"
            sandbox=""
            srcDoc={srcDoc}
            title="Email content preview"
          />
        ) : (
          <div className="rounded-lg border px-4 py-8 text-center text-sm text-muted-foreground">No email content captured.</div>
        )}
      </CardContent>
    </Card>
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br />");
}
