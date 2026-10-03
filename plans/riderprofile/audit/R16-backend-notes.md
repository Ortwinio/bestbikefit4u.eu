# R16 backend

## Persistence and lifecycle

Optional embedded `adviceProgress` and `adviceRevision` fields on recommendations,
saddleWidthSessions, gearingSessions, pressureCalculations and calculatorStates. No separate table:
existing outcome deletion automatically removes progress and notes; no new deletion traversal needed.

Progress is keyed by the exact emitted item key. It stores a UTC calendar performed date, optional
500-character note, and optional explicit better/same/worse feedback with its own note/date/link.
Query state is waiting_feedback until feedback exists, then performed. Stale remains the primary
status when used inputs changed, with progress retained separately. Input-only saved calculators
cannot be marked. Legacy records default to revision zero without a migration.

Every successful in-place recalculation increments a monotonically increasing integer revision and
clears progress, even if output and Date.now are unchanged. In-place outcome writers use the same reset.
The pressure autosave's existing unchanged-input no-op remains a no-op. New recommendation records
do not inherit progress; an old fit keeps its history while asynchronous replacement is pending.
Latest selection breaks equal result timestamps using Convex `_creationTime`, so a same-clock replacement wins.

## APIs

`advice.progress.markPerformed({source,recordId,key,expectedRevision,expectedUserId?,performedAt,note?})`
returns waiting_feedback, or performed for an identical retry after feedback already exists.
`advice.progress.submitFeedback({source,recordId,key,expectedRevision,expectedUserId?,result,note?,rideFeedbackId?})`
returns performed. Exact retry is idempotent; differing duplicate mark/feedback rejects rather than
silently deleting or overwriting another tab's progress.

The server checks authenticated owner, optional expected user, normalized source-specific record ID,
current bike ownership, recommendation session ownership/scope, dashboard session type, exact emitted
nonnull outcome key and expected revision atomically. UTC-midnight performed dates must be between the
outcome's UTC calendar day and today inclusive. Same-day outcomes are valid even when calculated later
than midnight. Notes are trimmed and bounded. Outcomes/metadata are never taken from client values.

Existing `rideFeedbackEntries` can be explicitly linked only for the same owned recommendation session
and bike, on/after the performed date and no later than now. The query offers up to five such entries.
There is no global-ride inference, comfort-score conversion or automatic note copying. Better/same/worse
remains an explicit required user answer even when a ride record is linked.

## Validation

98 focused tests pass across advice and four autosave suites; focused ESLint and TypeScript pass.
Coverage includes owner/account/bike/source guards, invalid keys and input-only outcomes, UTC dates,
note limits, idempotency, stale qualification, scoped eligible ride feedback and all four in-place
recalculators resetting progress twice at a fixed wall-clock timestamp. Root owns the additional
end-to-end query/mutation integration test and full repository gates.

## Backend file list

shared/advice/types.ts
convex/advice/progress.ts
convex/advice/progress.test.ts
convex/advice/revision.ts
convex/advice/groupAdvice.ts
convex/advice/queries.ts
convex/advice/queries.test.ts
convex/advice/mutations.ts
convex/advice/recalculation.test.ts
convex/advice/validators.ts
convex/schema.ts
convex/calculatorStates/mutations.ts
convex/gearing/mutations.ts
convex/saddleWidth/mutations.ts
convex/pressureCalculations/mutations.ts
plans/riderprofile/audit/R16-backend-notes.md
