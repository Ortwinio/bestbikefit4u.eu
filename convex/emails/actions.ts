"use node";

import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { v } from "convex/values";
import { Resend } from "resend";
import { BRAND } from "../lib/brand";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Send bike fit report email
 */
export const sendFitReport = action({
  args: {
    sessionId: v.id("fitSessions"),
    recipientEmail: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; emailId?: string }> => {
    const user = await ctx.runQuery(api.users.queries.getCurrentUser);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Validate email format
    if (!EMAIL_REGEX.test(args.recipientEmail)) {
      throw new Error("Invalid email address format");
    }

    // Restrict to sending only to the authenticated user's own email
    if (user.email && args.recipientEmail.toLowerCase() !== user.email.toLowerCase()) {
      throw new Error("Reports can only be sent to your own email address");
    }

    const recommendation = await ctx.runQuery(
      api.recommendations.queries.getBySession,
      { sessionId: args.sessionId }
    );
    if (!recommendation) {
      throw new Error("Recommendation not found");
    }

    const recipientEmail = args.recipientEmail;

    // Check for Resend API key
    if (!process.env.AUTH_RESEND_KEY) {
      console.log(`\n========================================`);
      console.log(`[DEV] Email report would be sent to: ${recipientEmail}`);
      console.log(`[DEV] Session ID: ${args.sessionId}`);
      console.log(
        `[DEV] Saddle Height: ${recommendation.calculatedFit.saddleHeightMm}mm`
      );
      console.log(
        `[DEV] Frame Size: ${recommendation.frameSizeRecommendations[0]?.size}`
      );
      console.log(`========================================\n`);

      return { success: true };
    }

    // Send via Resend
    const resend = new Resend(process.env.AUTH_RESEND_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.AUTH_EMAIL_FROM || BRAND.authEmailFrom,
      to: [recipientEmail],
      subject: `Your ${BRAND.name} Recommendations`,
      html: generateEmailHtml(recommendation),
    });

    if (error) {
      throw new Error("Failed to send email: " + error.message);
    }

    return { success: true, emailId: data?.id };
  },
});

/**
 * Generate HTML email content
 */
function generateEmailHtml(recommendation: {
  calculatedFit: {
    recommendedStackMm: number;
    recommendedReachMm: number;
    effectiveTopTubeMm: number;
    saddleHeightMm: number;
    saddleSetbackMm: number;
    handlebarDropMm: number;
    stemLengthMm: number;
    stemAngleRecommendation: string;
    crankLengthMm: number;
    handlebarWidthMm: number;
  };
  confidenceScore: number;
  algorithmVersion: string;
  frameSizeRecommendations: Array<{ size: string; fitScore: number; notes?: string }>;
  fitNotes: string[];
}): string {
  const fit = recommendation.calculatedFit;
  const frameSize = recommendation.frameSizeRecommendations[0];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ${BRAND.name} Recommendations</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #2563eb; font-size: 28px; margin: 0;">${BRAND.name}</h1>
      <p style="color: #6b7280; margin-top: 8px;">Your Personalized Bike Fit Report</p>
    </div>

    <!-- Main Card -->
    <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

      <!-- Frame Size -->
      <div style="text-align: center; padding: 24px; background: #ecfdf5; border-radius: 8px; margin-bottom: 24px;">
        <p style="color: #059669; margin: 0 0 8px 0; font-size: 14px;">Recommended Frame Size</p>
        <p style="color: #047857; font-size: 32px; font-weight: bold; margin: 0;">${frameSize?.size || "See details"}</p>
        <p style="color: #059669; font-size: 12px; margin-top: 8px;">Confidence: ${recommendation.confidenceScore}%</p>
      </div>

      <!-- Key Measurements -->
      <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 16px 0;">Key Measurements</h2>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280; font-size: 14px;">Saddle Height</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            <span style="color: #1f2937; font-weight: 600;">${fit.saddleHeightMm}mm</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280; font-size: 14px;">Saddle Setback</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            <span style="color: #1f2937; font-weight: 600;">${fit.saddleSetbackMm}mm</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280; font-size: 14px;">Handlebar Drop</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            <span style="color: #1f2937; font-weight: 600;">${fit.handlebarDropMm}mm</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280; font-size: 14px;">Stem</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            <span style="color: #1f2937; font-weight: 600;">${fit.stemLengthMm}mm @ ${fit.stemAngleRecommendation}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #6b7280; font-size: 14px;">Crank Length</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            <span style="color: #1f2937; font-weight: 600;">${fit.crankLengthMm}mm</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px;">
            <span style="color: #6b7280; font-size: 14px;">Handlebar Width</span>
          </td>
          <td style="padding: 12px; text-align: right;">
            <span style="color: #1f2937; font-weight: 600;">${fit.handlebarWidthMm}mm</span>
          </td>
        </tr>
      </table>

      <!-- Frame Targets -->
      <div style="margin-top: 24px; padding: 16px; background: #eff6ff; border-radius: 8px;">
        <h3 style="color: #1e40af; font-size: 14px; margin: 0 0 12px 0;">Frame Geometry Targets</h3>
        <table style="width: 100%;">
          <tr>
            <td style="text-align: center;">
              <span style="color: #3b82f6; font-size: 12px;">Stack</span>
              <p style="color: #1e40af; font-weight: 600; margin: 4px 0 0 0;">${fit.recommendedStackMm}mm</p>
            </td>
            <td style="text-align: center;">
              <span style="color: #3b82f6; font-size: 12px;">Reach</span>
              <p style="color: #1e40af; font-weight: 600; margin: 4px 0 0 0;">${fit.recommendedReachMm}mm</p>
            </td>
            <td style="text-align: center;">
              <span style="color: #3b82f6; font-size: 12px;">ETT</span>
              <p style="color: #1e40af; font-weight: 600; margin: 4px 0 0 0;">${fit.effectiveTopTubeMm}mm</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- Notes -->
      ${
        recommendation.fitNotes.length > 0
          ? `
      <div style="margin-top: 24px;">
        <h3 style="color: #1f2937; font-size: 14px; margin: 0 0 12px 0;">Personalized Notes</h3>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
          ${recommendation.fitNotes.map((note: string) => `<li style="margin-bottom: 8px;">${escapeHtml(note)}</li>`).join("")}
        </ul>
      </div>
      `
          : ""
      }

    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; color: #9ca3af; font-size: 12px;">
      <p>Generated by ${BRAND.name}</p>
      <p>Algorithm version: ${recommendation.algorithmVersion}</p>
    </div>
  </div>
</body>
</html>
  `;
}
