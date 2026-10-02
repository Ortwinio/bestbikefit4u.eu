import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "../_generated/server";
import { requireUserId } from "../lib/authz";
import { preferenceFields } from "./preferencesData";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    return user ? user.emailPreferences ?? { service: true, marketing: true } : null;
  },
});

export const set = mutation({
  args: preferenceFields,
  handler: async (ctx, emailPreferences) => {
    const userId = await requireUserId(ctx);
    if (!(await ctx.db.get(userId))) throw new Error("Not authenticated");
    await ctx.db.patch(userId, { emailPreferences });
    return emailPreferences;
  },
});
