# Step 04: Integrate Renderer Into Production Route

## Objective

Wire the improved PDF layout into the production API route with runtime-safe behavior and controlled fallback.

## Inputs

- `plans/feature-pdf-layout-upgrade/output-03-layout-implementation-notes.md`
- `src/app/api/reports/[sessionId]/pdf/route.ts`
- report rendering modules under `src/lib/`
- deployment/runtime documentation

## Tasks

1. Integrate new renderer in `/api/reports/[sessionId]/pdf` flow.
2. Preserve auth/ownership checks and existing API error semantics.
3. Implement fallback behavior if rich rendering fails:
   - fallback to simplified PDF path
   - log error context for diagnostics
4. Ensure output filename, content type, and cache headers remain correct.
5. Validate compatibility with build/deploy target (Vercel production path).
6. Save notes to `plans/feature-pdf-layout-upgrade/output-04-production-integration-notes.md`.
7. Update plan status in `plans/feature-pdf-layout-upgrade/README.md`.

## Deliverable

- Production API route serving the upgraded layout with resilience and fallback.

## Completion Checklist

- [ ] Route integration complete without auth regressions.
- [ ] Fallback path implemented and tested.
- [ ] Response headers/filename behavior verified.
- [ ] Output file created and linked in plan progress.
