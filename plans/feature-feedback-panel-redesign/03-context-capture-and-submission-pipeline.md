# Step 03 — Context Capture And Submission Pipeline

## Goal

Upgrade feedback submission from “simple form post” to “diagnostic report with useful context.”

## Tasks

1. Redesign the submission form inside the panel for:
   - `bug`
   - `feature_request`
   - `support_case`
   - `review`
   - ensure `review` uses a lighter, more appreciative form than issue-reporting types
   - reduce required fields wherever a prompt can replace a field
2. Define field-level behavior per type.
   - `bug`: support diagnosis and reproduction
   - `feature_request`: capture problem and desired outcome
   - `support_case`: capture blocker/question and optional urgency
   - `review`: capture positive experience and optional improvement idea
3. Build a bounded activity-tracking mechanism that captures what the user just did:
   - recent page transitions
   - key UI actions where instrumentation is practical
   - fit-result/report actions when applicable
4. Add lightweight prompt guidance in the form:
   - `What were you trying to do?`
   - `What happened instead?`
   - `What would have made this better?`
   - adapt these prompts by type instead of showing the same wording to everyone
5. Extend the submission payload to store:
   - current full URL
   - pathname + query
   - route family
   - locale
   - user snapshot or anonymous state
   - linked session/bike context
   - activity trail
   - concise activity summary when derivable
   - browser/app metadata
6. Update backend mutations, validation, and tests.
7. Ensure sensitive data is bounded and sanitized:
   - no secrets
   - no raw token leakage
   - no excessive payload size
8. Define the post-submit confirmation state copy:
   - required success message:
     - `Thank you for your feedback.`
   - optional supporting text may explain next steps, but must not replace the required line
   - avoid support-ticket phrasing such as `case created` or `ticket submitted`
9. Define a short follow-up explanation shown after submit, such as:
   - the team reviews it
   - replies appear in the dashboard when relevant
   - released fixes can be linked back later

## Deliverable

- updated feedback submission contract
- client-side context collector
- backend mutation/query updates
- validation matrix by feedback type
- confirmation-state copy contract
- prompt and microcopy contract by feedback type
- route-family and activity-summary contract

## Done When

- Admin receives enough context to understand what happened without guessing.
- The submission pipeline works for both authenticated and anonymous users.
- Payload size and privacy boundaries are explicit.
- The prompts improve report quality without making the form feel heavier.
