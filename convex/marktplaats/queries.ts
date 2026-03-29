import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "../_generated/server";
import { v } from "convex/values";
import { normalizeMarktplaatsImportUrl } from "../bikeImports/shared";

export const findExistingImportByCanonicalUrl = query({
  args: {
    canonicalUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const canonicalUrl = normalizeMarktplaatsImportUrl(args.canonicalUrl);
    return await ctx.db
      .query("bikeImports")
      .withIndex("by_user_canonical_url", (q) =>
        q
          .eq("userId", userId)
          .eq("sourceName", "marktplaats")
          .eq("canonicalUrlNormalized", canonicalUrl)
      )
      .first();
  },
});
