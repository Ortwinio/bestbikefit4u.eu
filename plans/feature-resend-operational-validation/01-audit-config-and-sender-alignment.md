# Step 01: Audit Config And Sender Alignment

## Objective

Verify that production configuration, code defaults, and Resend dashboard settings all point to the same authorized sender identity.

## Inputs

- `.env.example`
- `convex/lib/brand.ts`
- `convex/auth.ts`
- `convex/emails/actions.ts`
- `docs/VERCEL_DEPLOYMENT.md`
- Convex prod env (`npx convex env list --prod`)
- Resend Dashboard (Domains + API Keys)

## Tasks

1. Confirm code sender resolution path:
   - `process.env.AUTH_EMAIL_FROM || BRAND.authEmailFrom`
   - Capture file/line references for both auth and report send paths.
2. Confirm Convex production env contains:
   - `AUTH_EMAIL_FROM=BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>`
   - `AUTH_RESEND_KEY` present
   - `SITE_URL=https://bestbikefit4u.eu`
3. In Resend dashboard, confirm:
   - Domain/subdomain used in sender is verified.
   - API key belongs to the same team/workspace as the verified domain.
   - API key permissions allow sending for this domain.
4. Record mismatches and exact remediation commands.

## Deliverable

- `plans/feature-resend-operational-validation/output-01-audit-config-and-sender-alignment.md`

## Completion Checklist

- [ ] Sender identity is fully aligned across code, env, and dashboard.
- [ ] Any mismatch has a concrete fix and command.
- [ ] No ambiguity remains about which sender is authoritative.
