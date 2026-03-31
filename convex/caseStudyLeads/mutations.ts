import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  validateLongTextString,
  validateShortString,
  validateTextString,
} from "../lib/validation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const submit = mutation({
  args: {
    locale: v.union(v.literal("en"), v.literal("nl")),
    sourcePath: v.string(),
    painSlug: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    ridingGoal: v.optional(v.string()),
    painSummary: v.string(),
    consentAccepted: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!args.consentAccepted) {
      throw new Error("Consent is required");
    }

    validateShortString(args.name.trim(), "name");
    validateTextString(args.email.trim(), "email");
    validateLongTextString(args.painSummary.trim(), "painSummary");

    if (args.ridingGoal) {
      validateShortString(args.ridingGoal.trim(), "ridingGoal");
    }

    if (args.painSlug) {
      validateShortString(args.painSlug.trim(), "painSlug");
    }

    if (!EMAIL_REGEX.test(args.email.trim())) {
      throw new Error("Invalid email address");
    }

    if (!args.sourcePath.startsWith("/")) {
      throw new Error("sourcePath must be a relative path");
    }

    const userId = await getAuthUserId(ctx);
    return await ctx.db.insert("caseStudyLeads", {
      userId: userId ?? undefined,
      locale: args.locale,
      sourcePath: args.sourcePath.trim(),
      painSlug: args.painSlug?.trim() || undefined,
      name: args.name.trim(),
      email: args.email.trim().toLowerCase(),
      ridingGoal: args.ridingGoal?.trim() || undefined,
      painSummary: args.painSummary.trim(),
      consentAccepted: true,
      createdAt: Date.now(),
    });
  },
});
