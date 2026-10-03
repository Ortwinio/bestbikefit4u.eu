# R11 shared newsletter UI copy

UI worker exports getNewsletterCopy(locale) and newsletterCopy {nl,en} from src/i18n/account/newsletter.ts. Parent signup may use keys signupLabel (exact Stuur mij de nieuwsbrief / Send me the newsletter), description, confirmationLabel, title, save, saved, loading, error, loginRequired. Shared wording version/type come from backend-worker shared/newsletterConsent.ts; no editing that file by UI.

Profile uses setNewsletter source profile; email-preferences adds newsletter only when explicitly touched. Stable crypto.randomUUID per action reused after failure, discarded after success/new newsletter choice. Only server granted flags trigger consent-gated newsletter_opt_in, never values/requestId/email/token in event.

Profile component mount is in existing privacy area; no provider/login edits. Captures will be separate R11 UI fixture.

Parent's completion keys now exported too: confirmTitle, confirmText, confirm, skip, saving, retry, storageNotice, emailUnavailable. confirmText contains no email interpolation; parent shows verified email separately. Both newsletterCopy[locale] and getNewsletterCopy(locale) exported.
