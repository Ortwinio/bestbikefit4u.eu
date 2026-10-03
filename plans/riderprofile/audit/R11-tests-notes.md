# R11 newsletter backend test sidecar

Status: DONE R11-tests; repository typecheck remains with the integration owners. Worktree: `/Users/ortwinverreck/Developer/bestbikefit4u-rider`.

## Exact source ownership

- `convex/emails/__tests__/newsletter.contract.test.ts` — new newsletter mutation/action contract suite (35 tests).
- `convex/emails/__tests__/preferences.test.ts` — updated existing normalized-preference assertions and action routing; expanded token/HTTP compatibility coverage (13 tests).

Source-only inventory: `files-R11-tests.txt` beside this note. No production, schema, parent signup-completion/login, UI, or other-worker test files were edited. No new dependencies, live calls, email sends, commits, or deployments.

The initially referenced `messages/B-R11-contract.md` was absent during inspection. The sidecar followed the explicit parent messages and the landed backend/shared types. Its temporary backend coordination message was resolved and removed after the API landed.

## Verified contracts

- Missing newsletter preference normalizes to false without altering legacy service/marketing defaults; read operations do not persist defaults. Omitting newsletter preserves its existing value and historical consent metadata in authenticated and signed preference saves.
- Explicit signup/profile/preferences grants record server-generated consent date, allowed source, locale, and exact wording version. Both locales are covered. Receipt rows contain only owner/request/subscription/source/locale/version/server date; other users and legacy categories remain unchanged.
- Explicit false records a receipt without inventing grant metadata. Invalid request IDs, locale/version, source, and non-boolean preferences reject with zero writes.
- Lost-response retries return no new grant, produce one receipt, and do not restamp metadata. Replaying a declined request with true cannot enable newsletter. Replaying accepted consent after unsubscribe cannot re-enable newsletter; replaying a full preference save cannot restore other disabled categories either. A fresh explicit request can grant again. Request IDs are scoped to the owner.
- A new consent request while already subscribed returns `newsletterGranted: false`, preserving the original grant metadata while recording the new receipt.
- Authenticated setters require an existing authenticated user. Signup requires matching normalized expected email and a finite verification time; missing/mismatched email and unverified accounts reject before writes. Identity is rechecked even for a previously accepted receipt. Signed preference actions remain scoped to the token owner regardless of the logged-in account.
- Newsletter tokens cryptographically bind owner, purpose, category, and locale. Category/purpose/owner tampering fails. Existing malformed/expired/invalid-origin coverage remains intact. An unsubscribe-purpose token cannot enable preferences.
- Independently signed pre-newsletter v1 service/marketing unsubscribe tokens still work and preserve newsletter. An old v1 preferences token can still view/save legacy categories without opting into newsletter.
- HTTP GET is read-only and redirects to the private preference fragment; POST disables only the signed category. Repeated newsletter POST preserves other categories/users. Invalid/wrong-purpose GET/POST cannot mutate.

## Test harness

Tests invoke real registered `_handler` functions and route internal query/mutation references to the real preferences-data handlers. The fake database clones reads/inserts, supports indexed receipt queries, and spies on writes. HMAC links use test-only environment secrets and local `.example`/Convex fixture URLs. No network or email transport is invoked.

These tests verify sequential request replay and observed no-write paths. Convex supplies production transaction atomicity and serialization; the fake database does not emulate concurrent transaction retries.

## Verification

```sh
npm test -- convex/emails/__tests__/newsletter.contract.test.ts convex/emails/__tests__/preferences.test.ts
npx eslint convex/emails/__tests__/newsletter.contract.test.ts convex/emails/__tests__/preferences.test.ts
```

**48 tests pass across two files**. Targeted ESLint and the existing preferences diff whitespace check pass.

`npm run typecheck -- --incremental false` reports only two outside-ownership errors at the checked snapshot:

- `convex/advice/provenance.ts`: missing `InputValue` type name.
- `src/lib/calculators/chain.ts`: widened string `measurePoint` incompatible with the specific measurement-point literal.

No owned-test type diagnostics. `npm run lint` passes in full (exit code 0): ESLint, runtime boundaries, tooltips, contrast, CSS-module tokens, and image-weight checks.
