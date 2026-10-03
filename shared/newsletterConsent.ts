export const NEWSLETTER_WORDING_VERSION = "newsletter-v1" as const;

export type NewsletterConsent = {
  requestId: string;
  locale: "nl" | "en";
  wordingVersion: typeof NEWSLETTER_WORDING_VERSION;
};

export type NewsletterConsentSource = "signup" | "profile" | "preferences";

export type EmailPreferences = {
  service: boolean;
  marketing: boolean;
  newsletter: boolean;
};

export type EmailPreferencesResult = EmailPreferences & { newsletterGranted: boolean };
