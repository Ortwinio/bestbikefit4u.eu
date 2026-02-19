import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { validateShortString, validateTextString } from "../lib/validation";

const marketingEventType = v.union(
  v.literal("cta_click"),
  v.literal("login_code_requested"),
  v.literal("login_verified")
);

type MarketingEventDoc = {
  eventType: "cta_click" | "login_code_requested" | "login_verified";
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
    validateTextString(args.pagePath, "pagePath");
    if (args.section) validateShortString(args.section, "section");
    if (args.ctaLabel) validateShortString(args.ctaLabel, "ctaLabel");
    if (args.ctaTargetPath) {
      validateTextString(args.ctaTargetPath, "ctaTargetPath");
    }
    if (args.sourceTag) validateTextString(args.sourceTag, "sourceTag");

    const occurredAt = args.occurredAt ?? Date.now();
    if (!Number.isFinite(occurredAt) || occurredAt <= 0) {
      throw new Error("Invalid occurredAt timestamp");
    }

    const db = ctx.db as unknown as MarketingEventDb;
    return await db.insert("marketingEvents", {
      eventType: args.eventType,
      locale: args.locale,
      pagePath: args.pagePath,
      section: args.section,
      ctaLabel: args.ctaLabel,
      ctaTargetPath: args.ctaTargetPath,
      sourceTag: args.sourceTag,
      occurredAt,
    });
  },
});
