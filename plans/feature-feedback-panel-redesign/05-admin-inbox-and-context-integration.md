# Step 05 — Admin Inbox And Context Integration

## Goal

Make the new captured feedback context operationally useful inside the admin panel.

## Tasks

1. Extend admin inbox list/detail queries to expose the new context fields.
2. Redesign admin feedback detail sections to show:
   - reported page and route
   - reporter identity or anonymous contact details
   - linked bike / fit session
   - recent user activity trail
   - browser/environment metadata
   - derived activity summary when available
   - route family classification
3. Keep the existing triage workflow:
   - status
   - priority
   - assignment
   - release linking
   - internal note vs user-visible reply
4. Confirm reply behavior remains:
   - comment thread is source of truth
   - non-internal replies create rider-visible notification surfaces
5. Add quick-triage cues to the inbox and detail surface:
   - anonymous vs authenticated
   - low / medium / high context completeness
   - route family
   - review vs issue/report
6. Add clear formatting rules so long context payloads remain readable.

## Deliverable

- enriched admin feedback loaders
- updated detail UI contract
- explicit formatting rules for captured context
- quick-triage summary contract

## Done When

- Admin can understand what happened from the feedback detail view alone.
- The richer context improves triage rather than creating noisy raw dumps.
- The admin inbox can sort high-signal items from low-context noise faster than today.
