# Follow-ups G1 + G2 (now Codex A; Gemini is no longer used)

**Branch / worktree:** `chore/seo-hardening-convex-tsconfig` in `/Users/ortwinverreck/Developer/bestbikefit4u-gemini`
(from `main`). Work ONLY in this folder. Never edit `~/Developer/bestbikefit4u` or the other worktrees
(`-rider`, `-baseline`, `-seo`, `-emails`) — other agents work there. No commits, pushes or deploys; the lead
commits and opens the PR. No visual, copy or style changes. Read `CLAUDE.md` and `AGENTS.md` first.

## G1 — Convex typecheck for `npx convex deploy`
`npx convex deploy` runs its own TypeScript check with `convex/tsconfig.json`; it currently fails with ~95 errors,
because Convex files (and their tests) import frontend modules that use the `@/` path alias, which
`convex/tsconfig.json` does not define (e.g. `src/components/guides/RewrittenGuide.tsx`,
`src/lib/calculators/accountState.ts`, `src/lib/guides/rewrites.ts`, `src/lib/guides/rewrite-types.ts`).
Production deploys have used `--typecheck disable` as a workaround.
- Reproduce: `node_modules/.bin/convex codegen --typecheck enable` or `npx tsc -p convex/tsconfig.json --noEmit`
  (no deployment needed; do NOT run `convex deploy` or `convex dev`).
- Fix so that check passes without weakening type safety: add the `@/*` path mapping (and anything else needed)
  to `convex/tsconfig.json`, or exclude test files the Convex bundle never ships, whichever is correct — explain why.
- The root `npm run typecheck` must stay green.

## G2 — SEO hardening (from the 2026-10-02 crawl review)
1. Private account pages (dashboard, profile, fit, bikes, settings, fit history, feedback, account tools) are
   excluded via `robots.txt` (`src/lib/seo/routePolicy.ts`) but most do not emit an explicit `noindex` themselves.
   Add `robots: { index: false, follow: false }` through shared server metadata for those route families
   (`src/app/(dashboard)/layout.tsx` is a client component — use a server layout/metadata file or the existing
   account metadata helper `src/i18n/account/metadata.ts`). Do not change public pages.
2. The PDF route `src/app/api/reports/[sessionId]/pdf/route.ts` should send `X-Robots-Tag: noindex, nofollow`
   on its responses (it is authenticated and `/api` is disallowed; this is defence in depth).
3. Add `/email-preferences` and `/tools` to the explicit route families in `src/lib/seo/routePolicy.ts` so the
   registry matches reality (both are noindex already).
- Tests for each change (metadata, header, route policy). `scripts/seo-crawl-check.mjs` exists on `main`;
  you may run it with `--local` to confirm public pages are unchanged.

## Gates and delivery
`npx vitest run <focused tests>`, `npm run typecheck`, `npm run lint`, `npm run build`.
Write `plans/followups-gemini/audit/G-notes.md` (what, why, evidence) and `audit/files-G.txt` (exact files).
When finished, print a line `DONE G1G2`.

## Completion — 3 October 2026
G1 and G2 implemented with disjoint subagents and root integration review. Convex standalone typecheck,
focused tests, root typecheck, full lint and production build pass. Client UI preserved unchanged.
Evidence: `audit/G-notes.md`; exact file manifest: `audit/files-G.txt`. No commit or deployment.
