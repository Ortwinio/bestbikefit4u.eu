import { v } from "convex/values";

export const FEEDBACK_ROUTE_FAMILIES = [
  "marketing",
  "auth",
  "dashboard",
  "fit_results",
  "calculators",
  "profile",
  "bikes",
  "settings",
  "pricing",
  "other",
] as const;

export const FEEDBACK_CONTEXT_COMPLETENESS = [
  "low",
  "medium",
  "high",
] as const;

export type FeedbackRouteFamily = (typeof FEEDBACK_ROUTE_FAMILIES)[number];
export type FeedbackContextCompleteness =
  (typeof FEEDBACK_CONTEXT_COMPLETENESS)[number];

export const feedbackRouteFamilyValidator = v.union(
  v.literal("marketing"),
  v.literal("auth"),
  v.literal("dashboard"),
  v.literal("fit_results"),
  v.literal("calculators"),
  v.literal("profile"),
  v.literal("bikes"),
  v.literal("settings"),
  v.literal("pricing"),
  v.literal("other")
);

export const feedbackContextCompletenessValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high")
);

export function trimOptionalString(
  value: string | undefined,
  maxLength: number
) {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, maxLength);
}

export function trimRequiredString(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

export function sanitizeJsonString(value: string | undefined, maxLength: number) {
  const trimmed = trimOptionalString(value, maxLength);
  if (!trimmed) {
    return undefined;
  }

  try {
    JSON.parse(trimmed);
    return trimmed;
  } catch {
    return undefined;
  }
}

export function inferRouteFamily(
  pathname: string | undefined,
  pagePath: string | undefined,
  fallback: FeedbackRouteFamily | undefined
): FeedbackRouteFamily {
  if (fallback) {
    return fallback;
  }

  const source = pathname ?? pagePath ?? "";
  if (!source) {
    return "other";
  }

  if (
    source === "/" ||
    source.startsWith("/guides") ||
    source.startsWith("/use-cases") ||
    source.startsWith("/why-bikefit-matters") ||
    source.startsWith("/bandenspanning")
  ) {
    return "marketing";
  }
  if (source.startsWith("/login") || source.startsWith("/signup")) {
    return "auth";
  }
  if (source.startsWith("/dashboard")) {
    return "dashboard";
  }
  if (source.startsWith("/fit/") && source.includes("/results")) {
    return "fit_results";
  }
  if (source.includes("/calculators/") || source.includes("calculator")) {
    return "calculators";
  }
  if (source.startsWith("/profile")) {
    return "profile";
  }
  if (source.startsWith("/bikes")) {
    return "bikes";
  }
  if (source.startsWith("/settings")) {
    return "settings";
  }
  if (source.startsWith("/pricing") || source.startsWith("/upgrade")) {
    return "pricing";
  }

  return "other";
}

export function computeContextCompleteness({
  pageUrl,
  pathname,
  description,
  routeFamily,
  linkedSessionId,
  linkedBikeId,
  browserInfoJson,
  activitySummary,
  activityTrailJson,
  userId,
  contactEmail,
  contactName,
}: {
  pageUrl?: string;
  pathname?: string;
  description: string;
  routeFamily?: FeedbackRouteFamily;
  linkedSessionId?: string;
  linkedBikeId?: string;
  browserInfoJson?: string;
  activitySummary?: string;
  activityTrailJson?: string;
  userId?: string;
  contactEmail?: string;
  contactName?: string;
}): FeedbackContextCompleteness {
  const hasUrl = Boolean(pageUrl || pathname);
  const hasRouteFamily = Boolean(routeFamily);
  const hasDescription = Boolean(description.trim());
  const extraSignals = [
    linkedSessionId,
    linkedBikeId,
    browserInfoJson,
    activitySummary,
    activityTrailJson,
    userId,
    contactEmail,
    contactName,
  ].filter(Boolean).length;

  if (hasUrl && hasRouteFamily && hasDescription && extraSignals >= 1) {
    return "high";
  }

  if (hasUrl && hasDescription && extraSignals >= 1) {
    return "medium";
  }

  return "low";
}
