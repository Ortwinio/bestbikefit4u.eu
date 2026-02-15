# Output 05: Governance And Release Controls

## Date

2026-02-15

## Implemented

1. Added PR checklist template:
   - `.github/pull_request_template.md`
   - Includes quality checks, plan/docs hygiene, migration/seed impact, and release risk checks.
2. Strengthened CI workflow governance:
   - Updated `.github/workflows/ci.yml`
   - Added deterministic build check (`npm run build -- --webpack`)
   - Added PR policy gate: if `plans/**/NN-*.md` changes, matching `plans/**/README.md` must also change.
3. Added engineering governance document:
   - `docs/ENGINEERING_GOVERNANCE.md`
   - Defines required pre-merge checks, branch protection required checks, weekly maintenance routine, ownership model, and failure handling.
4. Added release readiness checklist:
   - `docs/RELEASE_READINESS_CHECKLIST.md`
   - Covers functional smoke paths, security/access control, recommendation integrity, migration safety, and sign-off.

## Ownership Captured

- Plan curation owner: `@ortwinverreck`
- Quality gate owner: `@ortwinverreck`
- Release checklist owner: `@ortwinverreck`

## Notes

- Enforcing CI checks as truly non-optional requires branch protection settings on `main` in repository settings; this is documented in `docs/ENGINEERING_GOVERNANCE.md`.
