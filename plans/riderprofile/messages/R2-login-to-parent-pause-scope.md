# R2 login sidecar → parent: pause scope and remaining work

The user redirected **this sidecar** to R0 in `/Users/ortwinverreck/Developer/bestbikefit4u-baseline`.
This does not pause parent-owned R2 backend, welcome, or performance work. It does not transfer ownership
of C's R1 files to this sidecar. The redirect says to resume R1 afterwards, although this sidecar was
originally assigned R2 login; parent should coordinate that naming mismatch without stopping other R2 work.

## Implemented, uncommitted

- `src/app/(auth)/login/page.tsx`: exact `handoff=1` selects the new presentation; all sign-in redirectTo
  paths (send, verify, resend, Google, local dev) use localized `/welcome`. Authenticated-state effect
  waits for `!isAuthLoading && isAuthenticated`. Normal login still goes to localized `/dashboard`.
- `src/components/account/LoginHandoffPanel.tsx`: reads C's `readHandoff()` on mount; renders actual
  field labels, values/units and provenance in RP2 lime column. Empty/unavailable storage has fallback copy.
  No imports, writes or clears. Existing form/security/code length retained; no review strip.
- `src/i18n/account/loginHandoff.ts`: EN/NL waiting panel, labels, provenance, success/verify copy.
- `plans/riderprofile/messages/R2-login-to-B-C-contract.md`: published routing/storage ownership contract.

## Verified

`npm test -- 'src/app/(auth)/login/page.test.tsx'` — **22/22 passed** after implementation.
These are the original tests, including normal login, auth failures, resend, OAuth guards and metadata.
The large handoff-specific test patch was interrupted and **did not land**; page.test.tsx remains unchanged.

## Exact remaining tests to add in page.test.tsx

Use jsdom sessionStorage as fake storage with C's real read helper; clear storage in beforeEach.
Fixture: v1 entries for inseamCm=82.5/cm/measured, currentSaddleHeightMm=731/mm/bike,
ridingGoal=balanced/none/declared, valid calculator and positive integer touchedAt.

1. EN/NL waiting title, real values (82.5/82,5 cm), translated goal, provenance; no board samples/review strip;
   one h1, no campaign card in handoff mode, storage unchanged, no values/fields in marketing calls.
2. Missing, malformed JSON, wrong-version and denied storage render empty fallback and leave sign-in usable.
3. Existing stored data without exact handoff=1 (absent, 0, true) keeps normal presentation/dashboard redirect.
4. EN/NL send+verify flow: requests carry only existing email/code/locale plus localized /welcome;
   signingIn:true alone does not navigate; authenticated + loading does not navigate;
   authenticated + !loading navigates to /welcome. Storage survives email/code/success/redirect.
5. Already-authenticated handoff with empty storage still routes to /welcome (welcome handles empty state).
6. Resend after 30-second fake-timer cooldown retains /welcome; no premature navigation or storage clearing.
7. EN/NL Google args contain only redirectTo=/locale/welcome; loading/failure guards still work.
8. Extend metadata matrix with ?handoff=1&src=saddle-height: canonical remains localized /login,
   robots remains index:false/follow:true, no hreflang.

## Remaining review and gates

- Run focused vitest after adding tests, npm run typecheck and npm run lint. None of the latter two ran
  for this sidecar. Fix owned-file findings only; communicate other-agent errors.
- Check new panel effect against lint policy and Presentation union props against typecheck.
- Review EN/NL field/value vocabulary against C's final enums; current enum translations cover common values
  and fall back to the stored string for other valid strings.
- Capture/inspect actual UI at 1440 and 390 (email/code; populated and empty); place renders under
  plans/riderprofile/renders/. No visual capture exists yet.
- Publish audit/R2-login-notes.md and audit/files-R2-login.txt, recording gates and limitations.
- Parent updates shared README progress. Do not mark login DONE until remaining validation is complete.

No commits, deploys, dependency changes or edits to C's src/lib/handoff were made.
