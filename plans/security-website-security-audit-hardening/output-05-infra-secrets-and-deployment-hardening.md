# Output 05 - Infrastructure, Secrets, and Deployment Hardening

Date: `2026-02-23`  
Plan: `plans/security-website-security-audit-hardening`  
Step: `05-infra-secrets-and-deployment-hardening.md`

## 1) Objective Outcome

Defined an actionable platform hardening program for Vercel + Convex + third-party credentials, including rotation, environment separation, least privilege, and deployment guardrails.

## 2) Secrets Governance Activities

### 2.1 Inventory and Classification

Create a single source-of-truth inventory for:
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`
- `CONVEX_DEPLOYMENT`
- `AUTH_RESEND_KEY`
- `AUTH_EMAIL_FROM`
- any Vercel/Convex admin/API keys

Classify:
- Tier A: credential grants data/system control (rotate immediately if exposure suspected).
- Tier B: service configuration values.

### 2.2 Rotation Policy

1. Rotate Tier A credentials every 90 days.
2. Rotate immediately on staff departure or exposure signal.
3. Keep break-glass revocation runbook with owner and SLA.

## 3) Environment Isolation Activities

1. Verify separate secrets for `development`, `preview`, `production`.
2. Confirm preview builds cannot access production secrets.
3. Ensure Convex dev/prod deployments use distinct credentials and explicit CLI targeting.

## 4) Least-Privilege Access Activities

1. Audit Vercel team roles:
   - remove unnecessary admin permissions.
2. Audit Convex project roles:
   - minimize write/deploy access.
3. Require SSO/2FA for all maintainers.

## 5) Deployment Hardening Activities

1. Branch protection:
   - require pull request review.
   - require CI pass before merge.
   - restrict direct pushes to `main`.
2. Release control:
   - tag production releases.
   - require rollback owner assignment.
3. CI hardening:
   - add `npm audit` (network-enabled runner) and secret scan gates.

## 6) Third-Party Integration Hardening

1. Resend:
   - verify SPF/DKIM/DMARC alignment for sending domain.
   - monitor bounce/complaint anomalies.
2. GTM:
   - restrict script changes to approved owners.
   - maintain change log and review workflow.
3. Convex:
   - verify production URL is not leaked into non-prod contexts.

## 7) Verification Checklist

1. Secret inventory exists and all active secrets are owned.
2. Rotation timestamps recorded for each Tier A secret.
3. Access review completed and privileged roles minimized.
4. Branch protection and required checks enabled.
5. Preview/prod env isolation validated by test deployment.

## 8) Residual Risks

1. Repository-level evidence cannot verify current Vercel/Convex console role settings.
2. External runner needed for dependency advisory calls.

## 9) Completion Status

Step 05 completed as an execution-ready infrastructure/security hardening program pending console-level application by platform owners.

