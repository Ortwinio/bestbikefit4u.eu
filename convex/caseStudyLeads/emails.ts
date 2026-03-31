"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { Resend } from "resend";
import { BRAND } from "../lib/brand";
import { emailWrapper, escapeHtml } from "../emails/htmlHelpers";

export const sendLeadNotification = internalAction({
  args: { leadId: v.id("caseStudyLeads") },
  handler: async (ctx, { leadId }) => {
    const lead = await ctx.runQuery(internal.caseStudyLeads.queries.getById, { leadId });
    if (!lead) return;

    if (!process.env.AUTH_RESEND_KEY) {
      console.log("[DEV] Case study lead notification skipped — no RESEND key");
      return;
    }

    const resend = new Resend(process.env.AUTH_RESEND_KEY);
    await resend.emails.send({
      from: process.env.AUTH_EMAIL_FROM || BRAND.authEmailFrom,
      to: [BRAND.supportEmail],
      subject: `New case study lead: ${escapeHtml(lead.name)}`,
      html: emailWrapper(`
        <h2 style="margin:0 0 16px;font-size:18px;color:#1f2937;">New case study lead</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#6b7280;width:160px;">Name</td><td style="padding:8px 0;color:#1f2937;font-weight:600;">${escapeHtml(lead.name)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;">Email</td><td style="padding:8px 0;color:#1f2937;">${escapeHtml(lead.email)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;">Experience</td><td style="padding:8px 0;color:#1f2937;">${escapeHtml(lead.ridingGoal ?? "—")}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;">Summary</td><td style="padding:8px 0;color:#1f2937;">${escapeHtml(lead.painSummary)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;">Source</td><td style="padding:8px 0;color:#1f2937;">${escapeHtml(lead.sourcePath)}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;">Submitted</td><td style="padding:8px 0;color:#1f2937;">${new Date(lead.createdAt).toISOString()}</td></tr>
        </table>
      `),
    });
  },
});

export const sendCaseStudyConfirmation = internalAction({
  args: { leadId: v.id("caseStudyLeads") },
  handler: async (ctx, { leadId }) => {
    const lead = await ctx.runQuery(internal.caseStudyLeads.queries.getById, { leadId });
    if (!lead) return;

    if (!process.env.AUTH_RESEND_KEY) {
      console.log(`[DEV] Case study confirmation skipped — no RESEND key. Would send to: ${lead.email}`);
      return;
    }

    const resend = new Resend(process.env.AUTH_RESEND_KEY);
    await resend.emails.send({
      from: process.env.AUTH_EMAIL_FROM || BRAND.authEmailFrom,
      to: [lead.email],
      subject: `Thanks — we'll be in touch about your rider story`,
      html: emailWrapper(`
        <h2 style="margin:0 0 16px;font-size:18px;color:#1f2937;">Hi ${escapeHtml(lead.name)},</h2>
        <p style="margin:0 0 16px;color:#4b5563;line-height:1.6;">Thanks for putting your hand up. We'll reach out within a few days with a short set of questions by email.</p>
        <p style="margin:0 0 8px;color:#1f2937;font-weight:600;">What to expect:</p>
        <ul style="margin:0 0 16px;padding-left:20px;color:#4b5563;line-height:1.8;">
          <li>3–5 questions about your riding, the fit, and the position changes you made</li>
          <li>Entirely by email — no calls, no video</li>
          <li>Nothing published without a second, explicit consent from you</li>
        </ul>
        <p style="margin:0 0 16px;color:#6b7280;font-size:13px;">Your details are stored securely and used only for this case study process. To withdraw at any time, reply to this email.</p>
        <p style="margin:0;color:#4b5563;">— The ${BRAND.name} team</p>
      `),
    });
  },
});

