# M4 settings UI removal

Status: DONE M4 settings-ui. Source ready for parent/A combined gates.

## Changes

- Removed the complete settings integration card, connect/disconnect consent and handlers, callback toast, import entry point and all settings integration queries/actions.
- Removed dashboard auto-import mounting and deleted the auto-import component/helper/tests and bike-import component/helper/tests.
- Removed the integration dictionaries from EN/NL, related translation helpers and connection error copy; retained the unrelated subscription upgrade description without its removed feature claim.
- Removed obsolete integration query fixtures from account-batch1, account-batch2, account-batch4 and account-dark-c, and updated their applicable README exclusions.
- Preserved remaining settings cards, account deletion confirmation, name/units autosave, theme/language controls, billing behavior, app install card, privacy links and dashboard layout.
- No feature placeholder remains. Existing bike records and legacy source fields were not touched; no bike-list/detail filtering or backend/schema changes are part of this scope.

## Focused verification

Passed: 4 test files / 25 tests:
`npx vitest run 'src/app/(dashboard)/settings/page.test.tsx' 'src/app/(dashboard)/layout.test.tsx' src/i18n/account/settingsLanguage.test.ts src/i18n/messages/messages-parity.test.ts`

Added EN/NL assertions for no rendered Strava copy, no settings integration calls (only current-user query, no actions), no dashboard integration queries/auto-import, no integration placeholder and no Strava dictionary content. Existing settings validation, autosave, loading, delete confirmation and dashboard navigation checks still pass.

Scoped ESLint passed for settings page/tests, DashboardLayoutClient/layout test, settingsLanguage/tests, toolsSettings and both dictionaries. Scoped `git diff --check` passed.

Search of src/tests found no remaining references to the deleted component/helper exports or settings integration dictionary. Scoped implementation/visual-fixture Strava searches return only negative regression assertions.

Vitest emitted its existing config-loader warning and a jsdom navigation warning; the run exited successfully. No visual capture, build, full gate, production access, environment change, mail, commit or deploy was performed.

## Handoff

Parent/A owns combined typecheck, full tests, build and crawl. Other M4 workers own backend/admin/profile work; parent owns proxy, legacy profile inputs and wider docs. This worker made no changes to convex/schema.ts or any backend file, and did not execute any data cleanup. Scope manifest: files-M4-settings-ui.txt. The shared plan README remains parent-owned for coordinated M4 status.
