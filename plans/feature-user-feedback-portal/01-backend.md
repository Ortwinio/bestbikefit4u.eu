# Step 01 — Backend Contract, Schema, Queries, and Mutations

## Goal

Establish a verified backend contract for the user feedback portal without guessing at existing schema or index details.

---

## Required first action

Audit the existing backend before editing anything:

- inspect `convex/schema.ts`
- inspect existing files under `convex/feedback/`
- inspect existing files under `convex/releases/`
- inspect existing files under `convex/messages/`
- verify available helpers such as `requireUserId`

Document any mismatches between this plan and the real backend in the step output before making changes.

---

## Deliverables

### 1. Schema and indexes

- Add `feedback_upvotes` only if it does not already exist
- Add any missing indexes required for:
  - feedback items by user
  - feedback comments by feedback item
  - releases by status or equivalent efficient access path
  - message receipts by user and message

### 2. Feedback queries

Implement:

- `getMyFeedback`
- `getFeatureBoard`
- `getPublicFeedbackDetail`

Contract requirements:

- all are authenticated-user queries
- no query should scan unrelated user vote data when a tighter index is available
- all returned fields must be limited to user-safe data
- non-internal comments only for public detail

### 3. Release query

Implement:

- `getPublicReleases`

Contract requirements:

- authenticated-user query
- returns only `rolling_out` and `live`
- excludes internal releases
- includes shipped linked feature requests only

### 4. Vote mutation

Implement:

- `upvoteFeedbackItem`

Contract requirements:

- only valid for `feature_request`
- toggles one vote per user
- uses `feedback_upvotes` as source of truth
- keeps `upvoteCount` synchronized
- returns enough state for optimistic UI reconciliation:
  - `hasUpvoted`
  - `upvoteCount`

### 5. Message receipt mutations

Implement or align with existing naming:

- `dismissMessage`
- `acknowledgeMessage`

Contract requirements:

- idempotent
- authenticated user only
- does not create duplicate receipts
- clearly distinguishes dismiss vs acknowledge semantics if both exist

---

## Implementation notes

- Do not assume fields like `linkedReleaseId` exist without verification
- If linked release info is instead derived through `release_items`, adapt the implementation and note the reason
- Prefer indexed queries over broad `.collect().filter(...)` where possible
- If denormalized counters are maintained, update them in the same mutation path that writes vote records

---

## Acceptance criteria

- [ ] Existing schema/index reality is audited and mismatches are documented
- [ ] `feedback_upvotes` and supporting indexes exist if required
- [ ] User-facing feedback queries are implemented and authorization-safe
- [ ] Release query exposes only user-safe public releases
- [ ] Vote mutation is toggle-based and idempotent
- [ ] Message receipt mutations are implemented or reconciled with existing behavior
- [ ] Generated Convex API/types are updated if required
- [ ] `npm run typecheck` passes

