import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { requireUserId } from "../lib/authz";
import { preferenceFields } from "./preferencesData";
import { newsletterConsentValidator, normalizedEmailPreferences, updateEmailPreferences } from "./newsletterConsent";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    return user ? normalizedEmailPreferences(user) : null;
  },
});

export const set = mutation({
  args: preferenceFields,
  handler: async (ctx, { consent, ...changes }) => {
    const userId = await requireUserId(ctx);
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Not authenticated");
    return updateEmailPreferences(ctx, user, changes, { source: "preferences", consent });
  },
});

export const setNewsletter = mutation({
  args: {
    subscribed: v.boolean(),
    source: v.union(v.literal("signup"), v.literal("profile")),
    consent: newsletterConsentValidator,
    expectedEmail: v.optional(v.string()),
  },
  handler: async (ctx, { subscribed, source, consent, expectedEmail }) => {
    const userId = await requireUserId(ctx);
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Not authenticated");
    if (source !== "signup" && source !== "profile") throw new Error("Invalid consent source");
    if (source === "signup" && (!user.email || !expectedEmail?.trim()
      || typeof user.emailVerificationTime !== "number" || !Number.isFinite(user.emailVerificationTime)
      || user.email.trim().toLowerCase() !== expectedEmail.trim().toLowerCase())) {
      throw new Error("Verified account does not match signup consent");
    }
    const result = await updateEmailPreferences(ctx, user, { newsletter: subscribed }, { source, consent });
    return { newsletter: result.newsletter, granted: result.newsletterGranted };
  },
});
