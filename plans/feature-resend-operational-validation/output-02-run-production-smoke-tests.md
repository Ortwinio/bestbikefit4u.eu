# Output 02: Run Production Smoke Tests

Date: 2026-02-19
Owner: `@codex`

## Result

Step 02 status: `IN_PROGRESS (automation complete, auth inbox receipt confirmed, report inbox verification pending)`

## Executed Tests

1. Direct Resend API smoke send
2. Production auth email trigger (`auth:signIn`)
3. Production report email action (`emails/actions:sendFitReport`)

## Evidence

### 1) Direct API smoke test

Command result:

```json
{"id":"f0e263fe-bba6-46be-9e1f-c5e15ce550cd"}
```

Send parameters used:

- `from`: `BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>`
- `to`: `qa-resend-step2+20260219@bestbikefit4u.eu`
- `subject`: `Step02 direct API smoke`

### 2) Auth flow smoke test (production path)

Command:

```bash
npx convex run auth:signIn '{"provider":"resend","params":{"email":"qa-resend-step2+20260219@bestbikefit4u.eu"}}' --prod
```

Response:

```json
{ "started": true }
```

Database evidence of auth flow execution:

- `users` contains:
  - `_id`: `ks77dyk5s52fj5n54xhzzkd3ax81eee7`
  - `email`: `qa-resend-step2+20260219@bestbikefit4u.eu`
- `authAccounts` contains resend account linked to that user.
- `authVerificationCodes` contains a resend verification-code record for that email.

### 3) Report email smoke test (production path)

To execute `sendFitReport` end-to-end, minimal production test data was created for the same test user:

- profile id: `k979qr7pca8f8qt9amff60mczd81efeh`
- fit session id: `k57721gg5azgpj6hkn5xe58ah581ejem`
- recommendation id: `kn78f01e6pmzn9n78zqchh9fy581f3qb`

Report send command response:

```json
{
  "emailId": "880ed03d-8306-43e9-a18f-39d9f884606e",
  "success": true
}
```

This confirms the application report-email send path executed successfully in production with a Resend message ID.

## Observability Notes

- `npx convex logs --prod --history 100 --success --jsonl` did not return historical lines during this capture window.
- Because the active API key is send-only, message detail endpoints returned:

```json
{"statusCode":401,"message":"This API key is restricted to only send emails","name":"restricted_api_key"}
```

This blocks programmatic retrieval of full message metadata (`from` as persisted by Resend) using the current key.

## Manual Inbox Verification

Confirmed:

1. Auth confirmation email to `ortwin@ormac.nl` was received (user-confirmed on 2026-02-19).

Still required:

1. Confirm in recipient inbox that report email was received.
2. Confirm visible sender is exactly (for both auth and report emails):
   - `BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>`

## Exit Criteria Check

- [x] Direct API send succeeded.
- [x] Auth flow send path executed (`started: true` + verification code persisted).
- [x] Report email send path succeeded (`success: true` + `emailId`).
- [x] Auth inbox receipt confirmed (`ortwin@ormac.nl`).
- [ ] Report inbox receipt confirmed.
- [ ] Sender display verified for both auth and report emails.
