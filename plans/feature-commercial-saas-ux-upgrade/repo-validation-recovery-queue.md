# Repo Validation Recovery Queue

## Purpose

Convert the April 8 repo-wide validation run into an actionable recovery backlog with a fastest-path-to-green order.

This queue is intentionally scoped to repo health and merge readiness. It does not replace the homepage or calculator/FAQ acceptance-fix handoffs. It sits after those lane-specific fixes and before final merge closeout.

## Validation Snapshot

Validation run summary:

- `npm run typecheck` failed
- `npm run lint` failed
- `npm test` failed

High-signal blockers:

1. Validation noise from `.tmp/bbf4u-geometry-push`
2. PDF report route status regressions
3. Session/profile completeness contract regressions
4. Recommendation contract and scheduler regressions
5. Questionnaire contract stale mocks
6. Dashboard test harness/provider regressions
7. Small isolated contract/test regressions
8. Repo-wide typecheck blockers
9. Repo-wide lint errors

## Execution Order

1. Validation scope cleanup
2. PDF route regression
3. Session creation/profile completeness regression
4. Recommendation generation/internal mutation fixes
5. Questionnaire contract test refresh
6. Dashboard shell/provider harness fixes
7. Small isolated contract/test fixes
8. Typecheck cleanup
9. Lint error cleanup by rule family

## Task Pack

### 13. Validation scope cleanup

- Suggested owner: Lead or repo-tooling owner
- Goal: exclude `.tmp/bbf4u-geometry-push/**` from validation so `typecheck`, `lint`, and `test` report only the real tree
- File groups:
  - `vitest.config.ts`
  - `tsconfig*.json`
  - ESLint config files if `.tmp` is currently included
- Done when:
  - validation commands no longer traverse `.tmp/bbf4u-geometry-push`

### 14. PDF route regression

- Suggested owner: backend/reporting owner
- Goal: restore expected response behavior in the report PDF route
- File groups:
  - `src/app/api/reports/[sessionId]/pdf/route.ts`
  - `src/app/api/reports/[sessionId]/pdf/route.test.ts`
  - related report auth helpers if touched
- Done when:
  - PDF route tests stop returning unexpected `403` statuses

### 15. Session creation/profile completeness regression

- Suggested owner: Convex/session flow owner
- Goal: reconcile the new rider-profile completeness gate with the expected session creation contract
- File groups:
  - `convex/sessions/mutations.ts`
  - `convex/sessions/__tests__/create.contract.test.ts`
  - `tests/e2e/convex-communication.e2e.test.ts`
- Done when:
  - session contract tests pass
  - convex communication e2e passes

### 16. Recommendation generation and internal mutation fixes

- Suggested owner: recommendation engine owner
- Goal: restore expected recommendation IDs and scheduled-work behavior
- File groups:
  - `convex/recommendations/__tests__/generate.contract.test.ts`
  - `convex/recommendations/__tests__/internalMutations.contract.test.ts`
  - `convex/recommendations/` implementation files touched by those tests
- Done when:
  - recommendation contract tests pass

### 17. Questionnaire contract test refresh

- Suggested owner: questionnaire/backend owner
- Goal: update stale mocks and expectations to match current profile-table access patterns
- File groups:
  - `convex/questionnaire/__tests__/completeQuestionnaire.contract.test.ts`
  - `convex/questionnaire/mutations.ts`
- Done when:
  - questionnaire contract tests pass

### 18. Dashboard shell/provider harness fixes

- Suggested owner: dashboard/layout owner
- Goal: align dashboard tests with current ThemeProvider and locale-query requirements
- File groups:
  - `src/app/(dashboard)/layout.test.tsx`
  - `src/app/(dashboard)/layout.tsx`
  - `src/components/providers/ThemeProvider.tsx`
  - `tests/integration/dashboard-message-locale.integration.test.tsx`
- Done when:
  - dashboard shell and locale integration tests pass

### 19. Small isolated contract/test fixes

- Suggested owner: repo-health cleanup owner or split by domain
- Goal: clear the remaining low-count failures after the major clusters are fixed
- File groups:
  - `convex/caseStudyLeads/mutations.test.ts`
  - `convex/caseStudyLeads/mutations.ts`
  - `convex/bikePhotos/__tests__/mutations.contract.test.ts`
  - `convex/lib/storageReferences.ts`
  - `src/lib/reports/pdfLayoutTemplate.test.ts`
- Done when:
  - isolated contract/test failures are cleared

### 20. Typecheck cleanup

- Suggested owner: repo-health owner
- Goal: remove the remaining `typecheck` blockers after functional regressions are fixed
- File groups:
  - stale `.next` type references or config causing them
  - `convex/authLocalDev.test.ts`
  - `src/lib/rateLimiter.test.ts`
  - `src/lib/reports/pdfLayoutTemplate.test.ts`
- Done when:
  - `npm run typecheck` passes cleanly

### 21. Lint error cleanup by rule family

- Suggested owner: repo-health owner, split by domain if needed
- Goal: clear blocking lint errors in the fastest grouping, by rule family instead of file-by-file cleanup
- File groups:
  - `src/app/app/page.tsx`
  - `src/components/bikes/BikeGeometryLibraryFields.tsx`
  - `src/components/branding/BrandLogo.tsx`
  - `src/components/dashboard-messages/use-dashboard-message-feed.ts`
  - `src/components/settings/IPhoneAppInstallCard.tsx`
  - `src/components/features/fitpass/FitPassPaywall.tsx`
  - `src/components/admin/feedback/feedback-ui.ts`
  - `src/components/admin/messages/message-ui.ts`
  - `src/components/ui/CheckboxGroup.tsx`
  - `src/components/ui/RadioGroup.tsx`
  - `src/lib/rateLimiter.ts`
  - `convex/sessions/mutations.ts`
- Recommended rule order:
  1. `react-hooks/set-state-in-effect`
  2. `react-hooks/rules-of-hooks`
  3. `react/no-children-prop`
  4. `@typescript-eslint/no-empty-object-type`
  5. `@typescript-eslint/no-explicit-any`
- Done when:
  - `npm run lint` passes cleanly

## Merge Gate

This queue is complete only when:

- the lane-specific acceptance-fix handoffs are closed
- validation scope is clean
- `npm run typecheck` passes
- `npm run lint` passes
- `npm test` passes
- Lead updates `merge-readiness-checklist.md` with a final repo-health decision
