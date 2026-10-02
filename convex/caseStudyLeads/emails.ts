"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { BRAND } from "../lib/brand";
import { deliverEmail, emailActionUrl } from "../emails/delivery";
import { resolveEmailLocale } from "../emails/locale";
import { renderCaseStudyConfirmation, renderCaseStudyLead } from "../emails/templates";

export const sendLeadNotification = internalAction({
  args: { leadId: v.id("caseStudyLeads") },
  handler: async (ctx, { leadId }) => {
    const lead = await ctx.runQuery(internal.caseStudyLeads.queries.getById, { leadId });
    if (!lead) return;
    await deliverEmail(BRAND.supportEmail, renderCaseStudyLead(lead, "nl"), {
      idempotencyKey: `case_study_lead:${leadId}`,
    });
  },
});

export const sendCaseStudyConfirmation = internalAction({
  args: { leadId: v.id("caseStudyLeads") },
  handler: async (ctx, { leadId }) => {
    const lead = await ctx.runQuery(internal.caseStudyLeads.queries.getById, { leadId });
    if (!lead) return;
    const locale = resolveEmailLocale(null, lead.locale);
    await deliverEmail(lead.email, renderCaseStudyConfirmation({
      name: lead.name,
      actionUrl: emailActionUrl(locale, "/bikes"),
    }, locale), { idempotencyKey: `case_study_confirmation:${leadId}` });
  },
});
