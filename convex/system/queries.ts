import { query } from "../_generated/server";

export const getFeatureFlags = query({
  args: {},
  handler: async (ctx) => {
    const flags = await ctx.db.query("feature_flags").collect();
    return Object.fromEntries(flags.map((flag) => [flag.key, flag.value]));
  },
});
