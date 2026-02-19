# Output 03: Validate Failure Modes And Logs

Date: 2026-02-19
Owner: `@codex`

## Result

Step 03 status: `PASS`

Controlled failure scenarios produce explicit, actionable errors, and production logs contain enough context (function, requestId, error stack) for diagnosis.

## Controlled Negative Tests

## 1) Invalid `from` format

Request:

- `from`: `BestBikeFit4U <noreply@notifications.@bestbikefit4u.eu>`

Response:

```json
{"statusCode":422,"name":"validation_error","message":"Invalid `from` field. The email address needs to follow the `email@example.com` or `Name <email@example.com>` format."}
```

## 2) Unauthorized sender domain

Request:

- `from`: `BestBikeFit4U <noreply@bestbikefit4u.eu>`

Response:

```json
{"statusCode":403,"message":"Not authorized to send emails from bestbikefit4u.eu"}
```

## 3) Invalid API key (controlled test key)

Request:

- `Authorization: Bearer re_invalid_key_for_test`

Response:

```json
{"statusCode":401,"name":"validation_error","message":"API key is invalid"}
```

## App-Level Error Propagation

### Backend validation points

- `convex/auth.ts:91` throws `"Invalid email address format"` on bad sign-in email.
- `convex/emails/actions.ts:36` throws `"Invalid email address format"` on bad report recipient email.
- `convex/emails/actions.ts:41` throws `"Reports can only be sent to your own email address"` on ownership mismatch.

### Production function invocation evidence

1. `auth:signIn` with invalid email:
   - CLI failure includes:
     - `Uncaught Error: Invalid email address format`
2. `emails/actions:sendFitReport` with `recipientEmail: "not-an-email"`:
   - Request ID in CLI: `2228c9d7766b3b2e`
   - Logs show:
     - `Uncaught Error: Invalid email address format` (`convex/emails/actions.ts:39`)
3. `emails/actions:sendFitReport` with different recipient:
   - Request ID in CLI: `c4729b81c4fd7dfb`
   - Logs show:
     - `Uncaught Error: Reports can only be sent to your own email address` (`convex/emails/actions.ts:43`)

### Frontend handling paths

- Login flow catches send/resend failures and shows user-facing messages:
  - `src/app/(auth)/login/page.tsx:140`
  - `src/app/(auth)/login/page.tsx:176`
- Report email flow captures backend errors and displays them in modal:
  - `src/app/(dashboard)/fit/[sessionId]/results/page.tsx:120`
  - `src/app/(dashboard)/fit/[sessionId]/results/page.tsx:304`
- Error message extraction returns server error message when available:
  - `src/lib/telemetry.ts:13`

## Observability Evidence

Production logs query:

```bash
npx convex logs --prod --history 200 --jsonl
```

Observed success sample:

- `identifier`: `emails/actions:sendFitReport`
- `requestId`: `17a7dfb02a16c2eb`
- `error`: `null`
- `environment`: `node`

Observed failure samples:

1. `auth:signIn` failure:
   - `requestId`: `02d183eb553d0a54`
   - `error`: `Uncaught Error: Invalid email address format`
2. `emails/actions:sendFitReport` ownership failure:
   - `requestId`: `c4729b81c4fd7dfb`
   - `error`: `Uncaught Error: Reports can only be sent to your own email address`
3. `emails/actions:sendFitReport` invalid email failure:
   - `requestId`: `2228c9d7766b3b2e`
   - `error`: `Uncaught Error: Invalid email address format`

## Triage Flow (Command-Driven)

1. Verify Convex prod env:

```bash
npx convex env list --prod
```

2. Probe sender authorization directly:

```bash
curl -sS https://api.resend.com/emails \
  -H "Authorization: Bearer $AUTH_RESEND_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>","to":["<test-email>"],"subject":"probe","html":"<p>probe</p>"}'
```

3. Trigger app auth send path:

```bash
npx convex run auth:signIn '{"provider":"resend","params":{"email":"<test-email>"}}' --prod
```

4. Inspect logs around failures:

```bash
npx convex logs --prod --history 200 --jsonl
```

5. Map by request ID from CLI failure output to exact backend error in logs.

## Typical Root Causes And Fixes

1. `403 Not authorized to send emails from ...`
   - Cause: wrong sender domain/subdomain or unverified sender domain.
   - Fix: use verified sender (`noreply@notifications.bestbikefit4u.eu`) and update `AUTH_EMAIL_FROM`.
2. `422 Invalid from field`
   - Cause: malformed sender format.
   - Fix: enforce `Name <email@domain>` formatting.
3. `401 API key is invalid`
   - Cause: wrong/revoked key.
   - Fix: rotate key in Resend and update `AUTH_RESEND_KEY` in Convex prod env.

## Exit Criteria Check

- [x] Failure modes reproduced intentionally and safely.
- [x] Error messages are actionable.
- [x] Success/failure visibility in logs confirmed.
