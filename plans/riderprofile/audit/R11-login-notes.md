# R11 login capture sidecar

Only R11-login-capture.mjs and these sidecar notes/manifest authored. Existing R2 capture and application source unchanged by this worker.

Run from the rider worktree: `node plans/riderprofile/audit/R11-login-capture.mjs`.
The loopback HTTP server and Chromium require standard sandbox escalation. Existing esbuild/PostCSS/Tailwind/Playwright dependencies only.

Actual LoginPage imports actual NewsletterSignupCompletion, shared copy, components, styles and local Figtree/Bricolage/DM Mono fonts. Fake auth/Convex hooks are in-memory with per-tab fixture state. Google returns through a local redirect. No real mail, auth, Convex or analytics requests. External HTTP and WebSocket requests are blocked; service workers disabled. Fixture URL query is view state only, never consent metadata.

20 screenshots: NL/EN × 1440/390 × unchecked, checked, codechecked, googleconfirmation, failure. Paths: `plans/riderprofile/renders/R11-login-<state>-<locale>-<width>.png`. Machine-readable results: `renders/R11-login-results.json`.

Assertions cover default unchecked; unchecked email verification without mutation; checked request/code screen without mutation; locally verified matching-email subscription; Google confirmation displaying current-rider@example.test without mutation; explicit confirmation; simulated save failure with no grant event; successful retry with identical requestId/payload; value-free analytics shape; no consent values in URLs; loaded images; zero horizontal overflow and runtime/console errors. Screenshots freeze transitions so selected styling is captured accurately.

Desktop/mobile screenshots inspected for checked/unchecked, code, Google confirmation and save failure. Parent requested extra spacing between newsletter choice and Google button and supplied that app change; final captures are rerun against that source. No other app issues found in inspected states. Mobile review: `renders/R11-login-googleconfirmation-nl-390.png` (EN equivalent also present).

Focused harness ESLint passed. Whole-worktree diff check flagged an unrelated trailing blank line in convex/sessions/calculatorInputs.ts; not edited. Parent owns application tests and full gates. This fixture validates UI behavior with fake backend responses, not real OAuth or deployed backend consent enforcement.

No commits, deployments, dependencies or production actions.
