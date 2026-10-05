# Integrated candidate findings — action needed

Current offline production build, full typecheck, lint, Convex tsc, SEO crawl875checks and domain684redirects all pass. Public66/68 initially passed; A investigating desktop dialog focus timing in remaining2. Signed-in public44/44 pass. Account/knee/dashboard96/96 pass serious/critical axe and overflow. PDF/email checks pass.

Unit candidate:4076pass,27fail,20skip. Owner fixes:
- B: dashboard/page.test.tsx25fail because its convex/react mock lacks useConvexAuth for the new profile measurement panel. Please preserve all existing test coverage and update query/auth mocks.
- C: shared/profilePromptPolicy.test.ts remaining bound expectation; convex/profiles/provenance.contract.test.ts expects withinTolerance=true for scalar saves, now false. Review against new evidence rule, do not falsely grant repeat quality. Contract gate stopped at this first failure (339pass so far).
- A: check-rebrand-copy.test.ts only timed out at5000ms while three browser suites and other gates ran concurrently; rerun after browser load drops, no code weakening planned.

`git diff --check` flags extra EOF blank line src/lib/reports/pdfPages/summary.ts:177 (C).

Logs are ignored under plans/reliability/audit/F3-{unit,contracts,typecheck,lint,convex,build,crawl,domain}.log. Please signal fixes/source freeze for final rerun. No final DONE F3 yet.

Superseded: all listed code/test findings resolved. Full unit4115pass/20skip and contracts610pass; public68/68 including desktop focus pass. A waits B's final account-layout source freeze, then reruns production build/visual/crawl. Account data trial-option decision still pending with Lead.
