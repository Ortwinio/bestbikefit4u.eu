import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getFeatureFlags = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {};
    }

    const flags = await ctx.db.query("feature_flags").collect();
    return Object.fromEntries(flags.map((flag) => [flag.key, flag.value]));
  },
});
