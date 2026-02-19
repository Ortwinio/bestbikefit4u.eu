# Output 04: End-to-End Flow And Output Audit

Date: 2026-02-19  
Scope: login -> profile -> fit session -> questionnaire -> results -> PDF/email, including auth/ownership safeguards and failure handling.

## Execution Evidence

Tests run for this step:

```bash
npm run test -- convex/sessions/__tests__/create.contract.test.ts convex/sessions/__tests__/queries.contract.test.ts convex/recommendations/__tests__/generate.contract.test.ts convex/recommendations/__tests__/queries.contract.test.ts convex/emails/__tests__/sendFitReport.contract.test.ts src/app/api/reports/[sessionId]/pdf/route.test.ts convex/questionnaire/__tests__/responseValidation.test.ts
```

Observed:
- 7 test files passed
- 23 tests passed
- 0 failed

## Flow Segment Audit (Pass/Fail)

| Segment | Status | Evidence | Notes |
|---|---|---|---|
| Login (magic code UX and flow wiring) | `partial` | `src/app/(auth)/login/page.tsx:132`, `src/app/(auth)/login/page.tsx:148` | UI flow is complete (send, verify, resend, errors), but backend auth has critical security defects (see risk list). |
| Profile capture/update | `pass` | `src/app/(dashboard)/profile/page.tsx:171`, `convex/profiles/mutations.ts:7` | Upsert path, error handling, and edit flow are coherent. |
| Session creation | `pass` | `src/app/(dashboard)/fit/page.tsx:76`, `convex/sessions/mutations.ts:35`, `convex/sessions/__tests__/create.contract.test.ts:47` | Requires profile, validates bike ownership/type consistency, stores bikeType snapshot. |
| Questionnaire answering + completion | `partial` | `src/components/questionnaire/QuestionnaireContainer.tsx:148`, `convex/questionnaire/mutations.ts:103` | Client enforces required questions per visible flow, but server completion mutation does not re-validate required answers before setting `questionnaire_complete`. |
| Recommendation generation + results render | `partial` | `src/app/(dashboard)/fit/[sessionId]/results/page.tsx:83`, `convex/recommendations/mutations.ts:14`, `convex/recommendations/__tests__/generate.contract.test.ts:103` | Works on happy path; ownership checks and idempotent-return behavior exist, but race and input-usage gaps remain (see risks). |
| PDF export | `pass` | `src/app/api/reports/[sessionId]/pdf/route.ts:27`, `src/lib/reports/recommendationPdf.ts:85`, `src/app/api/reports/[sessionId]/pdf/route.test.ts:41` | Auth required, owner-scoped queries, 401/404/409/500 handling, and PDF payload checks are present. |
| Email report send | `partial` | `src/app/(dashboard)/fit/[sessionId]/results/page.tsx:104`, `convex/emails/actions.ts:23`, `convex/emails/__tests__/sendFitReport.contract.test.ts:69` | Owner-email restriction is enforced, but delivery observability/rate limiting are weak and env fallback can report false-success if misconfigured. |

## Output Consistency Audit (Screen vs PDF vs Email)

### Consistent

1. All channels derive from the same stored recommendation object:
   - Screen: `src/app/(dashboard)/fit/[sessionId]/results/page.tsx:371`
   - PDF: `src/app/api/reports/[sessionId]/pdf/route.ts:49`, `src/lib/reports/recommendationPdf.ts:63`
   - Email: `convex/emails/actions.ts:44`, `convex/emails/actions.ts:109`
2. Core numeric fields (saddle height, setback, drop, stem, crank, bar width, stack/reach/ETT) map consistently in all output builders.

### Consistency Defects

1. Channel coverage mismatch: on-screen includes pain solutions, email and PDF do not.
   - Screen includes pain solutions: `src/app/(dashboard)/fit/[sessionId]/results/page.tsx:380`
   - PDF builder has no pain section: `src/lib/reports/recommendationPdf.ts:85`
   - Email HTML has no pain section: `convex/emails/actions.ts:112`

2. Channel coverage mismatch: email omits some fields shown on screen/PDF (for example saddle-height range and explicit handlebar reach row).
   - Screen/PDF include range/reach: `src/components/results/FitSummaryCard.tsx:31`, `src/lib/reports/recommendationPdf.ts:100`
   - Email key table omits these rows: `convex/emails/actions.ts:141`

3. Pain-area taxonomy mismatch causes fallback/generic messaging.
   - Questionnaire pain values: `convex/questionnaire/questions.ts:117`
   - Stored pain area is copied as-is: `convex/questionnaire/mutations.ts:137`
   - Recommendation mapping expects different keys (`knee*s` vs `knee_front/knee_back`): `convex/recommendations/mutations.ts:204`
   - UI label map also uses different keys: `src/components/results/PainSolutions.tsx:16`

## Failure Mode Audit

### Implemented and Working

1. Missing/unauthorized session handling:
   - Session query returns null for unauthorized: `convex/sessions/queries.ts:8`
   - Questionnaire/results show not-found UX: `src/app/(dashboard)/fit/[sessionId]/questionnaire/page.tsx:64`, `src/app/(dashboard)/fit/[sessionId]/results/page.tsx:185`

2. Missing recommendation handling:
   - Results page shows generation/progress state: `src/app/(dashboard)/fit/[sessionId]/results/page.tsx:202`
   - PDF route returns 409 if recommendation missing: `src/app/api/reports/[sessionId]/pdf/route.ts:56`

3. Email validation and ownership checks:
   - Email format check and same-user-email restriction: `convex/emails/actions.ts:35`, `convex/emails/actions.ts:40`

### Missing or Weak

1. Server-side required-question enforcement before completion is missing.
   - `completeQuestionnaire` marks complete without required-answer validation: `convex/questionnaire/mutations.ts:110`

2. Recommendation generation race protection is application-level only.
   - Check-then-insert pattern: `convex/recommendations/mutations.ts:21`, `convex/recommendations/mutations.ts:118`
   - No unique constraint by `sessionId`: `convex/schema.ts:294`

3. Email send observability path exists but is not wired.
   - Report tracking mutations exist: `convex/emails/mutations.ts:13`
   - Results path calls action directly (no create/update report records): `src/app/(dashboard)/fit/[sessionId]/results/page.tsx:59`

## Operational Risk List (Ranked)

### P0

1. Magic-code backdoor is hard-enabled in auth flow.
   - `ENABLE_TEST_BACKDOOR = true`: `convex/auth.ts:11`
   - Fixed token returned when enabled: `convex/auth.ts:57`
   - Backdoor cleanup mutation deletes resend verification codes broadly: `convex/auth.ts:98`, `convex/authBackdoor.ts:28`

### P1

2. Questionnaire completion can be forged/incomplete at API level.
   - No server re-check of required/visible required answers: `convex/questionnaire/mutations.ts:103`

3. Required questionnaire input `experience_level` is collected but not used in fit input mapping.
   - Question required: `convex/questionnaire/questions.ts:44`
   - Fit input builder has no experience-level mapping: `convex/recommendations/inputMapping.ts:79`

4. Recommendation duplication risk under concurrent generation attempts.
   - Check-then-insert without DB uniqueness: `convex/recommendations/mutations.ts:21`, `convex/schema.ts:294`

5. Email action can return success without actual delivery when `AUTH_RESEND_KEY` is absent.
   - Dev fallback returns `{ success: true }`: `convex/emails/actions.ts:55`

### P2

6. Email-report tracking table is not part of active send flow.
   - Tracking mutations defined but not invoked by send action/results flow: `convex/emails/mutations.ts:13`, `src/app/(dashboard)/fit/[sessionId]/results/page.tsx:59`

7. No explicit send-rate limiting for email reports.
   - `sendFitReport` has no throttling per user/session: `convex/emails/actions.ts:23`

8. Auth request rate limit is process-memory only (not durable/distributed).
   - In-memory map limiter: `convex/auth.ts:15`

### P3

9. Email modal tooltip text is copied from login flow and is misleading.
   - Tooltip references login-code behavior in report email modal: `src/app/(dashboard)/fit/[sessionId]/results/page.tsx:298`

## Step 04 Completion Checklist

- [x] Full journey was tested
- [x] Results/PDF/email consistency was checked
- [x] Failure handling was evaluated
- [x] Security and auth controls were reviewed
