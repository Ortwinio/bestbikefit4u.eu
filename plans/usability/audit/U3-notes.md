# U3 — account, paid moments, forms and shared tyre pressure

## Result

U3 is complete. The strict finalizer passes the complete 228-case U3 matrix on final shared build `4TmZn4gBoKfwaJvyfde7X`, source `a659cfbeacc91f88b59a4b2bf7d56ff0e28cdbfc5359db46c5c264f52836d17f`. Automated checks pass; all 868 required manual checks and six NL/EN PDF/mail surfaces are approved with exact artifact hashes. No manual checks or validation errors remain.

Evidence (ignored): `plans/usability/renders/guard/U3-final/reviewed-report.json` and its Markdown summary. This is the complete U3 subset of A's final 332-case capture, with all original records, screenshots and provenance retained. The scoped result has passed=true and releasePassed=false by design: A owns whole-release approval.

## Changes

- Shared contextual paid boundaries for second bike, profile, step plan, report, comparison and history use real catalogue prices and access. Enforcement OFF retains full access. Existing free report/export behavior remains available. No urgency or upgrade overlays were added.
- Bike/profile/welcome numeric fields use sliders. Measured/estimated choices preserve provenance. The old wizard no longer silently derives unknown dimensions and stores them as measured; optional per-field measurement kinds save atomically. Existing measurements and repeat evidence survive unchanged values.
- Shared PressureDisplay shows front lime/rear ink and actual localized bar/psi values across account, calculators, advice, landing and PDF. Mail uses saved pressure as text. No invented manufacturer limits or uncertainty ranges. Duplicate bike-profile pressure tiles were removed.
- Pricing, checkout and mail claims now match available saved-setup features. They do not promise an unavailable automatic numerical comparison. The history boundary does not promise access to an already-visible free session list.
- Fixed account feedback overlap by keeping the desktop control in flow and clearing mobile tabs. Fixed the leave-notice eligibility-toggle bug without clearing handoff data or resetting its session dismissal. Removed repeated unnonced pressure styles; A places the shared stylesheet once with the existing nonce.

Detailed implementation notes: U3-paid-notes.md, U3-forms-notes.md and U3-pressure-mail-notes.md. Source-only inventory: files-U3.txt.

## Verification

Guard was run during development. Builds 4–7 exposed real layout, duplicate-pressure, feedback, CSP and leave-notice defects plus fixture gaps; these were fixed, not suppressed. Build8 passed all automated U3 cases. Its finalizer correctly rejected obsolete build/source after A produced the final shared build.

For the final snapshot, all 228 U3 cases were checked against the completed visual review: 227 initial screenshots and all captured interaction screenshots/evidence were identical. The sole changed initial image, EN mobile pricing with normal cookie consent, was re-inspected at original width; expanded pricing evidence was unchanged. Each manual approval explicitly records this final-snapshot verification. All six PDF/mail artifacts were hash-verified. The strict finalizer then passed with zero errors.

Final shared gate evidence from A: 4,314 unit tests passed (20 skipped), 610 contracts passed, 875-page SEO crawl without findings, and all 332 automatic usability cases green. Previous combined typecheck, full lint, Convex tsc, production build, 684-redirect domain check and 42 email previews/84 renders passed. C additionally reran final full lint successfully, final app typecheck/build, Convex tsc, focused regression suites (including 10 feedback-placement, 19 notice/analytics, 15 pressure/CSP and two bilingual duplicate-pressure checks), and the eight communication e2e tests at the provenance checkpoint. Test counts overlap and are not summed. A owns the remaining final combined gate bookkeeping.

## Limits and owner decisions

Account visual fixtures are offline, with explicit flag-off/free-enforced/paid modes and strict query coverage. They do not prove real payments, authenticated production mutations or mail delivery. The PDF/mail review used actual rendered artifacts, without sending mail.

Existing appointment location/duration placeholders remain open owner inputs. No location, duration, refund policy, saddle-setback uncertainty or surface-specific pressure value was invented. Gift allowance and catalogue pricing remain unchanged.

No commits, deploys, production access, environment-file changes or real mails. Logs stay in /private/tmp; renders and raw guard JSON stay ignored.
