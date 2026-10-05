import { mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { validateShortString, validateTextString } from "../lib/validation";
import {
  ANONYMOUS_MARKETING_EVENT_TYPES,
  MARKETING_EVENT_TYPES,
  type MarketingEventType,
} from "../../src/lib/analytics/marketing";

import { PUBLIC_CALCULATORS, publicCalculatorPath } from "../../src/lib/analytics/calculatorBaseline";

const marketingEventType = v.union(
  ...(MARKETING_EVENT_TYPES.map((eventType) => v.literal(eventType)) as [
    ReturnType<typeof v.literal<MarketingEventType>>,
    ...Array<ReturnType<typeof v.literal<MarketingEventType>>>
  ])
);

type MarketingEventDoc = {
  eventType: MarketingEventType;
  locale: "en" | "nl";
  pagePath: string;
  section?: string;
  ctaLabel?: string;
  ctaTargetPath?: string;
  sourceTag?: string;
  valueCents?: number;
  currency?: "EUR";
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

const anonymousAllowedEventTypes = new Set<MarketingEventDoc["eventType"]>(
  ANONYMOUS_MARKETING_EVENT_TYPES
);

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
    valueCents: v.optional(v.number()),
    currency: v.optional(v.literal("EUR")),
    occurredAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId && !anonymousAllowedEventTypes.has(args.eventType)) {
      throw new Error("Not authorized for this event type");
    }

    const pagePath = normalizeRelativePath(args.pagePath, "pagePath");
    if (args.eventType.startsWith("leave_data_notice_")) {
      const extraFields = [args.section, args.ctaLabel, args.ctaTargetPath,
        args.sourceTag, args.valueCents, args.currency];
      if (!pagePath.startsWith(`/${args.locale}/`) && pagePath !== `/${args.locale}`
        || /[?#]/.test(pagePath) || extraFields.some(value => value !== undefined)) {
        throw new Error("Leave notice analytics accepts only locale and page path");
      }
    }
    if (args.eventType === "home_saddle_widget_used") {
      const extraFields = [args.section, args.ctaLabel, args.ctaTargetPath, args.valueCents, args.currency];
      if (
        args.sourceTag !== "saddle-height" ||
        pagePath !== `/${args.locale}` ||
        extraFields.some((value) => value !== undefined)
      ) {
        throw new Error("Home saddle analytics accepts only saddle-height, locale and homepage path");
      }
    }
    const isSaddleInteraction = args.eventType === "quick_fix_used" || args.eventType === "inseam_added";
    if (isSaddleInteraction || args.eventType === "calculator_result_view" || args.eventType === "calculator_login_cta_click") {
      const calculator = PUBLIC_CALCULATORS.find((id) => id === args.sourceTag);
      const extraFields = [args.section, args.ctaLabel, args.ctaTargetPath, args.valueCents, args.currency];
      if (
        !calculator || (isSaddleInteraction && calculator !== "saddle-height") ||
        publicCalculatorPath(calculator, pagePath) !== pagePath ||
        /[?#]/.test(pagePath) || extraFields.some((value) => value !== undefined)
      ) {
        throw new Error("Calculator analytics accepts only calculator, locale and public path");
      }
    }

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

    if (
      args.valueCents !== undefined &&
      (!Number.isFinite(args.valueCents) || args.valueCents < 0)
    ) {
      throw new Error("Invalid valueCents");
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
      valueCents: args.valueCents,
      currency: args.currency,
      occurredAt,
    });
  },
});
