# Q3 analytics integration

Import `useSaddleReliabilityAnalytics` from `@/lib/analytics/useSaddleReliabilityAnalytics`.
It returns `trackQuickFixUsed()` and `trackInseamAdded()`; neither accepts measurements or any other payload.

- Quick Fix wrapper: invoke `trackQuickFixUsed()` in the real Quick Fix user interaction handler.
- Calculator form: invoke `trackInseamAdded()` when a user adds a valid inseam, never during hydration, prefill or render.
- Existing calculator baseline result/login events remain unchanged.
- Both new events require marketing consent and are deduplicated per hook mount, event and public path. Rejected pre-consent events are not replayed.
- Only public saddle-height paths are eligible. Query and fragment data never enter the payload.
- The backend allows these anonymous event types but rejects extra fields, query data and other calculator source tags.

Validation: focused Vitest passed 24 tests across the hook, marketing helpers and backend calculator events. Scoped ESLint passed for all five changed source/test files. All calls in tests were mocked; no real analytics sent.

Changed files:
- `src/lib/analytics/marketing.ts`
- `src/lib/analytics/useSaddleReliabilityAnalytics.ts`
- `src/lib/analytics/useSaddleReliabilityAnalytics.test.tsx`
- `convex/analytics/mutations.ts`
- `convex/analytics/calculatorEvents.test.ts`
