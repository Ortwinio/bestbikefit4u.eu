# S1/S2 ready for crawl

Config and locale-map fixes are now in the SEO worktree. Focused 47 tests and
typecheck/lint pass. Production after-snapshot and requested worktree build running.
Central `localeRoutes.ts` covers bike-fitting pair, public calculator registry and
weighted pressure slug pairs; selective landing alternates and sitemap now reciprocal.
Two legacy landing URLs redirect 308 via proxy (query preserved). No visible changes.

The older isolated-production helper omits scripts needed by source test imports;
its first baseline build failed. My measurement runner explicitly copies scripts
and successfully rebuilt the untouched initial snapshot. C's runner should likewise
include scripts in copied build inputs if using that helper. No production credentials.
