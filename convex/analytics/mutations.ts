import { mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { validateShortString, validateTextString } from "../lib/validation";

const marketingEventType = v.union(
  v.literal("cta_click"),
  v.literal("login_code_requested"),
  v.literal("login_code_resent"),
  v.literal("login_verified"),
  v.literal("funnel_landing_view"),
  v.literal("funnel_login_view"),
  v.literal("funnel_profile_view"),
  v.literal("funnel_fit_view"),
  v.literal("funnel_questionnaire_complete"),
  v.literal("funnel_results_view"),
  v.literal("login_send_error"),
  v.literal("login_verify_error"),
  v.literal("questionnaire_complete_error"),
  v.literal("report_send_error")
);

type MarketingEventDoc = {
  eventType:
    | "cta_click"
    | "login_code_requested"
    | "login_code_resent"
    | "login_verified"
    | "funnel_landing_view"
    | "funnel_login_view"
    | "funnel_profile_view"
    | "funnel_fit_view"
    | "funnel_questionnaire_complete"
    | "funnel_results_view"
    | "login_send_error"
    | "login_verify_error"
    | "questionnaire_complete_error"
    | "report_send_error";
  locale: "en" | "nl";
  pagePath: string;
  section?: string;
  ctaLabel?: string;
  ctaTargetPath?: string;
  sourceTag?: string;
  occurredAt: number;
};

type MarketingEventDb = {
  insert: (tableName: "marketingEvents", value: MarketingEventDoc) => Promise<unknown>;
};

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const MAX_ANONYMOUS_EVENTS_PER_WINDOW = 60;
const MAX_AUTHENTICATED_EVENTS_PER_WINDOW = 300;
const MAX_EVENT_SKEW_FUTURE_MS = 5 * 60 * 1000;
const MAX_EVENT_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const anonymousAllowedEventTypes = new Set<MarketingEventDoc["eventType"]>([
  "cta_click",
  "funnel_landing_view",
  "funnel_login_view",
  "login_code_requested",
  "login_code_resent",
  "login_send_error",
  "login_verify_error",
]);

const sourceTagPattern = /^[A-Za-z0-9/_:-]{1,120}$/;

function normalizeRelativePath(path: string, fieldName: string): string {
  const normalized = path.trim();
  validateTextString(normalized, fieldName);

  if (!normalized.startsWith("/")) {
    throw new Error(`${fieldName} must be a relative path`);
  }
  if (normalized.includes("://")) {
    throw new Error(`${fieldName} must not contain an absolute URL`);
  }
  if (/[\r\n<>]/.test(normalized)) {
    throw new Error(`${fieldName} contains invalid characters`);
  }

  return normalized;
}

function normalizeSourceTag(sourceTag: string): string {
  const normalized = sourceTag.trim();
  validateTextString(normalized, "sourceTag");

  if (!sourceTagPattern.test(normalized)) {
    throw new Error("sourceTag contains invalid characters");
  }

  return normalized;
}

async function consumeRateLimitToken(
  ctx: MutationCtx,
  identifier: string,
  maxRequests: number
): Promise<void> {
  const now = Date.now();

  const existingLimit = await ctx.db
    .query("authRateLimits")
    .withIndex("identifier", (q) => q.eq("identifier", identifier))
    .unique();

  if (!existingLimit) {
    await ctx.db.insert("authRateLimits", {
      identifier,
      attemptsLeft: maxRequests - 1,
      lastAttemptTime: now,
    });
    return;
  }

  const elapsedMs = Math.max(0, now - existingLimit.lastAttemptTime);
  const refillRatePerMs = maxRequests / RATE_LIMIT_WINDOW_MS;
  const availableAttempts = Math.min(
    maxRequests,
    existingLimit.attemptsLeft + elapsedMs * refillRatePerMs
  );

  if (availableAttempts < 1) {
    throw new Error("Too many analytics events. Please try again later.");
  }

  await ctx.db.patch(existingLimit._id, {
    attemptsLeft: availableAttempts - 1,
    lastAttemptTime: now,
  });
}

function buildRateLimitIdentifier(args: {
  eventType: MarketingEventDoc["eventType"];
  locale: MarketingEventDoc["locale"];
  pagePath: string;
  userId: string | null;
}): string {
  if (args.userId) {
    return `marketing_event:user:${args.userId}:${args.eventType}`;
  }

  return `marketing_event:anon:${args.eventType}:${args.locale}:${args.pagePath.toLowerCase()}`;
}

export const logMarketingEvent = mutation({
  args: {
    eventType: marketingEventType,
    locale: v.union(v.literal("en"), v.literal("nl")),
    pagePath: v.string(),
    section: v.optional(v.string()),
    ctaLabel: v.optional(v.string()),
    ctaTargetPath: v.optional(v.string()),
    sourceTag: v.optional(v.string()),
    occurredAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId && !anonymousAllowedEventTypes.has(args.eventType)) {
      throw new Error("Not authorized for this event type");
    }

    const pagePath = normalizeRelativePath(args.pagePath, "pagePath");
    if (args.section) validateShortString(args.section, "section");
    if (args.ctaLabel) validateShortString(args.ctaLabel, "ctaLabel");
    const ctaTargetPath = args.ctaTargetPath
      ? normalizeRelativePath(args.ctaTargetPath, "ctaTargetPath")
      : undefined;
    const sourceTag = args.sourceTag
      ? normalizeSourceTag(args.sourceTag)
      : undefined;

    const occurredAt = args.occurredAt ?? Date.now();
    const now = Date.now();
    if (
      !Number.isFinite(occurredAt) ||
      occurredAt <= 0 ||
      occurredAt > now + MAX_EVENT_SKEW_FUTURE_MS ||
      occurredAt < now - MAX_EVENT_AGE_MS
    ) {
      throw new Error("Invalid occurredAt timestamp");
    }

    await consumeRateLimitToken(
      ctx,
      buildRateLimitIdentifier({
        eventType: args.eventType,
        locale: args.locale,
        pagePath,
        userId,
      }),
      userId
        ? MAX_AUTHENTICATED_EVENTS_PER_WINDOW
        : MAX_ANONYMOUS_EVENTS_PER_WINDOW
    );

    const db = ctx.db as unknown as MarketingEventDb;
    return await db.insert("marketingEvents", {
      eventType: args.eventType,
      locale: args.locale,
      pagePath,
      section: args.section,
      ctaLabel: args.ctaLabel,
      ctaTargetPath,
      sourceTag,
      occurredAt,
    });
  },
});
