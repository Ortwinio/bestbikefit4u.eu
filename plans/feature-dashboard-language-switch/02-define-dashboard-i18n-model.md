# Step 02 - Define Dashboard i18n Model

## Objective
Define and implement a single pattern for reading translated dashboard strings in client components.

## Tasks
1. Extend `src/i18n/messages/en.ts` and `src/i18n/messages/nl.ts` with a full `dashboard` tree covering:
   - shell nav labels
   - page-level labels by section (`dashboard`, `fit`, `questionnaire`, `results`, `profile`, `bikes`)
   - common actions (`save`, `cancel`, `delete`, `continue`, `back`)
   - state labels (`loading`, `empty`, `error`)
2. Add a client-safe accessor utility (for client components) that returns typed messages by locale.
3. Avoid ad-hoc `locale === "nl" ? ... : ...` in dashboard components after migration.
4. Keep compatibility with existing parity tests.

## Deliverable
- i18n keys available and typed for all dashboard copy.

## Done When
- Dashboard components can consume messages through one standardized accessor.
