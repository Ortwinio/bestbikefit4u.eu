# Step 01: Runtime Audit And Design

## Objective

Pin down exactly why `convex/auth.ts` fails to bundle and select the safest remediation pattern before code changes.

## Inputs

- `convex/auth.ts`
- `convex/http.ts`
- `convex/emails/actions.ts`
- Convex runtime guidance already referenced in current error output

## Tasks

1. Inventory runtime-sensitive code in `convex/auth.ts`:
   - Node builtin imports.
   - Environment variable usage.
   - Third-party SDK usage that may assume Node runtime.
2. Confirm which parts of auth provider config must stay in non-Node runtime context.
3. Choose implementation strategy:
   - Preferred: replace Node `crypto` usage with runtime-safe randomness API.
   - Fallback: isolate Node-only behavior in proper `"use node"` boundaries if required by SDK constraints.
4. Define expected post-fix behavior for:
   - Verification code format.
   - Rate limiting behavior.
   - Local (no Resend key) and production send paths.

## Deliverable

- `plans/bugfix-convex-auth-runtime/output-01-runtime-audit-and-design.md`

## Completion Checklist

- [ ] Root cause is documented with exact file/line references.
- [ ] Final remediation strategy is explicit and technically feasible.
- [ ] Runtime assumptions are validated, not guessed.
- [ ] No unresolved design decisions remain for implementation.
