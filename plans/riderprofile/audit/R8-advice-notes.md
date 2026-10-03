# R8 advice capture sidecar

Run `node plans/riderprofile/audit/R8-advice-capture.mjs` from the rider worktree. Loopback server/Chromium need standard sandbox escalation; no dependency installation. External HTTP/WebSocket requests blocked; service workers disabled. No production auth, Convex, mail or analytics calls.

Real AdvicePageClient, AdviceGroupsView, ProfileSectionTabs and DashboardLayout source are bundled with actual global/module CSS and local Figtree/Bricolage/DM Mono fonts. Synthetic examples exist only in the harness and inherited account visual fixture. Runtime AdviceItem/AdviceGroup fixtures reference the shared TypeScript types, exact seven keys and real field names; mutation uses the published RecalculationResult shape. This is a local component/layout fixture, not Next server metadata or real backend/OAuth execution.

32 captures: NL/EN × 1440/390 × stale, after-recalc, pending, mixedpending, error, empty, filter, stale-dark. All seven group sections persist in each state, including empty/filter. Eight populated advice rows include numeric ranges/current/difference, unknown provenance/confidence, saved-input-only FTP, separate front/rear tire values, and literal string frame size 56-57 cm.

Real recalculate button exercised with empty mutation args. In-flight pending, mixed pending/failed/skipped and thrown error retain identical prior rendered advice. After-recalc publishes fresh synthetic query results. Bike and rider filter assertions preserve seven sections while showing six/two scoped items. Error captures show the real client's caught recalculation failure, not the Next route error boundary. Fixture query parameters contain state/theme only.

Final run: 32/32 pass; seven groups each; zero document horizontal overflow, page/console errors or attempted external requests. Focused ESLint passes. Inspected full desktop NL, mobile EN, mobile mixed-result NL and dark desktop EN images; no additional app issue identified. Parent owns app tests/full typecheck/lint. No source or R11/R2 harness edits.

Review paths:
- renders/R8-advice-stale-nl-1440.png
- renders/R8-advice-stale-en-390.png
- renders/R8-advice-mixedpending-nl-390.png
- renders/R8-advice-after-recalc-en-1440.png
- renders/R8-advice-error-nl-390.png
- renders/R8-advice-empty-en-390.png
- renders/R8-advice-stale-dark-en-1440.png

Machine-readable gates: renders/R8-advice-results.json. Exact output list: files-R8-advice.txt.

Final refresh after Avicenna's R8-ui-completion.md confirmed explicit UTC display dates and ownLabel reliability fallback landed: reran all 32 captures against that source. All passed again with seven groups, preserved pending/failed data, zero overflow, runtime errors and external requests. Parent visually reviewed stale NL 1440/390 and EN 1440 dark. Manifest unchanged.

No commits, deployments, dependencies or production mutations. DONE R8 capture sidecar.
