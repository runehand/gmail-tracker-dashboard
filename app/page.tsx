import { HomeLanding } from "@/components/home-landing";
import { PasswordGate } from "@/components/password-gate";
import { getTracks } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const senders = Array.from(new Set((await getTracks()).map((track) => track.senderEmail))).sort();

  return (
    <PasswordGate storageKey="gt_home_unlocked" password="313-801" title="Gmail Tracker" description="Enter the site password to continue.">
      <HomeLanding senders={senders} />
    </PasswordGate>
  );
}
