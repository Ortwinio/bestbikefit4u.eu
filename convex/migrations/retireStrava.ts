import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { requireAdminRole } from "../admin/authz";

export const clearConnections = internalMutation({
  args: {
    cursor: v.union(v.string(), v.null()),
    numItems: v.optional(v.number()),
    dryRun: v.optional(v.boolean()),
    confirmation: v.optional(v.string()),
  },
  handler: async (ctx, { cursor, numItems = 25, dryRun = true, confirmation }) => {
    await requireAdminRole(ctx, "super_admin");
    if (!Number.isInteger(numItems) || numItems < 1 || numItems > 100) {
      throw new Error("Page size must be an integer from 1 to 100");
    }
    if (!dryRun && confirmation !== "CLEAR_STRAVA_CONNECTIONS") {
      throw new Error("Run the full dry-run first and explicitly confirm connection cleanup");
    }
    const page = await ctx.db.query("integrations").paginate({
      cursor, numItems, maximumRowsRead: 100, maximumBytesRead: 1_000_000,
    });
    const counts = { scanned: page.page.length, eligible: 0, withTokens: 0, withState: 0, deleted: 0 };
    for (const connection of page.page) {
      if (connection.provider !== "strava") continue;
      counts.eligible++;
      if (connection.accessToken || connection.refreshToken) counts.withTokens++;
      if (connection.oauthState) counts.withState++;
      if (!dryRun) {
        await ctx.db.delete(connection._id);
        counts.deleted++;
      }
    }
    return { dryRun, counts, continueCursor: page.continueCursor, isDone: page.isDone };
  },
});
