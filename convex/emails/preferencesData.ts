import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

export const preferenceFields = { service: v.boolean(), marketing: v.boolean() };

export const read = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const id = ctx.db.normalizeId("users", userId);
    const user = id ? await ctx.db.get(id) : null;
    if (!user) throw new Error("Invalid or expired email link");
    return user.emailPreferences ?? { service: true, marketing: true };
  },
});

export const update = internalMutation({
  args: { userId: v.string(), service: v.optional(v.boolean()), marketing: v.optional(v.boolean()) },
  handler: async (ctx, { userId, service, marketing }) => {
    const id = ctx.db.normalizeId("users", userId);
    const user = id ? await ctx.db.get(id) : null;
    if (!user) throw new Error("Invalid or expired email link");
    const emailPreferences = {
      service: service ?? user.emailPreferences?.service ?? true,
      marketing: marketing ?? user.emailPreferences?.marketing ?? true,
    };
    await ctx.db.patch(user._id, { emailPreferences });
    return emailPreferences;
  },
});
