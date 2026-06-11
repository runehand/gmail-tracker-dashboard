import Link from "next/link";
import { MailCheck } from "lucide-react";

export function BrandMark() {
  return (
    <Link href="/" aria-label="Go to home" className="flex h-9 w-9 items-center justify-center rounded-md border bg-primary text-primary-foreground transition-opacity hover:opacity-85">
      <MailCheck className="h-5 w-5" />
    </Link>
  );
}
