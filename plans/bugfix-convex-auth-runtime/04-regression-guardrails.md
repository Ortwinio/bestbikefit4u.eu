# Step 04: Regression Guardrails

## Objective

Prevent reintroduction of Node-runtime-incompatible code in auth-critical Convex files.

## Inputs

- Outputs from steps 01-03
- Current lint/test setup (`eslint`, `vitest`, CI scripts)

## Tasks

1. Add a targeted guardrail (lint rule, test, or script) that fails when Node builtin imports are introduced in non-Node Convex runtime files.
2. Document runtime boundary rules for future contributors in a developer-facing doc.
3. Add/update plan status and summarize rollout guidance:
   - What changed.
   - Why it was failing.
   - How to verify health quickly.
4. Define rollback or hotfix path in case auth delivery regresses post-deploy.

## Deliverable

- Guardrail changes in repo tooling/docs
- `plans/bugfix-convex-auth-runtime/output-04-regression-guardrails.md`

## Completion Checklist

- [ ] Guardrail is automated and actionable.
- [ ] Runtime boundary guidance is documented.
- [ ] Plan README status is updated to reflect completion.
- [ ] Rollback guidance is explicit.
