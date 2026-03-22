# Step 06 — Billing, Feedback, Messages, Settings, And Audit

## Goal

Remove the largest remaining inline fixture islands and finish the business-operations/admin-governance surfaces.

## Tasks

1. Replace inline arrays in `BillingViews.tsx` with live plans/subscriptions/billing-event data.
2. Replace inline arrays in `FeedbackViews.tsx` with live inbox/detail/comment/release-linking data.
3. Replace inline arrays in `MessageViews.tsx` with live dashboard message list/detail/compose/publish flows.
4. Replace inline arrays in `SettingsViews.tsx` with live admin-role, feature-flag, GDPR, and system data.
5. Replace inline arrays in `AuditLogPage.tsx` with live audit-log filters and CSV export flow.
6. Ensure each sensitive flow writes and exposes the correct audit metadata.

## Done When

- No major admin business surface is still reading from local inline records.
- Audit and settings are live enough to satisfy their acceptance criteria honestly.
