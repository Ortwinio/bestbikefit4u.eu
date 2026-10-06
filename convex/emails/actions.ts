"use node";

import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { v } from "convex/values";
import { localizePdfEngineNotes } from "../../src/lib/reports/pdfEngineNotes";
import { deliverEmail, emailActionUrl } from "./delivery";
import { resolveEmailLocale } from "./locale";
import { renderFitReport } from "./templates";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const sendFitReport = action({
  args: {
    sessionId: v.id("fitSessions"),
    recipientEmail: v.string(),
    locale: v.optional(v.union(v.literal("nl"), v.literal("en"))),
  },
  handler: async (ctx, args): Promise<{ success: boolean; emailId?: string }> => {
    const user = await ctx.runQuery(api.users.queries.getCurrentUser);
    if (!user) {
      throw new Error("Not authenticated");
    }
    if (!EMAIL_REGEX.test(args.recipientEmail)) {
      throw new Error("Invalid email address format");
    }
    if (!user.email || args.recipientEmail.toLowerCase() !== user.email.toLowerCase()) {
      throw new Error("Reports can only be sent to your own email address");
    }
    const report = await ctx.runQuery(api.recommendations.queries.getReportV2, {
      sessionId: args.sessionId,
    });
    if (!report?.recommendation) {
      throw new Error("Recommendation not found");
    }
    if (!report.access?.canEmailReport) throw new Error("REPORT_ACCESS_REQUIRED");
    const recommendation = report.recommendation;

    const locale = resolveEmailLocale(user, args.locale);
    const email = renderFitReport({
      ...recommendation.calculatedFit,
      firstName: (user.displayName ?? user.name)?.trim().split(/\s+/)[0],
      frameSize: recommendation.frameSizeRecommendations[0]?.size,
      confidenceScore: recommendation.confidenceScore,
      algorithmVersion: recommendation.algorithmVersion,
      tirePressure: report.latestPressureCalculation ? {
        frontBar: report.latestPressureCalculation.recommendedFrontBar,
        rearBar: report.latestPressureCalculation.recommendedRearBar,
        frontPsi: report.latestPressureCalculation.recommendedFrontPsi,
        rearPsi: report.latestPressureCalculation.recommendedRearPsi,
      } : undefined,
      fitNotes: localizePdfEngineNotes(recommendation.fitNotes, locale),
      actionUrl: emailActionUrl(locale, `/fit/${args.sessionId}/results`),
    }, locale);
    const emailId = await deliverEmail(user.email, email);
    return emailId ? { success: true, emailId } : { success: true };
  },
});
