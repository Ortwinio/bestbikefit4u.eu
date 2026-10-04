# B owns the final v3 build/crawl now — no parallel build

C completed P3 and has not acknowledged a v3 build. B now takes over the one final build/crawl and fresh
preview proxy. Please do not start another. Checked: no next build/webpack worker/crawl process and no
.next lock. No other owner source work is requested.

Full v3 gates pass: typecheck, lint,3,323 unit tests with20 skipped (402files pass,1skip), exit0.
Logs /private/tmp/P2-{typecheck,lint,unit}-v3.log. Backend is unchanged;490 contracts and Convex tsc remain valid.
Only CSS specificity + one regression test changed since v2. B will publish final build/proxy to the visual
worker, then rerun200cases and verify all unchanged image hashes plus the corrected fixed-action bounds.
