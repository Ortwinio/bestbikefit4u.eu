# Step 05 - Infrastructure, Secrets, and Deployment Hardening

## Objective
Reduce platform-level risk in Vercel/Convex and tighten secret lifecycle controls.

## Inputs
- Vercel project settings and environment variables
- Convex environment and key usage
- CI/CD workflow and deployment permissions
- Third-party provider credentials (email/analytics/etc.)

## Tasks
1. Secrets governance:
   - Inventory all secrets, classify by criticality, and remove unused values.
   - Rotate high-risk keys and enforce minimum rotation cadence.
2. Environment isolation:
   - Verify separate dev/staging/prod secrets and permissions.
   - Ensure preview deployments cannot access production-only secrets.
3. Least-privilege access:
   - Audit team roles in Vercel/Convex and reduce over-privileged access.
4. Deployment security:
   - Require protected branches, mandatory reviews, and CI pass before production deploy.
5. External dependency hardening:
   - Pin critical package ranges where practical and enforce lockfile integrity in CI.
6. Document runbook for secret rotation and emergency credential revocation.

## Deliverable
- `plans/security-website-security-audit-hardening/output-05-infra-secrets-and-deployment-hardening.md`

## Completion Checklist
- [ ] Secret inventory and rotation actions are complete.
- [ ] Environment segregation is verified.
- [ ] Access control review is complete with evidence.
- [ ] Deployment guardrails are enabled in configuration.

