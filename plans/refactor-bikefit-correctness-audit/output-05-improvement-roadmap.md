# Output 05: Improvement Roadmap

Date: 2026-02-19  
Scope: prioritized implementation plan from audit outputs 01-04 with rollout, rollback, and success metrics.

## 1) Prioritized Backlog

Legend:
- Effort: `S` (<=1 day), `M` (2-4 days), `L` (>=1 week)
- Horizons: `Now` (immediate), `Next` (short term), `Later` (medium term)

| ID | Item | Severity | Impact | Effort | Horizon | Dependencies | Primary Files |
|---|---|---|---|---|---|---|---|
| B01 | Remove auth backdoor and hard-disable in production | P0 | Closes critical auth bypass risk | S | Now | none | `convex/auth.ts`, `convex/authBackdoor.ts` |
| B02 | Add durable auth/email rate limiting (Convex-backed) | P1 | Prevents abuse and uneven behavior across instances | M | Now | B01 | `convex/auth.ts`, new throttle table/module |
| B03 | Enforce required questionnaire answers server-side before completion | P1 | Prevents incomplete/invalid sessions from reaching recommendation stage | M | Now | none | `convex/questionnaire/mutations.ts`, `convex/questionnaire/questions.ts` |
| B04 | Add uniqueness guard for one recommendation per session | P1 | Removes duplicate recommendation race condition | M | Now | none | `convex/schema.ts`, `convex/recommendations/mutations.ts` |
| B05 | Align saddle-height clamp with canonical docx | P1 | Restores formula/spec correctness | S | Now | none | `convex/lib/fitAlgorithm/calculations.ts` |
| B06 | Implement setback refinement terms and clamp bands | P1 | Improves biomechanical personalization | M | Now | none | `convex/lib/fitAlgorithm/calculations.ts`, `constants.ts` |
| B07 | Wire `experience_level` to `experienceLevel` algorithm input | P1 | Activates intended drop personalization | M | Next | B03 | `convex/recommendations/inputMapping.ts`, questionnaire mapping layer |
| B08 | Wire frame geometry (`stack/reach`) into fit solver | P1 | Enables geometry-aware stem/spacer recommendations | M | Next | B04 | `convex/recommendations/mutations.ts`, `inputMapping.ts` |
| B09 | Define torso/arm fallback policy (docx fallback vs explicit estimation) and implement consistently | P1 | Eliminates hidden reach drift | M | Next | B06 | `convex/profiles/mutations.ts`, `inputMapping.ts`, docs |
| B10 | Normalize pain taxonomy end-to-end (`pain_areas` -> cause/solution labels) | P2 | Removes generic pain guidance and mismatch | M | Next | B03 | `convex/questionnaire/mutations.ts`, `convex/recommendations/mutations.ts`, `src/components/results/PainSolutions.tsx` |
| B11 | Align output channels (screen/PDF/email fields and sections) | P2 | Avoids user confusion between channels | M | Next | B10 | `src/lib/reports/recommendationPdf.ts`, `convex/emails/actions.ts`, results UI |
| B12 | Activate email report tracking lifecycle (`pending/sent/failed`) in send flow | P2 | Improves support diagnostics and operational monitoring | M | Next | B02 | `convex/emails/actions.ts`, `convex/emails/mutations.ts` |
| B13 | Expand formula oracle tests from canonical docx cases | P2 | Prevents future spec drift | M | Next | B05,B06,B09 | `convex/lib/fitAlgorithm/__tests__/*` |
| B14 | Add migration clean-up for unused or dormant inputs/questions | P3 | Reduces model complexity and maintenance burden | L | Later | B07,B08,B09 | schema + UI + docs |
| B15 | Build calibration loop with rider outcome feedback (comfort/pain follow-up) | P3 | Long-term model quality improvement | L | Later | B10,B13 | new session follow-up model and analytics |

## 2) Recommended Implementation Phases

## Phase 0: Safety/Integrity Hotfix (Immediate)

Goals:
- eliminate P0 auth risk
- block invalid completion and duplicate recommendation races

Scope:
1. B01 auth backdoor removal
2. B03 server completion validation
3. B04 recommendation uniqueness protection

Exit criteria:
- No hardcoded verification backdoor path remains.
- `completeQuestionnaire` rejects missing required answers with deterministic error.
- Concurrent generation yields exactly one recommendation per `sessionId`.

## Phase 1: Spec Correctness Cutover (Short Term)

Goals:
- align engine with canonical docx formulas
- activate currently ignored high-impact inputs

Scope:
1. B05 saddle-height clamp alignment
2. B06 setback refinement implementation
3. B07 experience-level mapping
4. B09 torso/arm fallback policy finalization + implementation
5. B13 expanded deterministic oracle tests

Exit criteria:
- Formula deltas vs docx are closed for clamp and setback terms.
- `experience_level` affects drop output as intended.
- Reach fallback behavior is explicit, tested, and documented.

## Phase 2: Output Consistency + Operations (Short Term)

Goals:
- make all user-visible channels consistent
- improve supportability and reliability of email/report paths

Scope:
1. B10 pain taxonomy normalization
2. B11 screen/PDF/email parity
3. B12 email report lifecycle tracking
4. B02 durable rate-limiting hardening (if not fully done in Phase 0)

Exit criteria:
- Pain labels/causes/solutions resolve correctly for all questionnaire pain values.
- PDF/email include the agreed minimum field set matching results screen.
- Email send attempts are traceable with status and error metadata.

## Phase 3: Model/Product Quality (Medium Term)

Goals:
- improve fitting quality beyond baseline correctness
- reduce unused-data burden

Scope:
1. B08 geometry-fed solver (if deferred)
2. B14 schema/input cleanup
3. B15 calibration loop with rider outcomes

Exit criteria:
- Geometry-aware recommendations improve stem/spacer fit error on test cohort.
- Unused fields/questions are either removed or intentionally documented.
- Outcome feedback data feeds a repeatable recalibration cycle.

## 3) Bikefit-Domain Improvement Program

1. Default/fallback policy hardening
- Decide one canonical fallback strategy for torso/arm and expose provenance in UI.
- Add `estimated` flags so users know measured vs derived anthropometrics.

2. Frame sizing methodology upgrade
- Move from static stack/reach threshold bands to category-specific fit envelopes.
- Incorporate frame geometry inputs when available; keep deterministic default path when absent.

3. Calibration with real rider outcomes
- Capture post-fit outcomes (pain reduced, comfort, handling confidence) after 2-4 weeks.
- Build periodic calibration reports for formula constants and warning thresholds.

## 4) Rollout, Gates, Observability, Rollback

## Test Requirements By Change Class

1. Security/auth changes (B01-B03)
- Required: contract tests + negative auth tests + abuse/rate-limit tests.
- Must pass: `npm run test:contracts`, `npm run test:e2e:communication`.

2. Formula engine changes (B05-B07,B09,B13)
- Required: component tests + invariants + regression snapshots for canonical scenarios.
- Must pass: `npm run test:unit`, targeted algorithm suites.

3. Data model/mutation changes (B04,B12,B14)
- Required: migration safety checks + backward-compatibility test coverage.
- Must pass: `npm run typecheck`, `npm run test:contracts`.

4. Output/UX parity changes (B10-B11)
- Required: screen/PDF/email snapshot parity checks and smoke path walkthrough.
- Must pass: relevant route tests and manual smoke list in release checklist.

## Release Gates (No-Ship Conditions)

Use `docs/RELEASE_READINESS_CHECKLIST.md` as hard gate.  
Additional no-ship rules:
1. Any open P0/P1 security issue.
2. Formula mismatch against canonical docx in audited components.
3. Output mismatch across screen/PDF/email for required core fields.

## Observability Controls

1. Add structured logging for:
- questionnaire completion rejection reasons
- recommendation generation attempts and dedup outcomes
- email send attempts with lifecycle status (`pending/sent/failed`)

2. Dashboards/queries:
- auth send failures by reason
- recommendation generation error rate
- report email failure rate and mean retry time

## Rollback Strategy

1. Keep formula changes behind a version switch (`algorithmVersion` rollout tag).
2. Ship schema/mutation changes with backward-compatible reads first, writes second.
3. If regression detected:
- revert to prior algorithm version outputs
- disable new mapping paths via feature flag
- retain data, do not delete new fields during emergency rollback

## 5) Execution Order And Dependencies

1. B01 -> B03 -> B04  
2. B05 -> B06 -> B09 -> B07 -> B13  
3. B10 -> B11 -> B12  
4. B02 (if partially deferred) -> B08 -> B14 -> B15

Rationale:
- Security and integrity first.
- Formula correctness before UX parity to avoid polishing incorrect outputs.
- Observability before broader model evolution.

## 6) Measurable Success Criteria

1. Security
- `0` known auth bypass paths in production review.
- Auth/report endpoints pass ownership and negative-case tests at `100%` for defined contract cases.

2. Correctness
- `0` unresolved P1 formula mismatches from Step 02 in implemented scope.
- Deterministic algorithm regression suite: `100%` pass.

3. Journey reliability
- End-to-end smoke path (login -> profile -> fit -> questionnaire -> results -> PDF/email): `100%` pass in pre-release checklist.
- Recommendation duplicate rate by session: `<0.1%`.

4. Output consistency
- Core field parity set (height/setback/drop/reach/stem/crank/bar width/stack/reach/ETT/confidence): exact match across screen/PDF/email in parity tests.

5. Operational quality
- Report email failure rate `<1%` (excluding invalid recipient/user mismatch cases).
- Mean time to diagnose report-send issue `<15 minutes` using logs + tracking records.

## Step 05 Completion Checklist

- [x] Backlog is prioritized by impact and risk
- [x] Each recommendation is technically actionable
- [x] Rollout and rollback strategy is defined
- [x] Success metrics are explicit
