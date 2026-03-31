"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { Resend } from "resend";
import { BRAND } from "../lib/brand";
import { emailWrapper, primaryButton, escapeHtml } from "./htmlHelpers";

export const sendProWelcome = internalAction({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const user = await ctx.runQuery(internal.users.queries.getUserById, { userId });
    if (!user?.email) return;

    const alreadySent = await ctx.runQuery(internal.emails.lifecycleData.checkEmailSent, {
      userId,
      emailType: "pro_welcome",
    });
    if (alreadySent) return;

    const firstName = user.displayName ?? user.name ?? "";
    const siteUrl = process.env.SITE_URL ?? BRAND.siteUrl;
    const dashboardUrl = `${siteUrl}/dashboard`;

    if (!process.env.AUTH_RESEND_KEY) {
      console.log(`[DEV] Pro welcome email would send to: ${user.email}`);
      await ctx.runMutation(internal.emails.lifecycleData.logEmailSent, {
        userId,
        emailType: "pro_welcome",
      });
      return;
    }

    const resend = new Resend(process.env.AUTH_RESEND_KEY);
    await resend.emails.send({
      from: process.env.AUTH_EMAIL_FROM || BRAND.authEmailFrom,
      to: [user.email],
      subject: "Your Fit Pass is active — here's what to do next",
      html: emailWrapper(`
        <h2 style="margin:0 0 16px;font-size:18px;color:#1f2937;">${firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,"}</h2>
        <p style="margin:0 0 16px;color:#4b5563;line-height:1.6;">Your Fit Pass is now active. Here's what you have access to:</p>
        <ul style="margin:0 0 20px;padding-left:20px;color:#4b5563;line-height:2;">
          <li>PDF report — downloadable, shareable with your fitter or bike shop</li>
          <li>Full adjustment sequence — every step listed in the right order</li>
          <li>Unlimited fit sessions and bike profiles</li>
        </ul>
        <p style="margin:0 0 20px;color:#4b5563;line-height:1.6;">Head to your dashboard to download your PDF or start a new session.</p>
        ${primaryButton(dashboardUrl, "Go to my dashboard")}
        <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;">Questions? Reply to this email — it reaches a real person.</p>
      `),
    });

    await ctx.runMutation(internal.emails.lifecycleData.logEmailSent, {
      userId,
      emailType: "pro_welcome",
    });
  },
});

export const run24hProNudgeBatch = internalAction({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.runQuery(internal.emails.fitpassData.getUsersNeeding24hNudge, {});

    for (const user of users) {
      if (!user.email) continue;
      const firstName = user.displayName ?? user.name ?? "";
      const siteUrl = process.env.SITE_URL ?? BRAND.siteUrl;
      const dashboardUrl = `${siteUrl}/dashboard`;

      if (!process.env.AUTH_RESEND_KEY) {
        console.log(`[DEV] 24h pro nudge would send to: ${user.email}`);
      } else {
        const resend = new Resend(process.env.AUTH_RESEND_KEY);
        await resend.emails.send({
          from: process.env.AUTH_EMAIL_FROM || BRAND.authEmailFrom,
          to: [user.email],
          subject: "How to read your fit numbers",
          html: emailWrapper(`
            <h2 style="margin:0 0 16px;font-size:18px;color:#1f2937;">${firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,"}</h2>
            <p style="margin:0 0 16px;color:#4b5563;line-height:1.6;">Here's a quick note on what your fit targets mean and how to use them.</p>
            <p style="margin:0 0 8px;color:#1f2937;font-weight:600;">Saddle height</p>
            <p style="margin:0 0 16px;color:#4b5563;line-height:1.6;">Your saddle height target is calculated using the LeMond method (inseam × 0.883, measured barefoot floor to crotch). It's a well-established starting point — small riders with proportionally longer legs may want to go slightly lower; larger riders slightly higher. Give it a few rides before making further changes.</p>
            <p style="margin:0 0 8px;color:#1f2937;font-weight:600;">Saddle setback</p>
            <p style="margin:0 0 16px;color:#4b5563;line-height:1.6;">Setback controls how far your knee is over or behind the pedal spindle at 3 o'clock. Riders with a more forward position (triathlon, TT) typically run less setback. The target in your report reflects your riding style and stated goals.</p>
            <p style="margin:0 0 8px;color:#1f2937;font-weight:600;">Handlebar drop</p>
            <p style="margin:0 0 16px;color:#4b5563;line-height:1.6;">Drop is the height difference between your saddle and handlebar tops. More drop means a more aerodynamic position; less drop means more upright. Your target reflects your stated comfort and performance priorities.</p>
            <p style="margin:0 0 16px;color:#4b5563;line-height:1.6;">If something still feels off after a few rides with the adjusted position, a session with a local fitter is a good next step.</p>
            ${primaryButton(dashboardUrl, "View my fit report")}
          `),
        });
      }

      await ctx.runMutation(internal.emails.lifecycleData.logEmailSent, {
        userId: user._id,
        emailType: "email_24h_pro_nudge",
      });
    }
  },
});
