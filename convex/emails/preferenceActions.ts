"use node";

import { v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { action, internalAction } from "../_generated/server";
import { emailPreferencePageUrl, verifyEmailPreferenceToken } from "./unsubscribeTokens";

type Preferences = { service: boolean; marketing: boolean };
const read = makeFunctionReference<"query", { userId: string }, Preferences>("emails/preferencesData:read");
const update = makeFunctionReference<"mutation", { userId: string; service?: boolean; marketing?: boolean }, Preferences>("emails/preferencesData:update");

export const view = action({
  args: { token: v.string() },
  handler: async (ctx, { token }): Promise<{ purpose: "preferences"; preferences: Preferences } | { purpose: "unsubscribe"; category: "service" | "marketing" }> => {
    const payload = verifyEmailPreferenceToken(token);
    if (payload.purpose === "unsubscribe") return { purpose: "unsubscribe", category: payload.category };
    return { purpose: "preferences", preferences: await ctx.runQuery(read, { userId: payload.userId }) };
  },
});

export const save = action({
  args: { token: v.string(), service: v.boolean(), marketing: v.boolean() },
  handler: async (ctx, { token, service, marketing }): Promise<Preferences> => {
    const payload = verifyEmailPreferenceToken(token);
    if (payload.purpose !== "preferences") throw new Error("Invalid or expired email link");
    return ctx.runMutation(update, { userId: payload.userId, service, marketing });
  },
});

export const unsubscribe = action({
  args: { token: v.string() },
  handler: async (ctx, { token }): Promise<null> => {
    const payload = verifyEmailPreferenceToken(token);
    if (payload.purpose !== "unsubscribe") throw new Error("Invalid or expired email link");
    await ctx.runMutation(update, { userId: payload.userId, [payload.category]: false });
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
