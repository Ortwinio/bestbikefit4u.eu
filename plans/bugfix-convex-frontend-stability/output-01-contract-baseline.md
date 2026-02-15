# Step 01 Output: Contract Baseline

## Scope Reviewed

Contract audit performed across:

- Profile flow (`/profile` + `profiles.*`)
- Session creation flow (`/fit` + `sessions.*`)
- Questionnaire flow (`/fit/[sessionId]/questionnaire` + `questionnaire.*`)
- Recommendation/results flow (`/fit/[sessionId]/results` + `recommendations.*`)
- Email report flow (`emails.actions.sendFitReport`)
- Supporting auth and route protection (`src/app/(dashboard)/layout.tsx`, `src/proxy.ts`)

## Frontend-Convex Contract Matrix

| Flow | Frontend call site | Convex function | Args sent by frontend | Response expected by frontend | Current frontend state assumptions | Current server behavior |
|------|---------------------|-----------------|-----------------------|-------------------------------|-----------------------------------|-------------------------|
| Profile read | `src/app/(dashboard)/profile/page.tsx:166` | `api.profiles.queries.getMyProfile` | `{}` | `profile \| null` | `null` means no profile, show wizard | Returns `null` when unauth or missing profile (`convex/profiles/queries.ts:10`) |
| Profile write | `src/app/(dashboard)/profile/page.tsx:171` | `api.profiles.mutations.upsert` | height/inseam/flex/core + optional measurements | profile id | Save succeeds, otherwise console error only | Auth check + string-length checks, no numeric range checks (`convex/profiles/mutations.ts:52`) |
| Fit prerequisites | `src/app/(dashboard)/fit/page.tsx:45` + `:46` | `api.profiles.queries.getMyProfile`, `api.bikes.queries.listByUser` | `{}` | profile or bikes list | Profile `undefined` = loading; profile `null` = blocked start | `getMyProfile` returns `null` unauth/missing; `listByUser` throws on unauth (`convex/bikes/queries.ts:16`) |
| Session create | `src/app/(dashboard)/fit/page.tsx:80` | `api.sessions.mutations.create` | `{ bikeType, ridingStyle, primaryGoal, bikeId? }` | `sessionId` | On error logs to console, no user-facing failure | Validates auth/profile/bike ownership; does **not** persist `bikeType` (`convex/sessions/mutations.ts:51`) |
| Session read | `src/app/(dashboard)/fit/[sessionId]/questionnaire/page.tsx:22` and `.../results/page.tsx:39` | `api.sessions.queries.getById` | `{ sessionId }` | session object | Pages handle `session === null` as not found | Query throws on missing/unauthorized via `requireSessionOwner`; `null` branch is effectively unreachable (`convex/sessions/queries.ts:9`) |
| Questionnaire definitions | `src/app/(dashboard)/fit/[sessionId]/questionnaire/page.tsx:26` | `api.questionnaire.queries.getQuestions` | `{}` | question array | `undefined` loading | Throws if unauth (`convex/questionnaire/queries.ts:12`) |
| Questionnaire responses read | `src/app/(dashboard)/fit/[sessionId]/questionnaire/page.tsx:27` | `api.questionnaire.queries.getResponses` | `{ sessionId }` | responses array | `undefined` loading | Throws on missing/unauthorized session (`convex/questionnaire/queries.ts:23`) |
| Questionnaire response write | `src/app/(dashboard)/fit/[sessionId]/questionnaire/page.tsx:40` | `api.questionnaire.mutations.saveResponse` | `{ sessionId, questionId, response }` | response id | UI expects save success before continue | Validates response shape/content, throws on invalid (`convex/questionnaire/mutations.ts:35`) |
| Questionnaire complete | `src/app/(dashboard)/fit/[sessionId]/questionnaire/page.tsx:48` | `api.questionnaire.mutations.completeQuestionnaire` | `{ sessionId }` | void | On success navigate to results | Sets session status and derived fields; no required-answer completeness guard (`convex/questionnaire/mutations.ts:110`) |
| Recommendation read | `src/app/(dashboard)/fit/[sessionId]/results/page.tsx:43` | `api.recommendations.queries.getBySession` | `{ sessionId }` | recommendation or `null` | `null` treated as processing/no rec yet | Throws on unauthorized/missing session; returns `null` only when authorized + no recommendation (`convex/recommendations/queries.ts:12`) |
| Recommendation generate | `src/app/(dashboard)/fit/[sessionId]/results/page.tsx:63` | `api.recommendations.mutations.generate` | `{ sessionId }` | recommendation id | Auto-trigger in `useEffect` when `recommendation === null` | Idempotent on existing rec; bike type resolved from linked bike only, else riding style fallback (`convex/recommendations/mutations.ts:36`) |
| Email report send | `src/app/(dashboard)/fit/[sessionId]/results/page.tsx:81` | `api.emails.actions.sendFitReport` | `{ sessionId, recipientEmail, recommendation }` | `{ success, emailId? }` | Modal shows success/error text | Server re-queries recommendation and ignores client `recommendation` payload (`convex/emails/actions.ts:70`) |

## Mismatches and Stability Risks

### P0

1. `bikeType` contract break between frontend and server:
`src/app/(dashboard)/fit/page.tsx:80` sends `bikeType`, but `convex/sessions/mutations.ts:51` does not store it and `fitSessions` has no `bikeType` field (`convex/schema.ts:132`).
When `bikeId` is absent, recommendation category falls back to `ridingStyle` (`convex/recommendations/inputMapping.ts:65`), which can diverge from explicit bike selection.

2. Not-found handling contract mismatch for session reads:
Frontend checks `session === null` in questionnaire/results pages (`src/app/(dashboard)/fit/[sessionId]/questionnaire/page.tsx:64`, `src/app/(dashboard)/fit/[sessionId]/results/page.tsx:122`), but `sessions.getById` throws via `requireSessionOwner` (`convex/sessions/queries.ts:9`) instead of returning `null`.
This makes current local not-found UI path unreliable.

### P1

3. Redundant/ambiguous email action contract:
Frontend sends a large recommendation payload (`src/app/(dashboard)/fit/[sessionId]/results/page.tsx:84`), but server ignores it and re-queries recommendation (`convex/emails/actions.ts:70`).
This increases coupling and payload size without functional value.

4. Recommendation generation failure has no deterministic recovery:
`generateRecommendation` is fired in `useEffect` without error handling (`src/app/(dashboard)/fit/[sessionId]/results/page.tsx:56`).
If generation fails, UI can remain on perpetual “Calculating” state without actionable retry feedback.

5. Questionnaire mutation failures are not surfaced to users:
`QuestionnaireContainer` wraps save in `try/finally` only (`src/components/questionnaire/QuestionnaireContainer.tsx:66`), so server errors are not shown with recovery guidance.

6. Completeness enforcement gap in questionnaire complete:
Server marks session complete directly (`convex/questionnaire/mutations.ts:110`) without validating required questions.
Frontend flow enforces this in UI, but backend contract is bypassable.

7. Profile numeric constraints rely on frontend only:
Frontend has zod bounds (`src/components/measurements/MeasurementWizard.tsx:17`), while backend upsert only enforces types and string lengths (`convex/profiles/mutations.ts:7`, `convex/lib/validation.ts:7`).

### P2

8. Inconsistent auth semantics across queries:
Some queries return neutral values unauthenticated (`getMyProfile`, `listByUser`), others throw via `requireUserId/requireSessionOwner`.
This inconsistency complicates predictable UI state handling.

9. Partial route protection split between middleware and client layout:
Proxy protects `/dashboard(.*)` only (`src/proxy.ts:7`), while `/fit`, `/profile`, `/bikes` rely on client-side redirect in dashboard layout (`src/app/(dashboard)/layout.tsx:16`).

10. Error contract is untyped and string-based:
Client handling depends on raw `Error.message`; no stable error code mapping for deterministic UX.

## Target Contracts (Per Core Flow)

| Flow | Target request contract | Target response contract | Target error contract |
|------|-------------------------|--------------------------|-----------------------|
| Profile upsert | Keep current args, add backend numeric/range guards matching wizard schema | Return `{ profileId }` | Throw typed app error codes for auth/validation failures |
| Session create | Persist explicit bike intent (`bikeType` and optional `bikeId`) in session write model | Return `{ sessionId }` | Validation/auth errors with stable codes; no silent console-only handling |
| Session/read queries | Keep `sessionId` arg | Return `session \| null` for not-found/unauthorized resource-level lookups | Throw only for authentication/session format issues |
| Questionnaire save/complete | Keep current args; enforce required-question completeness on `completeQuestionnaire` | `saveResponse -> { responseId }`, `completeQuestionnaire -> { status: "questionnaire_complete" }` | Validation and ownership failures with stable codes consumed by UI |
| Recommendation generate/read | Keep current args; ensure category derives from explicit selected bike type when provided | `generate -> { recommendationId }`, `getBySession -> recommendation \| null` | Distinguish “not ready/not found” vs hard errors with stable codes |
| Email report action | Simplify to `{ sessionId, recipientEmail }` and remove client-provided recommendation payload | `{ success: true, emailId?: string }` | Typed codes for invalid email, not owner email, recommendation missing, auth |

## Priority Backlog for Step 02+

1. `P0` Persist explicit session bike type and align recommendation mapping precedence.
2. `P0` Align `sessions.getById` not-found behavior with frontend expectations.
3. `P1` Remove redundant email action payload and update frontend call site.
4. `P1` Add deterministic failure UI and retry path for recommendation generation.
5. `P1` Surface questionnaire save/complete failures in UI.
6. `P1` Add backend range validation for profile measurement writes.
7. `P2` Normalize query auth semantics and standardize typed error contract.

## Notes for Step 02

- Resolve data-model decision first: whether `fitSessions` stores `bikeType` directly or derives from linked bike snapshots.
- After contract changes, regenerate Convex types and fix all call sites before adding tests.
