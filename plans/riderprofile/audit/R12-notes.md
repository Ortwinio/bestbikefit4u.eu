# R12 — remembered browser data

Consent accepted promotes only explicitly touched handoff entries to localStorage. The v1 `bbf.handoff` contract stays unchanged. Entries expire from their original touchedAt; reading or switching calculators never extends retention. Without consent or with essential consent, handoff stays in sessionStorage. Measurements never enter cookies, URLs or analytics.

Consent withdrawal synchronously clears both storage areas, even without a mounted calculator. Confirm and cancel already call the shared clear helper. All five logout surfaces now clear handoff and the R11 newsletter signup intent before sign-out. Malformed records are removed; unavailable storage is handled safely. RP1 and prefill notices explain retention in Dutch and English and update with consent.

Expiry also refreshes on an open page through a timer and focus/visibility changes.

Validation: 63 focused integration tests, full typecheck and full lint pass. Four NL/EN 1440/390 browser contexts pass no-consent and essential session-only storage, fresh-session restoration after acceptance, consent withdrawal, 31-day expiry, and shared-clear behavior. Screenshots are local in renders/R12-* and excluded from the manifest. Browser fixture uses actual public components/storage without backend writes; welcome and sidebar integration tests cover the real clear handlers.

No commit, deployment, mail or production-data write.
