import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatRelativeTime(value: string | null | undefined) {
  if (!value) return "No recipient opens";

  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1]
  ];
  const [unit, size] = units.find(([, unitSeconds]) => seconds >= unitSeconds) ?? ["second", 1];

  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-Math.floor(seconds / size), unit);
}
