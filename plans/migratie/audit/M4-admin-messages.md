# M4 admin-messages

Complete within assigned scope, 2026-10-04. No commits, deployments, production
access, environment changes, mail sends, database writes, build or full gates.

## Changes

- Admin overview/detail and message visibility/receipt/reach queries no longer read
  integrations. Connection metrics and the admin integration tab/demo records removed.
- Removed connection audience options from message composer and release notifications.
- A stored `strava_connected` rule makes the entire message inactive, including
  false-valued rules and mixed `all` rules: no rider delivery, no receipt writes,
  zero estimated reach. Composer retains its stored target and shows a neutral
  inactive label; no conversion to a broadcast. Existing historical data is untouched.
- Ordinary broadcast, locale, plan, fit, organization and bike-type visibility remain
  supported. Existing ordinary receipt behavior preserved.
- Legacy bike source keys retained with generic Imported/Geïmporteerd labels.
  Admin detail still returns legacy imported bikes. Schema unchanged.
- Removed named integration references from score explanatory copy, feedback sample
  copy, dashboard test mocks, bike visual fixture and Dutch language detector allowlist.
- Preserved C's example.com demo-email edits and all other agents' shared-tree work.

## Focused validation

- 9 Vitest files / 33 tests passed: both message contract suites, admin query contracts,
  new admin legacy-target contracts, message/release UI helpers, user table sorting,
  feedback flow and dashboard-message-locale integration.
- importCopy.test.ts: 2 tests passed, generic legacy source labels and no branded
  integration copy in EN/NL profile, bike or feedback values.
- node --test tests/visual/final-sweep/nl-language.test.mjs: 7 passed.
- Scoped ESLint: initial single unused import warning corrected; affected-file rerun passed cleanly.
- Scoped git diff --check passed; convex/schema.ts has no diff.
- No remaining external stravaConnected/detail.integration/user.integrations consumers
  found in src/tests/convex (excluding deliberate legacy regression assertions).

## Parent/A handoff

Admin API return shapes no longer include `stravaConnected`; getUserDetail also drops
`integration`. AdminUserRow drops `stravaConnected`; demo AdminUserDetail drops
`integrations`. Notification: ../messages/M4-admin-messages-to-parent-types.md.
Parent owns runtime profile-score/advice input cleanup, final type consumers and
combined gates. No runtime cleanup mutation was invoked. Stored message text and
historical audit data were not rewritten.
