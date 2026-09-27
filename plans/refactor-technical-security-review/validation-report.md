# Integrated review and validation — 2026-09-27

## Outcome

Three specialist agents reviewed and improved authentication/onboarding, backend/API security, and frontend performance. A second review pass checked the integrated changes. Work is on `codex/technical-security-review`, based on `a2da02d`. The review changes have not been pushed or deployed.

## Registration diagnosis

Confirmed defects fixed:

- The live production login page emitted React error 418; local development reproduced the precise server/client input-markup mismatch. The repaired login renders without browser errors in both development and a local production build.
- Missing email delivery configuration silently returned success and logged OTPs. It now fails visibly and never logs codes. This is a conditional configuration failure, not proof of the live incident's cause.
- The measurement wizard let riders reporting discomfort finish without pain locations, then both fit-start gates rejected the profile. The wizard now collects real locations, requires the existing riding-style answers, and shows localized validation errors.
- An unverified code request updated `lastLoginAt`; this no longer counts as successful login activity.
- Consent accepted after page load did not trigger the marketing view event. The listener now records that view once after consent.
- Public calculator CTA copy implied that anonymous results would be saved after signup, although there is no transfer/persistence bridge. English/Dutch copy now promises personalized follow-up accurately.

The authorized live test reached the verification-code screen after an email request. Mailbox receipt, code verification, fresh-account creation, and first authenticated dashboard load remain unverified pending the user's code/confirmation. The supplied address was not proven to be a previously unused account. Google OAuth was reviewed in code but not completed with a Google identity. Do not report that all registration paths are working or that one defect explains the absence of registrations.

Raw user totals include unverified code requests. Consent-dependent analytics omit visitors who decline tracking. Diagnose the business issue using verified account/session events, delivery/bounce outcomes, and traffic to the signup page together.

## Main technical/security changes

- Removed client-controlled Stripe customer binding and generic authenticated file deletion; added Stripe ownership checks, subscription price checks, current invoice parsing, event-order regressions, and shared-photo/avatar reference protection.
- Blocked redirects to unapproved hosts and bounded streamed downloads in Marktplaats fetches. PDF rendering disables JavaScript/service workers and permits only trusted image endpoints without redirects.
- Restricted the privileged development login by site/environment and request origin.
- Forwarded the generated CSP into the Next.js render request, preserved nonce-protected production scripts/styles, enabled development-only debugging requirements, and permitted only the configured HTTPS Sentry ingestion origin. Component style attributes remain allowed for positioning; production inline script execution and eval remain blocked.
- Updated Next.js 16.2.9 → 16.3.6, React 19.2.3 → 19.3.0, Convex Auth 0.0.91 → 0.0.95, Auth.js Core 0.37.x → 0.41.3, Vitest 4.1.4 → 4.1.11, ESLint Next config, and vulnerable transitive packages.
- CI now uses Node 24 LTS, read-only repository permissions, and a high/critical dependency-advisory gate. `.nvmrc` documents the runtime major. The workstation's globally installed Node binary was not replaced.
- Removed baseline lint errors and unsafe guide import types. Administrative tooltip exemptions are explicitly classified consistently with the existing guard; required rider measurement tooltips remain enforced.

## Performance evidence

- Preferred hero video: 1,166,896-byte WebM → 615,698-byte MP4, **47.2% fewer bytes** for browsers that previously chose WebM. The initial page uses the 67,539-byte poster; video waits for readiness and is omitted for reduced-motion/data-saver/slow connections.
- Feedback form and signed-in user menu load on demand. The feedback dialog opened successfully on its first click in the browser.
- Featured-bike subscriptions skip hidden mobile/offscreen content until needed.
- Blog content streams separately, so its backend request does not hold up the homepage shell. Blog images below the fold are lazy and have responsive sizes.

These are implementation and asset-transfer improvements, not a measured Lighthouse/Core Web Vitals score claim. Production field measurements need traffic after deployment.

## Validation evidence

| Check | Baseline | Final |
| --- | --- | --- |
| Complete Vitest suite | 169 files pass / 11 fail; 628 tests pass / 12 fail | **194 files / 742 tests pass** |
| TypeScript | Pass | Pass, including production build typecheck |
| ESLint | 12 errors / 11 warnings | **0 errors / 0 warnings** |
| Runtime boundaries | Not reached by full lint | Pass |
| Tooltip guard | Existing untracked controls, auth wrapper issue | Pass, 48 tracked form-control files |
| Dependency audit | 15 packages flagged: 3 critical, 8 high, 4 moderate | **0 reported vulnerabilities** |
| Production build | Not measured initially | Compiles, typechecks, generates 227 static pages |
| Public HTTP smoke | Not measured initially | 20 routes return expected pages/redirects; login script nonces match CSP |
| PDF renderer | Mock coverage | Agent also produced an 8,905-byte PDF using real hardened Chromium |

Browser checks: development login without runtime errors; production homepage without runtime errors; homepage CTA → public bike-fit calculator → results using synthetic 180 cm / 84 cm inputs → signup; feedback dialog first-open; Dutch login; mobile login at 390 × 844. Protected dashboard/fit routes redirect anonymous requests to the matching localized login. No live Stripe transaction, destructive action, or production backend deployment was performed.

Reproduce the local HTTP/CSP checks after `npm run build`: start `npm run start -- --port 3001`, then `npm run test:smoke:local`. The smoke command accepts only a local server.

## Release requirements and remaining work

1. Validate and release frontend and Convex backend/schema together. New storage-reference indexes and removed unsafe public mutations require coordinated rollout. Local frontend browser checks use the previously configured backend; they do not deploy or exercise changed Convex code remotely.
2. Verify live Stripe price-to-plan configuration and existing customer `metadata.userId` bindings. Legacy unmatched bindings intentionally return 409 and require trusted reconciliation.
3. Complete a fresh-user email-code test and Google OAuth test against the deployed candidate, including first profile, first fit, report export, sign-out/sign-in, and email receipt. Do not use privileged development login as evidence of public signup success.
4. Review auth/email logs and Resend delivery results to establish the actual registration incident cause. Failed/throttled resends can invalidate the previous OTP due to the upstream provider lifecycle; this limitation remains documented.
5. Separate follow-up designs remain for full account erasure across newer tables/auth sessions, an upload ownership ledger/orphan cleanup, distributed abuse budgets, and comprehensive Stripe event reconciliation. These require data-retention and rollout decisions; this review is not a security certification.
6. A true anonymous calculator → saved account result handoff is not implemented. Current copy no longer claims it exists.

## References and detailed reviews

- [Authentication and onboarding review](auth-review.md)
- [Backend/API security review and operational caveats](security-review.md)
- [Frontend performance review](performance-review.md)
- [Next.js CSP guidance](https://nextjs.org/docs/app/guides/content-security-policy)
- [Auth.js email-normalization advisory](https://github.com/advisories/GHSA-7rqj-j65f-68wh)
- [Next.js image-optimization advisory](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4)
- [Node.js supported release lifecycle](https://nodejs.org/en/about/previous-releases)
