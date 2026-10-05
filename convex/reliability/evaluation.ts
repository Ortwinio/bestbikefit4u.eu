"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { deliverEmail, emailActionUrl } from "../emails/delivery";
import { buildEmailPreferenceLinks, canSendPreferenceEmails } from "../emails/unsubscribeTokens";
import { resolveEmailLocale } from "../emails/locale";
import { renderKneeAngleEvaluation } from "../emails/templates/reliability";

export const sendEvaluation = internalAction({
  args: { measurementId: v.id("reliabilityKneeMeasurements") },
  handler: async (ctx, args) => {
    if (!process.env.AUTH_RESEND_KEY || !canSendPreferenceEmails()) return;
    const context = await ctx.runQuery(internal.reliability.evaluationData.getEvaluationContext, args);
    if (!context) return;
    const { user, measurement } = context;
    const locale = resolveEmailLocale(user);
    const links = await buildEmailPreferenceLinks(user._id, locale, "service");
    const email = renderKneeAngleEvaluation({ firstName: (user.displayName ?? user.name)?.split(/\s+/)[0],
      ...links, angleDegrees: measurement.angleDegrees, targetSaddleHeightMm: measurement.targetSaddleHeightMm,
      actionUrl: emailActionUrl(locale, "/tools/knee-angle") }, locale);
    if (await deliverEmail(user.email!, email, {
      headers: links.headers, idempotencyKey: `knee-evaluation/${measurement._id}`,
    })) await ctx.runMutation(internal.reliability.evaluationData.markEvaluationSent, args);
  },
});
