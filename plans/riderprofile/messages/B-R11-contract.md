# R11 newsletter contract

Work only in rider worktree. No newsletter sending, commit, deploy, new dependency or real email.
Parent owns schema, login, signup-intent helper, analytics allowlist and account cleanup.
Policy worker owns production emails/preferences*, unsubscribeTokens and new consent helper.
UI worker owns profile newsletter control + email-preferences UI/copy/tests/captures.
Test worker owns Convex newsletter/preference/token tests. Do not edit A/C files.

## Storage

users.emailPreferences adds optional newsletter, normalized false when missing (including old objects).
Existing service/marketing defaults stay true. Omitted newsletter means preserve, never subscribe.
Optional users metadata: newsletterConsentAt, newsletterConsentSource (signup/profile/preferences),
newsletterConsentLocale (nl/en), newsletterConsentWordingVersion, newsletterUnsubscribedAt.
No consent inferred from marketing=true, account creation, auth requests or an unchecked checkbox.

newsletterConsentEvents: userId, requestId, subscribed, source, locale, wordingVersion, createdAt.
Index by_user_request [userId, requestId]. A receipt is persisted atomically with each explicit
newsletter change. Replaying the same request never re-enables after unsubscribe. Return current
preferences, not the old receipt's subscribed value. Account deletion removes these receipts.

Constants/types in shared/newsletterConsent.ts (backend worker owns):
NEWSLETTER_WORDING_VERSION = "newsletter-v1".
NewsletterConsent = {requestId:string, locale:"nl"|"en", wordingVersion:"newsletter-v1"}.
requestId must be 8–128 safe ASCII letters/digits/underscore/hyphen (browser crypto.randomUUID).

## API

emails/preferences:get({}) -> null | {service:boolean,marketing:boolean,newsletter:boolean}.
emails/preferences:setNewsletter({subscribed:boolean, source:"signup"|"profile", consent:NewsletterConsent,
expectedEmail?:string}) -> {newsletter:boolean, granted:boolean}.
requireUserId + actual existing user. source=signup requires expectedEmail equal to the verified
current user's email, with normalized case/whitespace; no caller userId or timestamps accepted.
granted only for a persisted false->true transition, false on replay. Transaction source is validated.

Existing emails/preferences:set and emails/preferenceActions:save add optional newsletter:boolean
and consent:NewsletterConsent. Return existing three booleans plus newsletterGranted:boolean.
Existing source is fixed preferences. A requested newsletter change requires consent metadata for
an explicit browser request; omission preserves newsletter and current consent metadata. Signed
unsubscribe may disable without consent metadata; it never creates a positive consent record.
Read-only views never mutate. Keep older two-category clients working.

Token actions use verified token identity and purpose. Extend EmailCategory with newsletter,
preserving service/marketing tokens and one-click GET-read-only/POST-disable behavior. Consent
locale on explicit preference-save is the validated UI wording locale, not guessed from user/token.

## UI/privacy

NL signup label "Stuur mij de nieuwsbrief"; EN "Send me the newsletter". Default unticked.
Profile and preferences reflect actual saved value, default false only after data resolves.
On explicit grant use a stable requestId across retries; discard it after acknowledged success or
a new user choice. Log only newsletter_opt_in after granted/newsletterGranted=true through existing
consent-gated logger. No email, requestId, token, consent values or measurement values in analytics.
No signup consent values in URLs. Token unsubscribe transport remains unchanged.

Parent email-code completion binds to successful local verification and the returned account email.
Google/ambiguous completion fails closed to an explicit confirmation for the signed-in address
unless lead approves a different server-bound auth integration. Never drain a browser flag on any
arbitrary auth transition. Existing handoff /welcome and normal /dashboard destinations remain.
