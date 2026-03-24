"use client";

import { stripLocalePrefix } from "@/i18n/navigation";
import type { FeedbackType } from "./feedback-api";

const STORAGE_KEY = "feedback-activity-trail";
const MAX_ENTRIES = 6;

export type FeedbackActivityAction =
  | "route_view"
  | "open_feedback_panel"
  | "view_fit_results"
  | "open_email_report"
  | "send_email_report"
  | "download_pdf_report"
  | "switch_feedback_tab"
  | "open_feedback_detail"
  | "vote_feature_request";

export type FeedbackActivityEntry = {
  action: FeedbackActivityAction;
  pathname: string;
  timestamp: number;
  label?: string;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function readEntries(): FeedbackActivityEntry[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FeedbackActivityEntry[]) : [];
  } catch {
    return [];
  }
}

function writeEntries(entries: FeedbackActivityEntry[]) {
  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
}

export function trackFeedbackActivity(entry: FeedbackActivityEntry) {
  const entries = readEntries();
  const previous = entries.at(-1);

  if (
    previous &&
    previous.action === entry.action &&
    previous.pathname === entry.pathname &&
    previous.label === entry.label
  ) {
    return;
  }

  writeEntries([...entries, entry]);
}

export function trackFeedbackRouteVisit(pathname: string) {
  trackFeedbackActivity({
    action: "route_view",
    pathname: stripLocalePrefix(pathname),
    timestamp: Date.now(),
  });
}

export function trackFeedbackPanelOpen(pathname: string) {
  trackFeedbackActivity({
    action: "open_feedback_panel",
    pathname: stripLocalePrefix(pathname),
    timestamp: Date.now(),
    label: "Opened the feedback panel",
  });
}

export function trackFeedbackSignal(
  pathname: string,
  action: Exclude<FeedbackActivityAction, "route_view" | "open_feedback_panel">,
  label: string
) {
  trackFeedbackActivity({
    action,
    pathname: stripLocalePrefix(pathname),
    timestamp: Date.now(),
    label,
  });
}

export function getFeedbackActivityTrail() {
  return readEntries();
}

export function inferFeedbackRouteFamily(pathname: string) {
  if (
    pathname === "/" ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/faq") ||
    pathname.startsWith("/guides") ||
    pathname.startsWith("/science") ||
    pathname.startsWith("/use-cases") ||
    pathname.startsWith("/why-bikefit-matters")
  ) {
    return "marketing" as const;
  }
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return "auth" as const;
  }
  if (pathname.startsWith("/dashboard")) {
    return "dashboard" as const;
  }
  if (pathname.startsWith("/fit/") && pathname.includes("/results")) {
    return "fit_results" as const;
  }
  if (pathname.includes("/calculators/") || pathname.includes("calculator")) {
    return "calculators" as const;
  }
  if (pathname.startsWith("/profile")) {
    return "profile" as const;
  }
  if (pathname.startsWith("/bikes")) {
    return "bikes" as const;
  }
  if (pathname.startsWith("/settings")) {
    return "settings" as const;
  }
  if (pathname.startsWith("/pricing") || pathname.startsWith("/upgrade")) {
    return "pricing" as const;
  }
  return "other" as const;
}

export function summarizeFeedbackActivity(
  type: FeedbackType,
  trail: FeedbackActivityEntry[],
  pathname: string
) {
  const paths = Array.from(new Set(trail.map((entry) => entry.pathname).slice(-3)));
  const actionLabels = trail
    .filter(
      (entry) =>
        entry.action !== "route_view" && entry.action !== "open_feedback_panel"
    )
    .map((entry) => entry.label?.trim())
    .filter((entry): entry is string => Boolean(entry))
    .slice(-3);

  if (actionLabels.length > 0) {
    const labelSummary =
      actionLabels.length === 1
        ? actionLabels[0]
        : `${actionLabels.slice(0, -1).join(", ")} and ${actionLabels.at(-1)}`;

    if (type === "review") {
      return `User ${labelSummary.toLowerCase()} before sharing a positive experience.`;
    }

    return `User ${labelSummary.toLowerCase()} before opening the feedback panel from ${pathname}.`;
  }

  if (paths.length === 0) {
    return type === "review"
      ? "User opened the feedback panel to share a positive experience."
      : `User opened the feedback panel from ${pathname}.`;
  }

  if (type === "review") {
    return `User visited ${paths.at(-1)} and then shared a positive experience.`;
  }

  if (paths.length === 1) {
    return `User opened the feedback panel from ${paths[0]}.`;
  }

  return `User moved through ${paths.join(" -> ")} before opening the feedback panel.`;
}
