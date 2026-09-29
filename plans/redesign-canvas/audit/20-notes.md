# 20.1 — Account presentation implementation

Scope: dashboard shell, `/dashboard`, `/profile`, `/profile/improve/*`, `/login`. Batch 2 is not started. No commits. Convex queries, mutations, authorization and authentication contracts remain unchanged.

## Sources and ownership

- The checked-out canvas snapshot is stale: Profile/ProfileImprove and mobile Dashboard are missing there. Used the lead-approved task-17 drafts (`drafts/Dashboard.dc.html`, `Profile.dc.html`, `ProfileImprove.dc.html`, `Login.dc.html`, plus available `drafts/m/` counterparts). No review strips or example-data chips ship in the app.
- One subagent per page family: Curie (Dashboard), Halley (Profile), Archimedes (ProfileImprove), Carson (Login). Parent owns shell and final integration. Archimedes additionally owns actual-component visual fixtures; Curie runs full validation.
- No edits to Codex C's `src/components/ui/*`, public Header/Footer, or globals.css. Account additions live in `src/components/account/` and `src/components/dashboard/`; existing page/profile/measurement presentation is updated in place.
- **Route to Codex C/lead:** plan 20's public `BikeFitCalculatorForm.tsx` height-range correction (130–210 cm with test) is deliberately not edited here because public calculator pages belong to C.

## Shell and real state

- 264px ink sidebar, lime active navigation, 48px desktop content margin; one canonical ordered account navigation list. Most-specific match prevents both Bikes and New bike becoming active.
- Mobile header and five bottom tabs; More opens an accessible Base UI dialog with focus management, escape/backdrop closure, localized links, account state, and sign-out. Crossing the desktop breakpoint closes the modal. Main content reserves bottom-tab and safe-area space.
- Existing auth guard, admin-role filtering, profile-photo control, Strava trigger, dashboard messaging and sign-out destination remain intact. Language switching preserves route and query.
- Integration review found the existing global feedback launcher covering the new mobile bottom tabs. A small account-specific placement helper is now passed by `FeedbackPanelProvider`; public and desktop placement are preserved. Ten route-placement tests cover this boundary. The actual launcher is included in the visual fixtures.
- Plan label uses the real user tier. Usage is the actual `sessions.listByUser` count. **No invented “1 of 1” quota or progress bar:** the existing sessions create mutation has no enforced allowance and exposes no entitlement denominator. Unknown user/usage renders an ellipsis rather than a fake subscription/count.
- Payment-paused copy appears only when the existing `isStripeBillingEnabled()` configuration disables billing, not unconditionally as in the fixture board. Settings remains available, with no fabricated upgrade checkout.

## Page preservation

- Dashboard retains real garage, fit advice, profile, photo-upload and report flows; localized profile indicators and missing-weight action accompany the redesign.
- Profile retains the existing measurement and assessment data contracts.
- ProfileImprove retains all four route contents and edit destinations; missing profiles do not receive an invented score, exercises expand with accessible controls.
- Login retains email-code authentication (seven-character codes), Google, resend cooldown, errors, redirects, campaign attribution and localhost dev-login behavior. Its approved layout replaces the old narrow card, not its authentication logic.

## Validation

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASS, including parent rerun after final profile/guide presentation fixes |
| `npm run lint` | PASS; 218/218 brand contrast checks, runtime and tooltip guards; `/tmp/20-parent-final-lint.log` |
| `npm run test:unit` | PASS: 185 files / 827 tests; `/tmp/20-final-test-unit.log` |
| `npm run test:i18n` | PASS: 6 files / 30 tests |
| `npm run test:e2e:i18n` | PASS: 2 locale/proxy smoke tests; not a live authenticated browser test |
| `npm run build` | PASS: webpack compilation, TypeScript and 230 static pages; `/tmp/20-final-build.log` |
| Final focused checks | Shell + actual plan-state: 17 tests; ProfileImprove: 15 tests; final Profile layout: 8 tests; scoped diff whitespace check PASS |

Historical concurrent integration failures and their superseding results are retained in `20-validation.md`. Public calculator/home/pricing failures resolved through their owners, not changes by this account worker. The final parent lint supersedes the transient public-home tooltip guardrail failure. A further build request after the last presentation-only polish encountered another worker's Next build lock; no process was killed or lock removed. The successful full build above plus subsequent typecheck/focused tests are the build evidence, not a claim of a second completed build.

## Visual proof

- `audit/20-renders/`: actual application components at **1440×1000 and 390×844**, NL and EN. Initial matrix: 68 page/state cases, 102 base PNGs plus four mobile navigation-dialog PNGs. Representative viewport and full-page shots are included.
- Test-only source and reproduction: `tests/visual/account-batch1/README.md` and `capture.mjs`. The existing localhost dev-login flow was unavailable (disabled public flag and absent local secret); used isolated fixtures, not a production auth bypass. Convex/auth/telemetry are mocked, while real page/layout/UI code, compiled Next CSS, fonts and assets render in Chromium.
- Fixtures cover filled/empty/loading/missing-weight Dashboard; filled/empty/loading/edit Profile; all four improve routes plus loading/missing profile; login email/code/error. All fixture identities, sessions and advice are synthetic and remain outside live application defaults.
- Parent inspected desktop/mobile Dashboard, Profile, Login and improve screenshots, plus the mobile More dialog. Corrected the profile grid's oversized gap, the dialog title contrast, and selected/collapsed exercise backgrounds. The global feedback launcher clears the bottom tabs.
- Final focused refreshes cover the corrected Profile, navigation dialog and all 24 improve-route cases. **106 final PNGs**, zero reported runtime errors, horizontal overflow or undersized visible controls. Base UI's visually hidden native range input is not the interaction surface; the real slider surface measured 44px high. Full capture boundaries, fingerprints and final results: `20-render-handoff.md`.
- Mobile navigation has browser checks for both openers, focus containment, Escape focus restoration and desktop-resize dismissal. These complement unit auth-guard/locale tests; fixture screenshots do not certify real email delivery, OAuth, backend writes or image optimization.

## Shared UI follow-up for lead/C

- Existing `AccessibleDialog` uses a 32px close control and has no class override prop. This pass leaves shared UI untouched as instructed; its inherited close target in existing profile/photo dialogs should be raised to 44px by the UI owner. The new account navigation dialog already uses its own 44px close control over the shared dialog primitive.
- Shared ghost Button background utilities can override consumer background classes on hover-capable devices. ProfileImprove now supplies the page's explicit state color via the supported `style` prop (paper collapsed, lime expanded); route the shared override-order behavior to the UI owner rather than changing shared UI here.
- Existing garage questionnaire answer strings and some profile help/schema copy remain English in NL, as before. Presentation changes do not rewrite stored values or shared dictionaries. See `output-20-batch1-profile.md` for preserved optional-measurement prediction behavior.
