import type { Locale } from "@/i18n/config";
import { NEWSLETTER_WORDING_VERSION } from "../../../shared/newsletterConsent";

export const NEWSLETTER_INTENT_KEY = "bbf.newsletter-signup";
export const NEWSLETTER_INTENT_TTL = 30 * 60 * 1000;
export type NewsletterSignupIntent = {
  requestId: string;
  locale: Locale;
  wordingVersion: typeof NEWSLETTER_WORDING_VERSION;
  provider: "email" | "google";
  createdAt: number;
};

export function clearNewsletterSignupIntent() {
  try { window.sessionStorage.removeItem(NEWSLETTER_INTENT_KEY); } catch {}
}

export function readNewsletterSignupIntent(now = Date.now()): NewsletterSignupIntent | null {
  try {
    const raw = window.sessionStorage.getItem(NEWSLETTER_INTENT_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<NewsletterSignupIntent>;
    if (!value || typeof value !== "object" || typeof value.requestId !== "string"
      || !/^[A-Za-z0-9_-]{8,128}$/.test(value.requestId)
      || !["nl", "en"].includes(String(value.locale)) || value.wordingVersion !== NEWSLETTER_WORDING_VERSION
      || !["email", "google"].includes(String(value.provider)) || typeof value.createdAt !== "number"
      || !Number.isFinite(value.createdAt) || value.createdAt > now || now - value.createdAt >= NEWSLETTER_INTENT_TTL) {
      clearNewsletterSignupIntent();
      return null;
    }
    return { requestId: value.requestId, locale: value.locale!, wordingVersion: value.wordingVersion,
      provider: value.provider!, createdAt: value.createdAt };
  } catch {
    clearNewsletterSignupIntent();
    return null;
  }
}

export function createNewsletterSignupIntent(locale: Locale, provider: NewsletterSignupIntent["provider"]) {
  const intent: NewsletterSignupIntent = { requestId: crypto.randomUUID(), locale, provider,
    wordingVersion: NEWSLETTER_WORDING_VERSION, createdAt: Date.now() };
  let persisted = false;
  try { window.sessionStorage.setItem(NEWSLETTER_INTENT_KEY, JSON.stringify(intent)); persisted = true; } catch {}
  return { intent, persisted };
}
