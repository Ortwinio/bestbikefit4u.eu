import type { Doc } from "../../../../convex/_generated/dataModel";

export type FeedbackRouteFamily =
  | "marketing"
  | "auth"
  | "dashboard"
  | "fit_results"
  | "calculators"
  | "profile"
  | "bikes"
  | "settings"
  | "pricing"
  | "other";

export type FeedbackContextCompleteness = "low" | "medium" | "high";

type FeedbackRecord = Doc<"feedback_items"> & {
  pageUrl?: string;
  pathname?: string;
  queryString?: string;
  locale?: string;
  routeFamily?: string;
  activitySummary?: string;
  contextCompleteness?: string;
  activityTrailJson?: string;
  contactEmail?: string;
  contactName?: string;
};

type ActivityEntry =
  | string
  | {
      label?: string;
      action?: string;
      pathname?: string;
      timestamp?: number;
    };

function asFeedbackRecord(item: Doc<"feedback_items">) {
  return item as FeedbackRecord;
}

function normalizeRouteFamily(value: string | undefined): FeedbackRouteFamily {
  switch (value) {
    case "marketing":
    case "auth":
    case "dashboard":
    case "fit_results":
    case "calculators":
    case "profile":
    case "bikes":
    case "settings":
    case "pricing":
      return value;
    default:
      return "other";
  }
}

function normalizeContextCompleteness(
  value: string | undefined
): FeedbackContextCompleteness {
  if (value === "high" || value === "medium") {
    return value;
  }
  return "low";
}

function safeParseJson(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export function getFeedbackRouteFamily(item: Doc<"feedback_items">) {
  return normalizeRouteFamily(asFeedbackRecord(item).routeFamily);
}

export function getFeedbackRouteFamilyLabel(
  family: FeedbackRouteFamily
) {
  switch (family) {
    case "fit_results":
      return "Fit results";
    case "calculators":
      return "Calculators";
    default:
      return family.charAt(0).toUpperCase() + family.slice(1);
  }
}

export function getFeedbackContextCompleteness(item: Doc<"feedback_items">) {
  const extended = asFeedbackRecord(item);
  const explicit = normalizeContextCompleteness(extended.contextCompleteness);
  if (extended.contextCompleteness) {
    return explicit;
  }

  const hasRoute =
    Boolean(extended.pageUrl?.trim()) ||
    Boolean(extended.pathname?.trim()) ||
    Boolean(item.pagePath?.trim());
  const hasDescription = Boolean(item.description?.trim());
  const extraSignals = [
    item.linkedBikeId,
    item.linkedSessionId,
    extended.activitySummary?.trim(),
    extended.activityTrailJson?.trim(),
    item.browserInfoJson?.trim(),
    item.userId,
    extended.contactEmail?.trim(),
    extended.contactName?.trim(),
  ].filter(Boolean).length;

  if (hasRoute && hasDescription && extraSignals >= 2) {
    return "high";
  }
  if (hasRoute && hasDescription && extraSignals >= 1) {
    return "medium";
  }
  return "low";
}

export function getFeedbackContextCompletenessLabel(
  value: FeedbackContextCompleteness
) {
  switch (value) {
    case "high":
      return "High context";
    case "medium":
      return "Medium context";
    default:
      return "Low context";
  }
}

export function getFeedbackContextCompletenessTone(
  value: FeedbackContextCompleteness
) {
  switch (value) {
    case "high":
      return "success" as const;
    case "medium":
      return "warning" as const;
    default:
      return "neutral" as const;
  }
}

export function getFeedbackReporterKind(item: Doc<"feedback_items">) {
  const extended = asFeedbackRecord(item);
  return item.userId || extended.contactEmail || extended.contactName
    ? item.userId
      ? "authenticated"
      : "anonymous"
    : "anonymous";
}

export function getFeedbackReporterKindLabel(
  kind: ReturnType<typeof getFeedbackReporterKind>
) {
  return kind === "authenticated" ? "Authenticated" : "Anonymous";
}

export function getFeedbackReporterName(
  item: Doc<"feedback_items">,
  fallbackName: string
) {
  const extended = asFeedbackRecord(item);
  if (item.userId) {
    return fallbackName;
  }

  return (
    extended.contactName?.trim() ||
    extended.contactEmail?.trim() ||
    "Anonymous"
  );
}

export function getFeedbackLocationSummary(item: Doc<"feedback_items">) {
  const extended = asFeedbackRecord(item);
  return {
    pageUrl: extended.pageUrl?.trim() || undefined,
    pathname:
      extended.pathname?.trim() ||
      item.pagePath?.trim() ||
      undefined,
    queryString: extended.queryString?.trim() || undefined,
    locale: extended.locale?.trim() || undefined,
  };
}

export function getFeedbackActivitySummary(item: Doc<"feedback_items">) {
  return asFeedbackRecord(item).activitySummary?.trim() || undefined;
}

export function getFeedbackActivityTrail(item: Doc<"feedback_items">) {
  const parsed = safeParseJson(asFeedbackRecord(item).activityTrailJson);
  if (!Array.isArray(parsed)) {
    return [] as string[];
  }

  return parsed
    .slice(0, 6)
    .map((entry): string | null => {
      if (typeof entry === "string") {
        return entry;
      }
      if (!entry || typeof entry !== "object") {
        return null;
      }
      const activity = entry as Exclude<ActivityEntry, string>;
      if (typeof activity.label === "string" && activity.label.trim()) {
        return activity.label.trim();
      }
      if (typeof activity.action === "string" && activity.action.trim()) {
        return typeof activity.pathname === "string" && activity.pathname.trim()
          ? `${activity.action.trim()} · ${activity.pathname.trim()}`
          : activity.action.trim();
      }
      if (typeof activity.pathname === "string" && activity.pathname.trim()) {
        return activity.pathname.trim();
      }
      return null;
    })
    .filter((entry): entry is string => Boolean(entry));
}

export function getFeedbackContactSummary(item: Doc<"feedback_items">) {
  const extended = asFeedbackRecord(item);
  const parts = [extended.contactName?.trim(), extended.contactEmail?.trim()].filter(
    Boolean
  );
  return parts.length > 0 ? parts.join(" · ") : "No contact provided";
}
