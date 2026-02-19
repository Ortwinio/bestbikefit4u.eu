import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 3;
const RATE_LIMIT_IDENTIFIER_PREFIX = "email_verification:";

function buildRateLimitIdentifier(email: string): string {
  return `${RATE_LIMIT_IDENTIFIER_PREFIX}${email.trim().toLowerCase()}`;
}

export const consumeEmailVerificationRequest = internalMutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identifier = buildRateLimitIdentifier(args.email);
    const now = Date.now();

    const existingLimit = await ctx.db
      .query("authRateLimits")
      .withIndex("identifier", (q) => q.eq("identifier", identifier))
      .unique();

    if (existingLimit === null) {
      await ctx.db.insert("authRateLimits", {
        identifier,
        attemptsLeft: RATE_LIMIT_MAX_REQUESTS - 1,
        lastAttemptTime: now,
      });
      return;
    }

    // Token-bucket style refill over the configured window.
    const elapsedMs = Math.max(0, now - existingLimit.lastAttemptTime);
    const refillRatePerMs = RATE_LIMIT_MAX_REQUESTS / RATE_LIMIT_WINDOW_MS;
    const availableAttempts = Math.min(
      RATE_LIMIT_MAX_REQUESTS,
      existingLimit.attemptsLeft + elapsedMs * refillRatePerMs
    );

    if (availableAttempts < 1) {
      throw new Error("Too many verification requests. Please try again later.");
    }

    await ctx.db.patch(existingLimit._id, {
      attemptsLeft: availableAttempts - 1,
      lastAttemptTime: now,
    });
  },
});
