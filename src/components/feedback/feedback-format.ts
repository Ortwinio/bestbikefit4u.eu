import type { FeedbackLocale } from "./feedback-copy";

export function formatFeedbackDate(timestamp: number, locale: FeedbackLocale) {
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
}

export function formatFeedbackDateTime(timestamp: number, locale: FeedbackLocale) {
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function safeParseJson(input?: string) {
  if (!input) return null;

  try {
    return JSON.parse(input) as unknown;
  } catch {
    return null;
  }
}

export function prettyPrintJson(input?: string) {
  const parsed = safeParseJson(input);
  if (!parsed) return input ?? "";
  try {
    return JSON.stringify(parsed, null, 2);
  } catch {
    return input ?? "";
  }
}

export function createBrowserMetadata() {
  if (typeof window === "undefined") {
    return "{}";
  }

  return JSON.stringify(
    {
      userAgent: window.navigator.userAgent,
      language: window.navigator.language,
      platform: window.navigator.platform,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      colorScheme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    null,
    2
  );
}

export function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}
