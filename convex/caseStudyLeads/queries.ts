import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

export const getById = internalQuery({
  args: { leadId: v.id("caseStudyLeads") },
  handler: async (ctx, { leadId }) => {
    return await ctx.db.get(leadId);
  },
});
