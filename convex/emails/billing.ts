"use node";

import { makeFunctionReference } from "convex/server";
import type { RegisteredMutation } from "convex/server";
import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import type { claim, freezePayload } from "./billingData";
import { resolveEmailLocale } from "./locale";
import { deliverEmail, emailActionUrl } from "./delivery";
import { renderPurchaseConfirmation, renderSubscriptionWelcome, renderCancellationConfirmation, renderRenewalReminder, renderAccessExpired, renderTransitionAnnouncement } from "./templates";
import { renderTransitionReminder } from "./templates/transitionReminder";

type ClaimArgs = { jobId: import("../_generated/dataModel").Id<"billingEmailJobs"> };
type ClaimResult = typeof claim extends RegisteredMutation<"internal", ClaimArgs, infer Result> ? Awaited<Result> : never;
const claimReference = makeFunctionReference<"mutation", ClaimArgs, ClaimResult>("emails/billingData:claim");
const finishReference = makeFunctionReference<"mutation">("emails/billingData:finish");
type FreezeArgs = { jobId: ClaimArgs["jobId"]; attempts: number; payload: { recipient: string; subject: string; preheader: string; html: string; text: string } };
type FreezeResult = typeof freezePayload extends RegisteredMutation<"internal", FreezeArgs, infer Result> ? Awaited<Result> : never;
const freezeReference = makeFunctionReference<"mutation", FreezeArgs, FreezeResult>("emails/billingData:freezePayload");

function agendaUrl() {
  const value = process.env.PERSONAL_BIKEFIT_AGENDA_URL;
  if (!value) throw new Error("configuration");
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || /\[|\]/.test(value)) throw new Error("configuration");
  return value;
}

export const sendBillingEmail = internalAction({
  args: { jobId: v.id("billingEmailJobs") },
  handler: async (ctx, { jobId }) => {
    const context = await ctx.runMutation(claimReference, { jobId });
    if (!context) return;
    const { job, user, entitlement, offer, attempts } = context;
    let sent = false;
    let failureCode = "delivery_failed";
    try {
      if (!process.env.AUTH_RESEND_KEY) { failureCode = "configuration_missing"; return; }
      const locale = resolveEmailLocale(user);
      const firstName = (user.displayName ?? user.name)?.trim().split(/\s+/)[0];
      const accountUrl = emailActionUrl(locale, "/settings");
      const common = { firstName, actionUrl: accountUrl };
      const email = job.deliveryPayload ?? (job.kind === "purchase" && entitlement && (entitlement.productId === "single" || entitlement.productId === "personal_fit_standalone")
        ? renderPurchaseConfirmation({ ...common, productId: entitlement.productId, bikeName: context.bikeName, amountPaid: entitlement.periodPriceCents === undefined ? undefined : entitlement.periodPriceCents / 100, accessEndsAt: entitlement.expiresAt, actionUrl: entitlement.productId === "personal_fit_standalone" ? agendaUrl() : emailActionUrl(locale, "/fit") }, locale)
        : job.kind === "welcome" && entitlement
          ? renderSubscriptionWelcome({ ...common, accessEndsAt: entitlement.expiresAt, appointmentUrl: entitlement.productId === "annual_personal" ? agendaUrl() : undefined }, locale)
          : job.kind === "cancellation" && entitlement
            ? renderCancellationConfirmation({ ...common, accessEndsAt: entitlement.expiresAt, refundAmount: context.cancellationRefundCents === undefined ? undefined : context.cancellationRefundCents / 100 }, locale)
            : job.kind === "renewal" && entitlement
              ? renderRenewalReminder({ ...common, renewalAt: entitlement.expiresAt, daysUntilRenewal: Math.ceil((entitlement.expiresAt - Date.now()) / 86400000), cancellationUrl: accountUrl }, locale)
              : job.kind === "expired"
                ? renderAccessExpired({ ...common, bikeName: context.bikeName, actionUrl: emailActionUrl(locale, "/pricing") }, locale)
                : job.kind === "transition_announcement" && job.launchAt
                  ? renderTransitionAnnouncement({ ...common, launchAt: job.launchAt, eligibleTransitionOffer: Boolean(offer && offer.goLiveAt === job.launchAt && !offer.redeemedAt && offer.redeemBy > Date.now()), daysUntilLaunch: Math.ceil((job.launchAt - Date.now()) / 86400000), actionUrl: emailActionUrl(locale, "/pricing") }, locale)
                  : job.kind === "transition_reminder" && offer
                    ? renderTransitionReminder({ redeemBy: offer.redeemBy, actionUrl: emailActionUrl(locale, "/fit") }, locale) : null);
      if (!email) { failureCode = "invalid_job"; return; }
      const payload = await ctx.runMutation(freezeReference, { jobId, attempts, payload: { recipient: user.email!, subject: email.subject, preheader: email.preheader, html: email.html, text: email.text } });
      if (!payload) { failureCode = "recipient_unavailable"; return; }
      sent = Boolean(await deliverEmail(payload.recipient, payload, { idempotencyKey: `billing/${jobId}` }));
    } catch {
      failureCode = "delivery_failed";
    } finally {
      await ctx.runMutation(finishReference, { jobId, attempts, sent, ...(sent ? {} : { failureCode }) });
    }
  },
});
