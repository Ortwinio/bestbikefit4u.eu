# P1 transition — operator preparation only

No backend, deployment, migration or mail operation was performed for P1. Obtain lead authorization
for the exact environment, candidate and go-live UTC timestamp before any operation below. Keep both
paid-access flags OFF until release approval. Stripe remains a stub regardless of billing flags.

## Preflight

Deploy the compatible optional schema and functions before the UI, only after separate approval.
Confirm the intended Convex deployment privately and retain a restricted backup with a tested restore
procedure. Never attach exports, secrets, user IDs, observations or profile values to this audit.
The operator must act as an existing verified billing_admin or super_admin. The internal mutations
resolve auth server-side and recheck that role on every page; a supplied admin ID is not authorization.

## Dry run first

1. Invoke internal `pricing/internal:beginTransition` with `{goLiveAt: APPROVED_UTC_MILLISECONDS}`.
   Omitted dryRun defaults true. Save its run ID privately.
2. Repeatedly invoke internal `pricing/internal:continueTransition` with that run ID until its returned
   phase is complete. The run owns its cursor; callers cannot choose pages. Each page handles at most
   50 reports or 25 users. Dry run writes only audit-run progress, not grants, offers or report markers.
3. Review aggregate reportCount, offerCount and legacyProCount. A future go-live timestamp can be
   previewed, but execution cannot start before it. Counts may change between preview and execution;
   a run is not a database-wide snapshot. Re-preview unexpected changes rather than assuming equality.

## Separately approved execution

Begin with `{goLiveAt: SAME_APPROVED_TIMESTAMP, dryRun: false, dryRunId: COMPLETED_PREVIEW_RUN_ID}`.
The preview must be complete, belong to the same admin and have the exact cutoff. Continue its own
new run to completion. Do not automate a production loop or change the cutoff without approval.

- Reports and owner accounts must predate the cutoff by database creation time; report-created time
  is checked as well. Only those reports receive legacyFullAccess.
- Existing accounts with at least one qualifying report get one offer, redeemable before two calendar
  months after go-live. Redemption is explicit, owner-authenticated and binds to one owned bike for
  three calendar months. Repeating a run cannot issue another offer.
- Existing active/cancelled paid subscriptions with a real future period end receive annual access to
  that exact end. Unknown historical amounts/renewal counts are not invented. No appointment is added.
- No Stripe call, payment, email, automatic redemption or purchase action occurs.

Verify controlled test accounts: preserved old full report/PDF; one unredeemed offer; new reports
remain gated when enforcement is enabled; another bike does not inherit a single right; expiry is
effective at read time even before the daily 00:15 UTC job. Repeat dry-run verification and retain
aggregate-only evidence. Repeating completed operations is safe but does not undo prior writes.

## Stop and rollback

Stop on wrong environment, missing role, unexpected counts, ownership mismatch, duplicate grants or
unavailable backup. Disable BOTH PAID_ACCESS_ENFORCED (Convex/server) and
NEXT_PUBLIC_PAID_ACCESS_ENFORCED (frontend build) to reopen access, without deleting paid records.
Keep existing isStripeBillingEnabled semantics and the inert Stripe transport. A frontend rollback
does not undo grants, report markers or audit runs; retain compatible additive backend schema. Any
data cleanup/restore needs a separate reviewed plan and approval.
