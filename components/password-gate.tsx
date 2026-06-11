"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PasswordGate({
  storageKey,
  password,
  title,
  description,
  children
}: {
  storageKey: string;
  password: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setUnlocked(window.localStorage.getItem(storageKey) === "true");
    setReady(true);
  }, [storageKey]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (value === password) {
      window.localStorage.setItem(storageKey, "true");
      setUnlocked(true);
      setError("");
      return;
    }
    setError("Invalid password.");
  }

  if (!ready) return null;
  if (unlocked) return <>{children}</>;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-4 flex items-center gap-3">
            <BrandMark />
            <div>
              <CardTitle>{title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <label className="grid gap-2 text-sm font-medium">
              Password
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  type="password"
                  className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>
            </label>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <Button type="submit" className="w-full">Unlock</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
