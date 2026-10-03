# R7 dashboard prompt UI — DONE (owned scope)

## Implementation
- DashboardProfilePrompts mounts below the dashboard header. Existing calculator links, rider indicators, bike reports and report confidence scores remain unchanged. A's R6 hero/sidebar remain A-owned; parent can mount the hero above this card.
- Typed final API references: nextPrompts query does not write; openPromptCard reserves idempotently once after query loads, with explicit retry on failure. Server owns the two-slot/session, daily-card and skip/dismiss policy.
- Actual selected fields, bike name, localized calculator effects and server potential gain. Reliability says “up to”; zero completeness gain omitted; answered/skipped cards hide potential badges. Saved state only promises future calculator use, never a fabricated confidence/outcome recalculation.
- No default numbers or enums are stored. Missing inputs start empty. Existing stale values require explicit method and confirmation. Shared Input/Select controls use localized tooltips, server-provided ranges/options, and explicit saves.
- Saddle height requires visible measurement instructions plus explicit bb_center_to_saddle_top selection.
- FTP offers training app, direct measurement, derived twenty-minute result, estimate, or unknown. Test entry is resulting FTP, never raw-power conversion. Unknown displays the localized account /tools/ftp-wkg link, no save action or write, and skip remains available.
- Conflict choices preserve current data: keep/remeasure discard the draft without writes; use-my-entry resubmits with server-returned expected current value. Errors preserve draft and permit retry.
- Skip/dismiss return null; dismissed date comes exclusively from refreshed server hiddenUntil. No local invented seven-day date. Server suppression of newly ineligible questions is respected without replacement slots.

## Final checks
- Focused UI + dashboard route: **2 files / 47 tests pass**.
- Scoped ESLint: component, dictionary, dashboard page/tests and capture harness pass.
- Full npm run typecheck: **passes**, exit 0; /tmp/R7-ui-types-final.log.
- Tooltip guard: **passes**, 54 files. Parent/C registration is now resolved, no aliases or guard bypass.
- CSS Module token guard: **passes**, 23 files, zero raw-color lines.
- Parent owns broader backend/policy/full repository validation; no backend files changed by this UI sidecar.

## Actual renders
- Harness: node plans/riderprofile/audit/R7-dashboard-capture.mjs.
- Real dashboard route, existing real shell, real CSS Modules/globals/fonts; offline fake authenticated Convex. External requests blocked, synthetic fixture only. No production data, deploy or database calls.
- **20 PNGs**, NL/EN × 1440/390 × open / answered / hidden / unknown-ftp / answered-dark.
- Answered/hidden/unknown states exercised through actual controls, not a product review strip. FTP answer fixture uses derived kind for ftp_test.
- All 20: no page errors, no document overflow; exactly two server-selected question cards except hidden state (zero).
- Visually reviewed NL desktop open and EN mobile unknown-FTP; layout readable and responsive, blank initial inputs and explicit controls visible. Existing report/dashboard scores still render. A hero not yet mounted in this capture.
- Results: plans/riderprofile/renders/R7-dashboard-results.json. Exact artifact/source list: files-R7-ui.txt.

## Handoff
Final parent review fixes: answered light-lime cards explicitly use ink heading and ink-muted status text, also in dark mode. Arm instruction matches the existing StepAdvancedMeasurements wizard: relaxed arm at side, bony shoulder tip to middle fingertip (not the board's conflicting clenched-fist endpoint). All captures regenerated, including four dark answered captures. Focused tests remain 47/47, scoped ESLint and token guard pass (24 CSS files). Parent reports broader 80 files / 688 tests green and full typecheck clean.

R7 UI owned scope DONE. A R6 hero integration and parent combined suite remain separately owned. No commits, new dependencies or deployment.
