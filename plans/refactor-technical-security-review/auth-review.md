# Authentication and registration review — 2026-09-27

## Findings and implemented changes

1. **P1: login form hydration mismatch (confirmed in browser by the integration owner).** `AuthField` initialized its markup from `typeof window`, producing a native input on the server but an input wrapped in a Base UI field in the browser. This triggers React hydration recovery on the critical signup screen. It now renders the same accessible input and help markup on both sides. The report does not equate hydration recovery with proof that every registration failed.
2. **P1: email delivery could report false success and leak codes.** When `AUTH_RESEND_KEY` was absent, the backend logged the recipient and OTP and returned success without sending an email. Missing/blank configuration now raises an error before the rate limit or mail client runs; OTP logging is removed. Mocked delivery failures and throttling propagate correctly. The integration owner's live production request succeeded, so missing configuration is a conditional failure mode, not the demonstrated production cause.
3. **P1: privileged localhost authentication had insufficient environment and request guards.** The provider was enabled whenever a secret existed; its internal mutation grants administrative privileges. Provider authorization and the internal mutation now also require an explicitly local `SITE_URL` and reject production environment/deployment markers. The Next route requires development mode, rejects production deployment markers, verifies the request is local and same-origin, and validates its body. Local development credentials must not be configured on production infrastructure. The stricter guard intentionally disables this convenience flow on public sites and production builds.
4. **P2: login success was declared without checking whether a session was established.** The page now checks Convex Auth's `signingIn` result before showing success or logging verification. Navigation follows authenticated state rather than an unconditional delayed reload. Email-send and verification failure tests assert that success is not shown.
5. **P2: pasted OTP whitespace caused avoidable verification failures.** The field now strips whitespace, uppercases and caps codes at seven characters, requests one-time-code autofill, and sets the required length. Email inputs use email autofill and suppress capitalization/spellcheck. Email case is deliberately preserved because existing Convex account identifiers are case-sensitive; silently lowercasing would risk selecting a different account for an existing user.
6. **P2: unverified email requests counted as user activity.** Convex Auth invokes `afterUserCreatedOrUpdated` when requesting a code, before verification. The existing callback wrote `lastLoginAt` at that stage. It now updates login activity only for verified/OAuth/credential callbacks. Existing historical timestamps have not been rewritten.

## Validation

- `npx vitest run convex/__tests__/auth.contract.test.ts convex/__tests__/authRateLimit.contract.test.ts convex/authLocalDev.test.ts 'src/app/(auth)/login/page.test.tsx' src/app/api/auth/localhost-dev/route.test.ts`: **5 files, 29 tests passed**.
- Targeted ESLint for all eight changed auth implementation/test files: **passed**.
- Tests run after the integration owner upgraded `@convex-dev/auth` to 0.0.95 and `@auth/core` to 0.41.3. Inspected installed `signIn.ts`, `users.ts`, and React `client.tsx` to verify the callback sequence and `signingIn` return contract still apply.
- No real emails, real accounts, deployments, or secret values were accessed by this reviewer. The integration owner separately coordinates the user's authorized production email test and browser validation.

## Remaining operational checks and constraints

- Distinguish requested accounts from confirmed registrations. Convex Auth creates an unverified `users` document before sending a code. A raw users-table total does not measure completed signup. Inspect `emailVerificationTime`, provider/account type, authentication sessions, and successful-login events together.
- Consent-dependent marketing events are an incomplete funnel. Users who decline tracking will not appear there. Do not conclude zero registrations from marketing analytics alone.
- The existing durable rate limiter is called from the provider's delivery hook. Convex Auth creates/replaces the pending code before that hook runs, so a throttled or failed resend can invalidate the previous code. Fixing this ordering requires a carefully designed preflight/wrapper or upstream integration rather than removing throttling; the current review leaves the limiter intact.
- Google requires matching frontend enablement and backend credentials, correct `SITE_URL`, and provider redirect configuration. Code review cannot prove the connected Google project's consent-screen/testing restrictions or callback allowlist.
- Confirm actual new-account provisioning with an explicitly authorized fresh address, received code, session, and first dashboard load. Mocked provider tests and an existing-account login do not prove that entire path.
- Observe Resend delivery outcomes (including bounces/spam), production auth logs, and traffic-to-login conversion over a representative period before assigning a single business cause for low registrations.

## Primary references

- [Convex Auth OTP configuration](https://github.com/get-convex/convex-auth/blob/main/docs/pages/config/otps.mdx)
- [Convex Auth email provider contract](https://github.com/get-convex/convex-auth/blob/main/src/providers/Email.ts)
- [Convex authentication debugging](https://docs.convex.dev/auth/debug)

## Independent integration review and onboarding follow-up

The second review found an additional **P1 onboarding-to-fit blocker**: the wizard stored `hasPain: "yes"` for any comfort score below 5 without collecting/storing `painAreas`, while both frontend and backend completeness checks require at least one pain location. Users could finish the wizard and then be blocked from starting a fit. The wizard also treated the four required riding-style questions as optional. Existing backend flow coverage used only a pain-free, already-complete profile, so it missed this path.

Implemented:

- The Comfort step now collects the rider's actual pain locations using the existing accessible multiple-choice component and localized pain-area labels. Continuing with discomfort requires a selected location.
- Profile save and wizard edit defaults carry those selections; selecting no discomfort clears stale location selections.
- Completion requires answers to the four existing riding-style questions, with English/Dutch guidance. Their absence does not suppress earlier-step discomfort validation.
- The login email helper now clearly covers creating a new account and signing in, in both languages.
- The auth input explicitly retains the tooltip prop required by the repository's guardrail; consistent server/client markup remains intact.

Additional evidence:

- Seven schema/completeness tests cover missing pain areas, selected-area persistence, frontend/backend fit eligibility, no-pain clearing, and all four required riding questions.
- A real React form interaction test selects discomfort, rejects submission without a location, then submits the rider-selected location.
- The in-memory backend communication suite now includes wizard data → profile save → successful session creation with discomfort, alongside the existing profile → questionnaire → recommendation → email coverage. This remains mocked backend coverage, not a live new-user onboarding claim.
- Targeted follow-up run: **5 files, 24 tests passed** (wizard schema, Comfort UI, backend communication, login UI, i18n message parity).
- Full TypeScript checking, targeted ESLint, and tooltip guardrail all pass after this follow-up.

Lifecycle and middleware review:

- In installed Convex Auth 0.0.95, `verifyCodeAndSignIn.ts` calls `upsertUserAndAccount` with `type: "verification"` after successful OTP validation and before session creation in the same mutation. The changed `lastLoginAt` callback therefore captures actual OTP verification, and a failed transaction cannot commit that timestamp independently.
- Google updates occur during the OAuth profile callback; `lastLoginAt` is still not a universal final-session audit record. Raw admin user totals still include unverified requested accounts. Historical data has not been migrated.
- Request CSP propagation and the response policy use the same nonce in both normal and locale-rewrite paths. No new auth/CSP regression was identified in this code review. Browser enforcement remains the integration owner's validation responsibility.
- The stricter localhost login intentionally requires development mode and a local site configuration. Production builds do not offer this administrative shortcut; ordinary email/OAuth login remains separate.

Final onboarding usability check: Step 6 now presents an English/Dutch `role="alert"` summary when a required riding-style answer is missing. Save remains available to trigger form validation instead of silently staying disabled. Both localized incomplete-submit regressions pass, alongside the comfort/schema tests (**3 files, 10 tests**); TypeScript and targeted ESLint pass. No backend mutation runs for an invalid submission.
