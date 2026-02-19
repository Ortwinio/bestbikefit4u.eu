# Output 01: Audit Config And Sender Alignment

Date: 2026-02-19
Owner: `@codex`

## Result

Step 01 status: `PASS (with one manual dashboard verification note)`

Configured sender identity is aligned across code defaults, Convex production env, and deployment docs:

- `BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>`

## Evidence

1. Sender resolution path in auth email flow:
   - `convex/auth.ts:119`
   - Uses `process.env.AUTH_EMAIL_FROM || BRAND.authEmailFrom`
2. Sender resolution path in report email flow:
   - `convex/emails/actions.ts:74`
   - Uses `process.env.AUTH_EMAIL_FROM || BRAND.authEmailFrom`
3. Shared backend sender default:
   - `convex/lib/brand.ts:3`
   - `authEmailFrom: "BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>"`
4. Env template alignment:
   - `.env.example:15`
   - `AUTH_EMAIL_FROM=BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>`
5. Deployment doc alignment:
   - `docs/VERCEL_DEPLOYMENT.md:25`
   - `docs/VERCEL_DEPLOYMENT.md:32`
6. Convex production env check (`npx convex env list --prod`):
   - `AUTH_EMAIL_FROM=BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>`
   - `AUTH_RESEND_KEY` present (value redacted)
   - `SITE_URL=https://bestbikefit4u.eu`
7. Resend API authorization probe:
   - `POST /emails` with sender `BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>` succeeded.
   - Response: `{"id":"0e0ddc89-d028-42cb-90d2-e133af734043"}`

## Resend Dashboard/Key Scope Assessment

- `GET /domains` with the current API key returned:
  - `{"statusCode":401,"message":"This API key is restricted to only send emails","name":"restricted_api_key"}`
- Interpretation:
  - This key is send-only (expected for least privilege).
  - Direct domain-list introspection is blocked for this key.
  - Successful `POST /emails` from the configured sender strongly indicates effective authorization for this sender/domain.

Manual dashboard check still recommended for explicit audit trail:

1. Confirm `notifications.bestbikefit4u.eu` is `Verified` in Resend Domains.
2. Confirm this key belongs to the same Resend team/workspace as that verified domain.

## Mismatches Found

- None in code/env/docs for sender identity.
- No runtime mismatch observed for sender authorization in API send probe.

## Remediation Commands (If Drift Reappears)

```bash
npx convex env set AUTH_EMAIL_FROM 'BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>' --prod
npx convex env set SITE_URL https://bestbikefit4u.eu --prod
npx convex env set AUTH_RESEND_KEY '<new_resend_key>' --prod
npx convex deploy -y
```

## Exit Criteria Check

- [x] Sender identity aligned across code, env, and docs.
- [x] Concrete remediation commands captured.
- [x] Authoritative sender is unambiguous.
- [x] API-level authorization evidence captured.
