# R7 prompt contract test sidecar

Status: DONE R7-prompts-tests. Worktree: `/Users/ortwinverreck/Developer/bestbikefit4u-rider`.

## Exact ownership

Only source/test file: `convex/profiles/prompts.contract.test.ts` (new, 54 tests).
Source-only manifest: `files-R7-prompts-tests.txt` beside this note.
No production, planner, schema, UI, migration, or other test files were edited.

The initially referenced `messages/B-R7-contract.md` was absent during inspection. Tests follow the parent's explicit session updates and the landed real `convex/profiles/prompts.ts` functions. Updated contracts for dynamic eligibility, idempotent dismiss retries, FTP derivation, saddle metadata, and bike-type delegation are incorporated.

## Coverage

- Real `_handler` calls for `nextPrompts`, `openPromptCard`, `dismissPromptCard`, `skipProfilePrompt`, `answerProfilePrompt`, and `recordPromptInterest`.
- Read-only queries; no profile/default materialization on card opening; at most two reserved questions and one measurement question; repeated rendering and a second tab reuse the committed reservation without writes.
- One card per 24 hours across sessions, exact 24-hour expiry, and the original two slots remain the lifetime cap for the same session even days later.
- Explicit seven-day dismissal; retry returns null without extending the original deadline; hidden skip/answer operations reject.
- Fourteen-day per-question skip, duplicate-click idempotency, and third skip permanently switches to profile-only across future sessions.
- Sensitive fields are neither selected nor accepted through forged reserved slots.
- Authentication before database access; foreign user/session/card rejection; deleted/foreign bike rejection; no writes on rejected operations.
- Explicit answer provenance with correct kind, method, value, source, and date; duplicate submission has no writes; partial-profile creation does not fill absent values.
- Twenty-minute FTP-test answers are derived, never measured; existing measured FTP cannot be replaced by derived FTP.
- Concurrent profile changes produce a conflict with zero writes. If the new current value makes the slot ineligible, it disappears and a subsequent fresh comparison is rejected rather than overwriting it.
- An answer that pushes completeness above 90% hides other non-stale pending slots without replacing reservations; those answers are rejected.
- Actual observation-date boundaries for weight/FTP (six months) and flexibility (12 months); unknown/fresh FTP is not falsely stale; confirming an unchanged stale value supersedes evidence and refreshes its actual date.
- Bike saddle measurement requires its reference point and preserves other setup fields. Estimated saddle answers clear prior measurement metadata; a saddle reference point on rider/crank fields is rejected.
- Bike-type updates delegate to the existing `bikes/mutations:update` reference with `bikeTypeSource: user` and `needsTypeConfirmation: false`; unsupported bike types are rejected.
- Prompt-interest writes contain only owner, allowlisted calculator, and timestamp; updates reuse one row. Measurement-bearing/non-allowlisted calculator strings and unauthenticated writes are rejected.

## Fixture design and limits

Authentication mocks `getAuthUserId` and `getAuthSessionId` (initially `owner` / `session1`). The fixture includes a real user row with `lastLoginAt`. Existing physical values have matching measured observations with real dates so conservative virtual legacy evidence cannot accidentally outrank the intended missing arm/FTP fields. Bike tests retain a rider profile below the >90% suppression threshold.

The fake database supports chainable index comparisons, expression `field`/`eq`/`neq`/comparisons/`and`/`or`/`not`, filtering, `collect`, `unique`, `first`, `take`, `order`, and `orderBy`. It respects shown/updated-time ordering where used, clones inserted/returned values, and applies patch deletion semantics for undefined top-level fields. Write spies assert that conflicts and rejection paths attempt no writes.

The two-tab test exercises sequentially committed reservations, matching serialized Convex mutation outcomes. It does not emulate Convex's transaction conflict/retry engine or assert rollback of partially executed fake transactions.

The fake `runMutation` verifies the exact bike-update function reference and applies an owner-checked patch. Tests verify delegation and arguments; they do not reimplement or claim to verify that mutation's default-bike-profile/public-snapshot side effects. Those remain covered by the existing bike mutation tests and real Convex atomicity.

## Verification

```sh
npm test -- convex/profiles/prompts.contract.test.ts
```

Result: **54/54 tests pass**.

```sh
npm test -- convex/profiles/prompts.contract.test.ts shared/profilePromptPolicy.test.ts
npx eslint convex/profiles/prompts.contract.test.ts
```

Result: **84/84 tests pass across two suites** (54 owned contract tests plus 30 planner tests owned by the policy sidecar); targeted ESLint passes.

Final resumed verification (3 October 2026, run started 12:11): the combined contract/policy command again passes **84/84 tests**, targeted ESLint passes, and `npm run typecheck -- --incremental false` now **passes with exit code 0 and no diagnostics**. This supersedes the earlier typecheck result blocked by concurrent R1 changes. No source changes were needed for this final recheck.

The parent's final full Convex/policy/UI run is separate and was still running at handoff. No full-backend success claim is made for the earlier parent's snapshot of 624 passed / one failed: its outdated hidden-dismiss expectation is corrected, with a separate explicit idempotent-dismiss regression passing.

This sidecar owns backend tests only. R7 UI components, their tests, and renders remain with the UI owner; there are no R7 render artifacts in this source manifest.

No commits, deployments, dependencies, or production-file changes.
