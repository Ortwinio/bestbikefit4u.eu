"use node";

import { internalAction, type ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { v } from "convex/values";
import { resolveEmailLocale } from "./locale";
import { deliverEmail, emailActionUrl } from "./delivery";
import { buildEmailPreferenceLinks, canSendPreferenceEmails } from "./unsubscribeTokens";
import { renderResultsSummary, renderFitReminder, renderAccessOptions, renderWinback, renderDay1Tips } from "./templates";

export const sendResultsRecap = internalAction({
  args: { userId: v.id("users"), sessionId: v.id("fitSessions"),
    locale: v.optional(v.union(v.literal("nl"), v.literal("en"))) },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.queries.getUserById, { userId: args.userId });
    if (!user?.email) return;
    const recommendation = await ctx.runQuery(internal.recommendations.queries.getBySessionInternal,
      { sessionId: args.sessionId });
    if (!recommendation || recommendation.userId !== user._id) return;
    const sent = await ctx.runQuery(internal.emails.lifecycleData.checkEmailSent, {
      userId: user._id, emailType: "results_recap", sessionId: args.sessionId,
    });
    if (sent) return;
    const locale = resolveEmailLocale(user, args.locale);
    const bikeName = await ctx.runQuery(internal.emails.lifecycleData.getSessionBikeName,
      { userId: user._id, sessionId: args.sessionId });
    const email = renderResultsSummary({ ...recommendation.calculatedFit,
      testRange: recommendation.calculatedFit.saddleHeightRange,
      firstName: (user.displayName ?? user.name)?.trim().split(/\s+/)[0],
      bikeName: bikeName ?? undefined,
      actionUrl: emailActionUrl(locale, `/fit/${args.sessionId}/results`),
    }, locale);
    if (await deliverEmail(user.email, email, { idempotencyKey: `results-recap/${args.sessionId}` })) {
      await ctx.runMutation(internal.emails.lifecycleData.logEmailSent, {
        userId: user._id, emailType: "results_recap", sessionId: args.sessionId, locale,
      });
    }
  },
});

type BatchKind = "day1_tips" | "fit_reminder" | "upgrade_nudge" | "winback";

async function sendBatchEmail(ctx: ActionCtx, userId: Id<"users">, kind: BatchKind) {
  const context = await ctx.runQuery(internal.emails.lifecycleData.getUserEmailContext, { userId });
  if (!context?.user.email || context.user.isAnonymous) return;
  const { user, recommendation, hasFit, bikeName } = context;
  const category = kind === "upgrade_nudge" || kind === "winback" ? "marketing" : "service";
  if (user.emailPreferences?.[category] === false) return;
  if (kind === "fit_reminder" && hasFit) return;
  if (kind === "upgrade_nudge" && user.tier && user.tier !== "free") return;
  if (kind === "winback" && (user.lastLoginAt ?? user.createdAt ?? user._creationTime)
    > Date.now() - 21 * 24 * 60 * 60 * 1000) return;
  if (await ctx.runQuery(internal.emails.lifecycleData.checkEmailSent,
    { userId, emailType: kind,
      ...(kind === "winback" ? { since: Date.now() - 60 * 24 * 60 * 60 * 1000 } : {}) })) return;
  if (!process.env.AUTH_RESEND_KEY) return;
  const locale = resolveEmailLocale(user);
  const links = await buildEmailPreferenceLinks(userId, locale, category);
  const common = { firstName: (user.displayName ?? user.name)?.trim().split(/\s+/)[0], ...links };
  const resultPath = recommendation ? `/fit/${recommendation.sessionId}/results` : "/fit";
  const email = kind === "day1_tips"
    ? renderDay1Tips({ ...common, hasFit, actionUrl: emailActionUrl(locale, hasFit ? resultPath : "/fit") }, locale)
    : kind === "fit_reminder"
      ? renderFitReminder({ ...common, actionUrl: emailActionUrl(locale, "/fit") }, locale)
      : kind === "upgrade_nudge"
        ? renderAccessOptions({ ...common, actionUrl: emailActionUrl(locale, "/pricing") }, locale)
        : renderWinback({ ...common, ...recommendation?.calculatedFit,
          recordedAt: recommendation?.createdAt, bikeName, actionUrl: emailActionUrl(locale, "/fit") }, locale);
  const period = kind === "winback" ? `/${new Date().toISOString().slice(0, 10)}` : "";
  if (await deliverEmail(user.email!, email, { headers: links.headers, idempotencyKey: `${kind}/${userId}${period}` })) {
    await ctx.runMutation(internal.emails.lifecycleData.logEmailSent, { userId, emailType: kind, locale });
  }
}

export const runDay1TipsBatch = internalAction({
  args: {},
  handler: async (ctx) => {
    if (!canSendPreferenceEmails()) return;
    const users = await ctx.runQuery(internal.emails.lifecycleData.getUsersNeedingDay1Tips, {});
    for (const user of users) await sendBatchEmail(ctx, user._id, "day1_tips");
  },
});

export const runFitReminderBatch = internalAction({
  args: {},
  handler: async (ctx) => {
    if (!canSendPreferenceEmails()) return;
    const users = await ctx.runQuery(internal.emails.lifecycleData.getUsersNeedingFitReminder, {});
    for (const user of users) await sendBatchEmail(ctx, user._id, "fit_reminder");
  },
});

export const runUpgradeNudgeBatch = internalAction({
  args: {},
  handler: async (ctx) => {
    if (!canSendPreferenceEmails()) return;
    const targets = await ctx.runQuery(internal.emails.lifecycleData.getUsersNeedingUpgradeNudge, {});
    for (const { user } of targets) await sendBatchEmail(ctx, user._id, "upgrade_nudge");
  },
});

export const runWinbackBatch = internalAction({
  args: {},
  handler: async (ctx) => {
    if (!canSendPreferenceEmails()) return;
    const users = await ctx.runQuery(internal.emails.lifecycleData.getUsersNeedingWinback, {});
    for (const user of users) await sendBatchEmail(ctx, user._id, "winback");
  },
});
