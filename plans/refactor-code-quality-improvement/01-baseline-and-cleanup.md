# Step 01: Baseline And Cleanup

## Objective

Establish a clean quality baseline and remove local/project noise that obscures development status.

## Inputs

- `docs/DEVELOPMENT_PLAN.md`
- `plans/next-steps/README.md`
- `eslint.config.mjs`
- `src/app/(dashboard)/profile/page.tsx`
- Repository root for transient files

## Tasks

1. Remove transient artifacts from project folders (`.DS_Store`, similar OS metadata files).
2. Ensure generated Convex files are ignored by lint checks.
3. Resolve current lint warnings in maintained source files.
4. Record baseline command results: lint, typecheck, build, test-script availability.
5. Publish a short baseline report in `plans/refactor-code-quality-improvement/output-01-baseline.md`.

## Deliverable

- Clean directory baseline
- Lint configuration aligned with generated outputs
- Baseline quality report with command outcomes

## Completion Checklist

- [ ] No `.DS_Store` files remain under repository root
- [ ] Lint does not report generated Convex files
- [ ] Source lint warnings are resolved or explicitly triaged
- [ ] Baseline report committed
