import Link from "next/link";

export function BrandMark() {
  return (
    <Link href="/" aria-label="Go to home" className="flex h-9 w-9 items-center justify-center rounded-md border bg-card transition-opacity hover:opacity-85">
      <svg viewBox="0 0 64 64" aria-hidden="true" className="h-7 w-7">
        <defs>
          <linearGradient id="gt-brand-gradient" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#34d399" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
        </defs>
        <path d="M18 20A23 23 0 0 1 45 14" fill="none" stroke="url(#gt-brand-gradient)" strokeWidth="9" strokeLinecap="square" />
        <path d="M45 14 40 28 55 22Z" fill="#059669" />
        <path d="M47 44A23 23 0 0 1 19 50" fill="none" stroke="url(#gt-brand-gradient)" strokeWidth="9" strokeLinecap="square" />
        <path d="M19 50 24 36 9 42Z" fill="#10b981" />
        <path d="m21 32 9 9 18-20" fill="none" stroke="#065f46" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter" />
      </svg>
    </Link>
  );
}
