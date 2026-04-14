import { mutation, type MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "../_generated/api";
import {
  validateLongTextString,
  validateShortString,
  validateTextString,
} from "../lib/validation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;
const RATE_LIMIT_IDENTIFIER_PREFIX = "case_study_lead:";

function buildRateLimitIdentifier(email: string): string {
  return `${RATE_LIMIT_IDENTIFIER_PREFIX}${email.trim().toLowerCase()}`;
}

async function consumeCaseStudyLeadRateLimit(ctx: MutationCtx, email: string) {
  const identifier = buildRateLimitIdentifier(email);
  const now = Date.now();

  const existingLimit = await ctx.db
    .query("authRateLimits")
    .withIndex("identifier", (q) => q.eq("identifier", identifier))
    .unique();

  if (!existingLimit) {
    await ctx.db.insert("authRateLimits", {
      identifier,
      attemptsLeft: RATE_LIMIT_MAX_REQUESTS - 1,
      lastAttemptTime: now,
    });
    return;
  }

  const elapsedMs = Math.max(0, now - existingLimit.lastAttemptTime);
  const refillRatePerMs = RATE_LIMIT_MAX_REQUESTS / RATE_LIMIT_WINDOW_MS;
  const availableAttempts = Math.min(
    RATE_LIMIT_MAX_REQUESTS,
    existingLimit.attemptsLeft + elapsedMs * refillRatePerMs
  );

  if (availableAttempts < 1) {
    throw new Error("Too many case study requests. Please try again later.");
  }

  await ctx.db.patch(existingLimit._id, {
    attemptsLeft: availableAttempts - 1,
    lastAttemptTime: now,
  });
}

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

    const normalizedEmail = args.email.trim().toLowerCase();
    await consumeCaseStudyLeadRateLimit(ctx, normalizedEmail);

    const userId = await getAuthUserId(ctx);
    const id = await ctx.db.insert("caseStudyLeads", {
      userId: userId ?? undefined,
      locale: args.locale,
      sourcePath: args.sourcePath.trim(),
      painSlug: args.painSlug?.trim() || undefined,
      name: args.name.trim(),
      email: normalizedEmail,
      ridingGoal: args.ridingGoal?.trim() || undefined,
      painSummary: args.painSummary.trim(),
      consentAccepted: true,
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.caseStudyLeads.emails.sendLeadNotification, { leadId: id });
    await ctx.scheduler.runAfter(0, internal.caseStudyLeads.emails.sendCaseStudyConfirmation, { leadId: id });

    return id;
  },
});
