import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Keep only the newest resend verification code entry for the current email.
 * This prevents duplicate-code collisions when using a fixed backdoor token.
 */
export const cleanupBackdoorVerificationCodes = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) =>
        q.eq("provider", "resend").eq("providerAccountId", args.email)
      )
      .unique();

    const keepCode =
      account === null
        ? null
        : await ctx.db
            .query("authVerificationCodes")
            .withIndex("accountId", (q) => q.eq("accountId", account._id))
            .unique();

    const allCodes = await ctx.db.query("authVerificationCodes").collect();
    let deleted = 0;

    for (const codeDoc of allCodes) {
      if (codeDoc.provider !== "resend") {
        continue;
      }
      if (keepCode !== null && codeDoc._id === keepCode._id) {
        continue;
      }
      await ctx.db.delete(codeDoc._id);
      deleted += 1;
    }

    return { deleted };
  },
});
