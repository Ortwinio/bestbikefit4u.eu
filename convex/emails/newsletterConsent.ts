import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import {
  NEWSLETTER_WORDING_VERSION,
  type EmailPreferences,
  type EmailPreferencesResult,
  type NewsletterConsent,
  type NewsletterConsentSource,
} from "../../shared/newsletterConsent";

export const newsletterConsentValidator = v.object({
  requestId: v.string(),
  locale: v.union(v.literal("nl"), v.literal("en")),
  wordingVersion: v.literal(NEWSLETTER_WORDING_VERSION),
});

export function normalizedEmailPreferences(user: Doc<"users">): EmailPreferences {
  return {
    service: user.emailPreferences?.service ?? true,
    marketing: user.emailPreferences?.marketing ?? true,
    newsletter: user.emailPreferences?.newsletter ?? false,
  };
}

export async function updateEmailPreferences(
  ctx: MutationCtx,
  user: Doc<"users">,
  changes: Partial<EmailPreferences>,
  options: { source: NewsletterConsentSource; consent?: NewsletterConsent; unsubscribe?: boolean },
): Promise<EmailPreferencesResult> {
  const current = normalizedEmailPreferences(user);
  const consent = options.consent;
  if (!["signup", "profile", "preferences"].includes(options.source)) throw new Error("Invalid consent source");
  if (changes.newsletter !== undefined && typeof changes.newsletter !== "boolean") throw new Error("Invalid newsletter preference");
  if (options.unsubscribe && changes.newsletter !== false) throw new Error("Invalid unsubscribe request");
  if (changes.newsletter !== undefined && !options.unsubscribe) {
    if (!consent || typeof consent.requestId !== "string" || consent.requestId.length < 8 || consent.requestId.length > 128
      || /[^A-Za-z0-9_-]/.test(consent.requestId)
      || !["nl", "en"].includes(consent.locale) || consent.wordingVersion !== NEWSLETTER_WORDING_VERSION) {
      throw new Error("Invalid newsletter consent");
    }
    const receipt = await ctx.db.query("newsletterConsentEvents")
      .withIndex("by_user_request", range => range.eq("userId", user._id).eq("requestId", consent.requestId)).unique();
    if (receipt) return { ...current, newsletterGranted: false };
  }
  const emailPreferences = {
    service: changes.service ?? current.service,
    marketing: changes.marketing ?? current.marketing,
    newsletter: changes.newsletter ?? current.newsletter,
  };
  const newsletterGranted = !current.newsletter && emailPreferences.newsletter;
  const now = Date.now();
  const patch: Partial<Doc<"users">> = { emailPreferences };
  if (newsletterGranted && consent) {
    Object.assign(patch, {
      newsletterConsentAt: now,
      newsletterConsentSource: options.source,
      newsletterConsentLocale: consent.locale,
      newsletterConsentWordingVersion: consent.wordingVersion,
    });
  }
  if (current.newsletter && !emailPreferences.newsletter) patch.newsletterUnsubscribedAt = now;
  if (changes.newsletter !== undefined && !options.unsubscribe && consent) {
    await ctx.db.insert("newsletterConsentEvents", {
      userId: user._id,
      requestId: consent.requestId,
      subscribed: changes.newsletter,
      source: options.source,
      locale: consent.locale,
      wordingVersion: consent.wordingVersion,
      createdAt: now,
    });
  }
  await ctx.db.patch(user._id, patch);
  return { ...emailPreferences, newsletterGranted };
}
