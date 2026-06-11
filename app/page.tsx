import { HomeLanding } from "@/components/home-landing";
import { PasswordGate } from "@/components/password-gate";

export default function HomePage() {
  return (
    <PasswordGate storageKey="gt_home_unlocked" password="313-801" title="Gmail Tracker" description="Enter the site password to continue.">
      <HomeLanding />
    </PasswordGate>
  );
}
