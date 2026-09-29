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
- Plan label uses the real user tier. Usage is the actual `sessions.listByUser` count. **No invented “1 of 1” quota or progress bar:** the existing sessions create mutation has no enforced allowance and exposes no entitlement denominator. Unknown user/usage renders an ellipsis rather than a fake subscription/count.
- Payment-paused copy appears only when the existing `isStripeBillingEnabled()` configuration disables billing, not unconditionally as in the fixture board. Settings remains available, with no fabricated upgrade checkout.

## Page preservation

- Dashboard retains real garage, fit advice, profile, photo-upload and report flows; localized profile indicators and missing-weight action accompany the redesign.
- Profile retains the existing measurement and assessment data contracts.
- ProfileImprove retains all four route contents and edit destinations; missing profiles do not receive an invented score, exercises expand with accessible controls.
- Login retains email-code authentication (seven-character codes), Google, resend cooldown, errors, redirects, campaign attribution and localhost dev-login behavior. Its approved layout replaces the old narrow card, not its authentication logic.

## Validation

- Initial parent typecheck passed; focused shell tests: 5 passed. Existing `test:e2e:i18n`: 2 passed (locale/proxy smoke, not a live authenticated browser test).
- Full-suite results and screenshot proof will be recorded after integration below.
