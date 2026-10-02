"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { deliverEmail, emailActionUrl } from "./delivery";
import { resolveEmailLocale } from "./locale";
import { renderFitPassWelcome, renderProExplainer } from "./templates";
import { buildEmailPreferenceLinks, canSendPreferenceEmails } from "./unsubscribeTokens";

export const sendProWelcome = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const context = await ctx.runQuery(internal.emails.lifecycleData.getUserEmailContext, { userId });
    if (!context) return;
    const { user, recommendation } = context;
    if (!user.email) return;
    const alreadySent = await ctx.runQuery(internal.emails.lifecycleData.checkEmailSent, {
      userId, emailType: "pro_welcome",
    });
    if (alreadySent) return;

    const locale = resolveEmailLocale(user);
    const email = renderFitPassWelcome({
      firstName: (user.displayName ?? user.name)?.trim().split(/\s+/)[0],
      actionUrl: emailActionUrl(locale, recommendation ? `/fit/${recommendation.sessionId}/results` : "/dashboard"),
    }, locale);
    const emailId = await deliverEmail(user.email, email, { idempotencyKey: `pro_welcome:${userId}` });
    if (emailId) {
      await ctx.runMutation(internal.emails.lifecycleData.logEmailSent, {
        userId, emailType: "pro_welcome", locale,
      });
    }
  },
});

export const run24hProNudgeBatch = internalAction({
  args: {},
  handler: async (ctx) => {
    if (!canSendPreferenceEmails()) return;
    const candidates = await ctx.runQuery(internal.emails.fitpassData.getUsersNeeding24hNudge, {});
    for (const candidate of candidates) {
      const userId = candidate._id;
      const context = await ctx.runQuery(internal.emails.lifecycleData.getUserEmailContext, { userId });
      if (!context) continue;
      const { user, recommendation } = context;
      if (!user.email) continue;
      if (user.tier !== "pro" || user.emailPreferences?.service === false) continue;
      const alreadySent = await ctx.runQuery(internal.emails.lifecycleData.checkEmailSent, {
        userId, emailType: "email_24h_pro_nudge",
      });
      if (alreadySent || !process.env.AUTH_RESEND_KEY) continue;

      const locale = resolveEmailLocale(user);
      const links = await buildEmailPreferenceLinks(userId, locale, "service");
      const email = renderProExplainer({
        ...recommendation?.calculatedFit,
        firstName: (user.displayName ?? user.name)?.trim().split(/\s+/)[0],
        unsubscribeUrl: links.unsubscribeUrl,
        preferencesUrl: links.preferencesUrl,
        actionUrl: emailActionUrl(locale, recommendation ? `/fit/${recommendation.sessionId}/results` : "/dashboard"),
      }, locale);
      const emailId = await deliverEmail(user.email, email, {
        headers: links.headers,
        idempotencyKey: `email_24h_pro_nudge:${userId}`,
      });
      if (emailId) {
        await ctx.runMutation(internal.emails.lifecycleData.logEmailSent, {
          userId, emailType: "email_24h_pro_nudge", locale,
        });
      }
    }
  },
});
