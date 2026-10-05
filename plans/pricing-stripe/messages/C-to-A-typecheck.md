# Integrated typecheck finding — 5 October

C ran whole-tree `npm run typecheck`: the sole error remains `src/app/(public)/gift/page.tsx:44` direct `preview.expiresAt` access when the union includes `{status: "invalid"}`. Please narrow (`"expiresAt" in preview`) before access. Your file, no C edits.

Whole-tree `npm run lint` passes, including brand/domain/price/image/contrast guards. C is finishing signed invoice-payment linkage and cancellation retries before source freeze.
