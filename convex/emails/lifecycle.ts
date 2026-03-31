"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { Resend } from "resend";
import { BRAND } from "../lib/brand";
import { emailWrapper, primaryButton, escapeHtml } from "./htmlHelpers";

// ─── Actions ───────────────────────────────────────────────────────

export const sendResultsRecap = internalAction({
  args: {
    userId: v.id("users"),
    sessionId: v.id("fitSessions"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.queries.getUserById, { userId: args.userId });
    if (!user?.email) return;

    const recommendation = await ctx.runQuery(
      internal.recommendations.queries.getBySessionInternal,
      { sessionId: args.sessionId }
    );
    if (!recommendation) return;

    // Idempotency: don't send twice for the same session
    const alreadySent = await ctx.runQuery(internal.emails.lifecycleData.checkEmailSent, {
      userId: args.userId,
      emailType: "results_recap",
      sessionId: args.sessionId,
    });
    if (alreadySent) return;

    if (!process.env.AUTH_RESEND_KEY) {
      console.log(`[DEV] Results recap skipped — no RESEND key. Would send to: ${user.email}`);
      await ctx.runMutation(internal.emails.lifecycleData.logEmailSent, {
        userId: args.userId,
        emailType: "results_recap",
        sessionId: args.sessionId,
      });
      return;
    }

    const fit = recommendation.calculatedFit;
    const resend = new Resend(process.env.AUTH_RESEND_KEY);
    const dashboardUrl = `${process.env.SITE_URL ?? BRAND.siteUrl}/fit/${args.sessionId}/results`;
    const firstName = user.displayName ?? user.name ?? "";

    await resend.emails.send({
      from: process.env.AUTH_EMAIL_FROM || BRAND.authEmailFrom,
      to: [user.email],
      subject: `Your fit targets are ready — saddle height: ${fit.saddleHeightMm}mm`,
      html: emailWrapper(`
        <h2 style="margin:0 0 16px;font-size:18px;color:#1f2937;">${firstName ? `Hi ${escapeHtml(firstName)},` : "Your fit numbers are ready."}</h2>
        <p style="margin:0 0 20px;color:#4b5563;line-height:1.6;">Here's where to start:</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
          <tr style="background:#f9fafb;"><td style="padding:10px 12px;color:#6b7280;border-radius:4px 0 0 4px;">Saddle height</td><td style="padding:10px 12px;color:#1f2937;font-weight:700;text-align:right;border-radius:0 4px 4px 0;">${fit.saddleHeightMm}mm</td></tr>
          <tr><td style="padding:10px 12px;color:#6b7280;">Handlebar drop</td><td style="padding:10px 12px;color:#1f2937;font-weight:600;text-align:right;">${fit.handlebarDropMm}mm</td></tr>
          <tr style="background:#f9fafb;"><td style="padding:10px 12px;color:#6b7280;border-radius:4px 0 0 4px;">Stem length</td><td style="padding:10px 12px;color:#1f2937;font-weight:600;text-align:right;border-radius:0 4px 4px 0;">${fit.stemLengthMm}mm</td></tr>
          <tr><td style="padding:10px 12px;color:#6b7280;">Crank length</td><td style="padding:10px 12px;color:#1f2937;font-weight:600;text-align:right;">${fit.crankLengthMm}mm</td></tr>
        </table>
        <p style="margin:0 0 4px;color:#4b5563;font-size:13px;">Your full report — saddle setback, handlebar width, frame size, and a prioritised adjustment list — is in your dashboard.</p>
        ${primaryButton(dashboardUrl, "View my full report")}
      `),
    });

    await ctx.runMutation(internal.emails.lifecycleData.logEmailSent, {
      userId: args.userId,
      emailType: "results_recap",
      sessionId: args.sessionId,
    });
  },
});

export const runFitReminderBatch = internalAction({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.runQuery(internal.emails.lifecycleData.getUsersNeedingFitReminder, {});

    for (const user of users) {
      if (!user.email) continue;
      const loginUrl = `${process.env.SITE_URL ?? BRAND.siteUrl}/login?src=reminder_email`;
      const firstName = user.displayName ?? user.name ?? "";

      if (process.env.AUTH_RESEND_KEY) {
        const resend = new Resend(process.env.AUTH_RESEND_KEY);
        await resend.emails.send({
          from: process.env.AUTH_EMAIL_FROM || BRAND.authEmailFrom,
          to: [user.email],
          subject: `Your bike fit is waiting — takes 10 minutes`,
          html: emailWrapper(`
            <h2 style="margin:0 0 16px;font-size:18px;color:#1f2937;">${firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,"}</h2>
            <p style="margin:0 0 16px;color:#4b5563;line-height:1.6;">You signed up for ${BRAND.name} — but your fit targets are still in the queue.</p>
            <p style="margin:0 0 8px;color:#1f2937;font-weight:600;">Here's all you need to start:</p>
            <ul style="margin:0 0 16px;padding-left:20px;color:#4b5563;line-height:1.8;">
              <li>Your height (in cm)</li>
              <li>Your inseam measurement (a tape measure and a book will do)</li>
            </ul>
            <p style="margin:0 0 8px;color:#1f2937;font-weight:600;">In 10 minutes you'll have:</p>
            <ul style="margin:0 0 4px;padding-left:20px;color:#4b5563;line-height:1.8;">
              <li>Saddle height range</li>
              <li>Handlebar reach and drop</li>
              <li>Stem length guidance</li>
              <li>Frame size recommendation</li>
            </ul>
            ${primaryButton(loginUrl, "Get my fit targets")}
          `),
        });
      } else {
        console.log(`[DEV] Fit reminder would send to: ${user.email}`);
      }

      await ctx.runMutation(internal.emails.lifecycleData.logEmailSent, {
        userId: user._id,
        emailType: "fit_reminder",
      });
    }
  },
});

export const runUpgradeNudgeBatch = internalAction({
  args: {},
  handler: async (ctx) => {
    const targets = await ctx.runQuery(internal.emails.lifecycleData.getUsersNeedingUpgradeNudge, {});

    for (const { user } of targets) {
      if (!user.email) continue;
      const pricingUrl = `${process.env.SITE_URL ?? BRAND.siteUrl}/pricing?src=upgrade_nudge`;
      const firstName = user.displayName ?? user.name ?? "";

      if (process.env.AUTH_RESEND_KEY) {
        const resend = new Resend(process.env.AUTH_RESEND_KEY);
        await resend.emails.send({
          from: process.env.AUTH_EMAIL_FROM || BRAND.authEmailFrom,
          to: [user.email],
          subject: `PDF + multiple bikes: what Pro unlocks`,
          html: emailWrapper(`
            <h2 style="margin:0 0 16px;font-size:18px;color:#1f2937;">${firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,"}</h2>
            <p style="margin:0 0 16px;color:#4b5563;line-height:1.6;">You've got your fit targets. Here's what Pro adds on top:</p>
            <ul style="margin:0 0 16px;padding-left:20px;color:#4b5563;line-height:2;">
              <li>PDF export — save your report, share it with your fitter or bike shop</li>
              <li>Multiple bike profiles — fit your road bike and gravel bike separately</li>
              <li>Email report delivery — send your results to your inbox any time</li>
            </ul>
            <p style="margin:0 0 20px;color:#1f2937;font-weight:600;">€9 per month. Cancel any time from account settings.</p>
            ${primaryButton(pricingUrl, "Upgrade to Pro")}
            <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;">Questions? Reply to this email — it reaches a real person.</p>
          `),
        });
      } else {
        console.log(`[DEV] Upgrade nudge would send to: ${user.email}`);
      }

      await ctx.runMutation(internal.emails.lifecycleData.logEmailSent, {
        userId: user._id,
        emailType: "upgrade_nudge",
      });
    }
  },
});

export const runWinbackBatch = internalAction({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.runQuery(internal.emails.lifecycleData.getUsersNeedingWinback, {});

    for (const user of users) {
      if (!user.email) continue;
      const loginUrl = `${process.env.SITE_URL ?? BRAND.siteUrl}/login?src=winback_email`;
      const firstName = user.displayName ?? user.name ?? "";

      if (process.env.AUTH_RESEND_KEY) {
        const resend = new Resend(process.env.AUTH_RESEND_KEY);
        await resend.emails.send({
          from: process.env.AUTH_EMAIL_FROM || BRAND.authEmailFrom,
          to: [user.email],
          subject: `Anything change since your last fit?`,
          html: emailWrapper(`
            <h2 style="margin:0 0 16px;font-size:18px;color:#1f2937;">${firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,"}</h2>
            <p style="margin:0 0 16px;color:#4b5563;line-height:1.6;">Spring rides are starting. If you made any changes after your last fit, it's worth running a fresh session — a few kilograms gained or lost, or a new bike, can shift your optimal position by more than you'd expect.</p>
            <p style="margin:0 0 20px;color:#4b5563;">Your previous targets are still in your dashboard.</p>
            ${primaryButton(loginUrl, "Log in and check my numbers")}
          `),
        });
      } else {
        console.log(`[DEV] Win-back would send to: ${user.email}`);
      }

      await ctx.runMutation(internal.emails.lifecycleData.logEmailSent, {
        userId: user._id,
        emailType: "winback",
      });
    }
  },
});
