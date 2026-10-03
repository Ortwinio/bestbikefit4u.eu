import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { newsletterConsentValidator, normalizedEmailPreferences, updateEmailPreferences } from "./newsletterConsent";

export const preferenceFields = {
  service: v.boolean(), marketing: v.boolean(), newsletter: v.optional(v.boolean()),
  consent: v.optional(newsletterConsentValidator),
};

export const read = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const id = ctx.db.normalizeId("users", userId);
    const user = id ? await ctx.db.get(id) : null;
    if (!user) throw new Error("Invalid or expired email link");
    return normalizedEmailPreferences(user);
  },
});

export const update = internalMutation({
  args: { userId: v.string(), service: v.optional(v.boolean()), marketing: v.optional(v.boolean()),
    newsletter: v.optional(v.boolean()), consent: v.optional(newsletterConsentValidator) },
  handler: async (ctx, { userId, consent, ...changes }) => {
    const id = ctx.db.normalizeId("users", userId);
    const user = id ? await ctx.db.get(id) : null;
    if (!user) throw new Error("Invalid or expired email link");
    return updateEmailPreferences(ctx, user, changes, { source: "preferences", consent });
  },
});

export const unsubscribe = internalMutation({
  args: { userId: v.string(), category: v.union(v.literal("service"), v.literal("marketing"), v.literal("newsletter")) },
  handler: async (ctx, { userId, category }) => {
    const id = ctx.db.normalizeId("users", userId);
    const user = id ? await ctx.db.get(id) : null;
    if (!user) throw new Error("Invalid or expired email link");
    if (!["service", "marketing", "newsletter"].includes(category)) throw new Error("Invalid email category");
    return updateEmailPreferences(ctx, user, { [category]: false }, {
      source: "preferences", unsubscribe: category === "newsletter",
    });
  },
});
