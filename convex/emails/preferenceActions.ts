"use node";

import { v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { action, internalAction } from "../_generated/server";
import { emailPreferencePageUrl, verifyEmailPreferenceToken, type EmailCategory } from "./unsubscribeTokens";
import { newsletterConsentValidator } from "./newsletterConsent";
import type { EmailPreferences, EmailPreferencesResult, NewsletterConsent } from "../../shared/newsletterConsent";

const read = makeFunctionReference<"query", { userId: string }, EmailPreferences>("emails/preferencesData:read");
const update = makeFunctionReference<"mutation", { userId: string; service?: boolean; marketing?: boolean;
  newsletter?: boolean; consent?: NewsletterConsent }, EmailPreferencesResult>("emails/preferencesData:update");
const disable = makeFunctionReference<"mutation", { userId: string; category: EmailCategory }, EmailPreferencesResult>("emails/preferencesData:unsubscribe");

export const view = action({
  args: { token: v.string() },
  handler: async (ctx, { token }): Promise<{ purpose: "preferences"; preferences: EmailPreferences } | { purpose: "unsubscribe"; category: EmailCategory }> => {
    const payload = verifyEmailPreferenceToken(token);
    if (payload.purpose === "unsubscribe") return { purpose: "unsubscribe", category: payload.category };
    return { purpose: "preferences", preferences: await ctx.runQuery(read, { userId: payload.userId }) };
  },
});

export const save = action({
  args: { token: v.string(), service: v.boolean(), marketing: v.boolean(),
    newsletter: v.optional(v.boolean()), consent: v.optional(newsletterConsentValidator) },
  handler: async (ctx, { token, ...changes }): Promise<EmailPreferencesResult> => {
    const payload = verifyEmailPreferenceToken(token);
    if (payload.purpose !== "preferences") throw new Error("Invalid or expired email link");
    return ctx.runMutation(update, { userId: payload.userId, ...changes });
  },
});

export const unsubscribe = action({
  args: { token: v.string() },
  handler: async (ctx, { token }): Promise<null> => {
    const payload = verifyEmailPreferenceToken(token);
    if (payload.purpose !== "unsubscribe") throw new Error("Invalid or expired email link");
    await ctx.runMutation(disable, { userId: payload.userId, category: payload.category });
    return null;
  },
});

export const confirmationUrl = internalAction({
  args: { token: v.string() },
  handler: async (_ctx, { token }) => {
    const payload = verifyEmailPreferenceToken(token);
    if (payload.purpose !== "unsubscribe") throw new Error("Invalid or expired email link");
    return emailPreferencePageUrl(token, payload.locale);
  },
});
