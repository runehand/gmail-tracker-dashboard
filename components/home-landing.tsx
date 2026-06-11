"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, BarChart3, MailSearch, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function HomeLanding({ senders }: { senders: string[] }) {
  const [sender, setSender] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = sender.trim().toLowerCase();
    if (!value) return;
    const match = senders.find((item) => item.toLowerCase() === value);
    if (!match) {
      setError("No tracked emails found for that sender.");
      return;
    }
    setError("");
    window.location.href = `/senders/${encodeURIComponent(match)}`;
  }

  return (
    <main className="min-h-screen">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <BrandMark />
            <span className="text-lg font-semibold">Gmail Tracker</span>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground">Receiver-first Gmail tracking</div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">Track sent Gmail performance without reading noise as views.</h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Monitor sender usage, receiver views, open timing, and raw pixel request details from one focused dashboard.
            </p>
          </div>
          <form onSubmit={submit} className="flex max-w-xl flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row">
            <div className="min-w-0 flex-1">
              <input
                value={sender}
                onChange={(event) => {
                  setSender(event.target.value);
                  if (error) setError("");
                }}
                type="email"
                placeholder="sender@example.com"
                list="gt-senders"
                className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <datalist id="gt-senders">
                {senders.map((email) => <option key={email} value={email} />)}
              </datalist>
              {error && <div className="mt-2 text-sm text-destructive">{error}</div>}
            </div>
            <Button type="submit" className="h-11 gap-2">
              View Sender <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <Card>
          <CardContent className="grid gap-4 p-5">
            <Feature icon={<MailSearch className="h-5 w-5" />} title="Sender lookup" text="Jump directly into reports for a sender email." />
            <Feature icon={<BarChart3 className="h-5 w-5" />} title="Performance charts" text="See sent volume, viewed emails, and receiver activity by time." />
            <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Request analysis" text="Separate Gmail initial activity, sender activity, and receiver opens." />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-lg border bg-background p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">{icon}</div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="mt-1 text-sm text-muted-foreground">{text}</div>
      </div>
    </div>
  );
}
