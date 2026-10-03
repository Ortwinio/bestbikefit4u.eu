# R11 newsletter UI — owned completion

## Implementation
- NewsletterPreference in ProfileProvenance privacy area. Checkbox reflects the saved newsletter flag; no unchecked control until preferences finish loading, no inferred opt-in from service/marketing defaults. An explicit checkbox change autosaves through setNewsletter with source profile; no permanent Save button. Pending/saved status is visible, and failures expose a retry button using the same receipt ID. Email preferences retain their existing explicit whole-form Save.
- EmailPreferencesClient displays service, marketing and newsletter separately. Newsletter/consent arguments are omitted unless the user explicitly changed the newsletter choice; older preference shapes default missing newsletter to false only after load.
- Browser crypto.randomUUID per explicit action; the same receipt ID survives failed-save retries and is discarded after success or a new newsletter choice. Immediate in-flight refs prevent duplicate submits.
- Shared newsletter-v1 constant/consent type used. Positive analytics only after granted/newsletterGranted; event has eventType/locale/pagePath only through existing consent-gated logger. No email, token, requestId, checkbox/measurement values in analytics.
- Signed newsletter unsubscribe shows only its category confirmation, writes only after click, never on viewing the token URL. Existing service/marketing token behavior retained. Normalized mutation/action result sets preference state; replay with no grant produces no opt-in event.
- Newsletter NL/EN copy exports newsletterCopy[locale] and getNewsletterCopy(locale), including parent's exact signup/completion keys. Parent owns login/signup binding, shared providers and analytics allowlist; none edited here.
- No consent-clear/delete endpoint invented. Profile autosave/wizard/weight recalculation unchanged.

## Checks
- Four focused suites: **51 tests pass**, /tmp/R11-ui-tests.log (newsletter control, email preferences, profile provenance, profile page), including autosave/pending/double-click/retry behavior.
- Cases cover loading/null/legacy data, no writes before explicit save, unsubscribe, omission of untouched newsletter, authenticated and token saves, failed retries with stable UUID, new-choice UUID reset, replay/current state, value-free grant logging.
- Scoped ESLint including capture harness passes.
- Tooltip guard passes **56 files**.
- Final full typecheck passes (/tmp/R11-ui-types-final.log). Earlier concurrent calculator errors resolved outside this UI scope; no cross-owner fixes attempted.
- Initial profile provenance unit fixture treated every query as provenance; updated mock to return null for email preferences, retaining the unique loading-state assertion.

## Visual proof
- audit/R11-ui-capture.mjs uses actual ProfilePage/DashboardLayout and EmailPreferencesClient, actual CSS/fonts and synthetic reactive Convex fixtures. External requests blocked; no production data or emails.
- **24 PNGs**: NL/EN × 1440/390 × profile-unchecked / profile-subscribed / preferences-unchecked / preferences-subscribed / unsubscribe / profile-dark-subscribed.
- Every newsletter control starts unchecked; profile subscribed states use actual checkbox autosave, preferences states use checkbox plus explicit Save. Returned state is verified. Unsubscribe capture stays read-only.
- All 24: no document overflow or page errors. Reviewed NL390 preferences subscribed, EN1440 profile subscribed and NL1440 dark profile subscribed. Privacy wrapper explicitly uses ink text on fixed lime for readable heading/status in dark mode.
- Results renders/R11-ui-results.json; exact paths audit/files-R11-ui.txt. Prior R7/R13 harnesses unchanged.

R11 UI owned scope complete. Parent owns signup/provider/backend/combined gates. No commits, deploys, dependencies or real email.
