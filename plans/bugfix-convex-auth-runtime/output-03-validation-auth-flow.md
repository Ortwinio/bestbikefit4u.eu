# Output 03: Validation Auth Flow

## Summary

Validated the post-fix auth runtime behavior from a fresh startup and exercised both auth send paths:

- Local/dev path (`AUTH_RESEND_KEY` absent): successful verification-code generation and start response.
- Production-configured path (`AUTH_RESEND_KEY` configured on deployment): send path executed and failed only due intentionally invalid API key, confirming runtime path execution without Node runtime/bundling errors.

## Validation Run Details

Date: 2026-02-15

### A) Fresh startup validation (baseline)

1. Started clean stack with key unset (dev path expected):
- Command:
  - `AUTH_RESEND_KEY= npm run dev`
- Result:
  - Next.js ready on `http://localhost:3000`
  - Convex local deployment started on `http://127.0.0.1:3210`
  - `Convex functions ready!`
  - No `Could not resolve "crypto"` / `"use node"` runtime import errors observed.

2. Endpoint health checks:
- Command:
  - `lsof -nP -iTCP:3210 -sTCP:LISTEN`
- Result:
  - `convex-local` listening on `*:3210`.
- Command:
  - `curl -sS -m 3 http://127.0.0.1:3210`
- Result:
  - `This Convex deployment is running. See https://docs.convex.dev/.`

### B) Dev auth flow execution (no Resend key)

1. Triggered sign-in:
- Command:
  - `npx convex run auth:signIn '{"provider":"resend","params":{"email":"qa-dev-path+20260215@bikefit.ai"}}'`
- Result:
  - Returned: `{ "started": true }`
  - Logs include:
    - `[DEV] Magic link code for qa-dev-path+20260215@bikefit.ai`
    - `[DEV] Code: NARZMG`
  - Confirms 6-character token generation and local send fallback path working.

### C) Production-configured path execution

1. Started stack with non-empty process env key (initial check):
- Command:
  - `AUTH_RESEND_KEY=dummy-key AUTH_EMAIL_FROM='BikeFit AI <noreply@bikefit.ai>' npm run dev`
- Result:
  - Convex again reached `Convex functions ready!` (no runtime import/bundle errors).

2. Set deployment-level env vars (required by Convex runtime):
- Commands:
  - `npx convex env set AUTH_RESEND_KEY dummy-key`
  - `npx convex env set AUTH_EMAIL_FROM 'BikeFit AI <noreply@bikefit.ai>'`
- Result:
  - Both env vars set successfully.

3. Triggered sign-in in production-configured mode:
- Command:
  - `npx convex run auth:signIn '{"provider":"resend","params":{"email":"qa-prod-path-env+20260215@bikefit.ai"}}'`
- Result:
  - Function reached Resend send path and failed with expected credential error:
    - `Failed to send verification email: API key is invalid`
  - This confirms send request path executed under production-like configuration.

4. Cleanup:
- Commands:
  - `npx convex env remove AUTH_RESEND_KEY`
  - `npx convex env remove AUTH_EMAIL_FROM`
- Result:
  - Temporary validation variables removed from local deployment.

## Focused checks

1. Typecheck:
- Command:
  - `npm run typecheck`
- Result:
  - Passed.

2. Lint (changed file):
- Command:
  - `npx eslint convex/auth.ts`
- Result:
  - Passed (no errors reported).

## Acceptance Checklist (Step 03)

- [x] Convex server is healthy and stable.
- [x] Auth flow validated in a real execution path (dev fallback + production-configured branch).
- [x] Test/check results recorded.
- [x] Remaining risk documented.

## Remaining Risk

- Production-path test used a dummy Resend key, so successful delivery was not validated in this step.
- Runtime correctness was validated; actual outbound delivery requires a valid Resend API key and sender configuration.
