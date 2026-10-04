# RB2 contact target

## Scope and baseline

- Worktree: `/Users/ortwinverreck/Developer/bestbikefit4u-rebrand`.
- Branch `feature/rb2-followups`, starting HEAD `b16f970`; lead explicitly authorized implementation after PR14 merged.
- Read root AGENTS.md, context index, rebrand README, RB2 plan, B4 audit/inventory and local `plans/redesign-canvas/canvas/Contact.dc.html`. No nested AGENTS.md found in src/plans/tests. No open messages at start.
- Board preserves the contact hero, mail-only support, context cards and FAQ hierarchy. The later measurement guidance is existing approved application content; it is not present in the older board.
- Parent owns builds, servers, shared preview and final gates. Other workers' edits are untouched. No commit/push/deploy, production access, environment-file access/change, dependency install, mail send or scheduling performed.

## Before / after

Historical before evidence: `plans/rebrand/renders/sweep-final/report.json`, EN390 `/contact`, `checks.touchTargets.details`: actual `a`, label `Read the body measurement guide`, href `/en/measurement-guide`, width **282px**, height **22px**. B4 audit independently records the same finding.

Reviewed historical `contact-{nl,en}-{1440,390}.png` in that directory: hero, branding and mail card retain their desktop/mobile hierarchy. These are initial viewport captures; the measurement anchor is below the captured area, so these images alone do not prove its geometry.

Source before: measurement `Link` has no class and remains inline; line boxes do not provide a 44px target. Source after: the anchor itself receives scoped `.measurementLink` with `display: inline-flex`, centered vertical alignment, minimum width/height 44px and maximum width 100%. Wrapping remains permitted. No wrapper hit area, absolute overlay, pseudo-element, global rule, copy or metadata changes. Existing anchor focus rule remains 3px primary outline with 4px offset; localized href/name, native tab focus and both mailto links remain intact.

Browser verification is complete against the parent-owned previews. Baseline: `https://127.0.0.1:4372`, build `UVZIndeVjtShDM0girzs9` (parent executed the before checker). After: `https://127.0.0.1:4374`, isolated snapshot `/tmp/bbf-final-sweep-cf43609f07a9723e`, build `ZXPl6jjYh3t3YVMXnwu14` (contact worker executed after checker). External browser requests blocked; no production data used.

| Locale / viewport | Before actual anchor W × H | After actual anchor W × H |
| --- | --- | --- |
| NL1440 | 318.015625 × 22 | 318.015625 × 44 |
| NL390 | 192.484375 × 49.890625 | 292 × 55.78125 |
| EN1440 | 282.046875 × 22 | 282.046875 × 44 |
| EN390 | 282.046875 × 22 | 282.046875 × 44 |

All four after cases pass actual corner hit-testing, card containment, no horizontal overflow, localized href/name, native focus with visible 3px solid outline, and both original support mailto destinations. Minimum neighboring FAQ-target gap is 147.5625px desktop / 231.234375px mobile. NL390 previously had a fragmented inline hit region despite its combined bounding box exceeding 44px; after it has one fully clickable rectangle while retaining the same two-line text wrapping.

Evidence: `plans/rebrand/renders/RB2/contact/{before,after}-results.json`, per-case JSON, and `contact-{nl,en}-{1440,390}-{before,after}-{full,focus}.png`. Visually inspected all **16** current before/after images (8 full-page, 8 focused viewports), in addition to the four historical B4 viewport images. Page hierarchy/copy, line wrapping, header/footer, mail panel and spacing remain consistent; focus rectangles surround the actual enlarged anchors without clipping or overlap. The small FAQ-card/page-height increase is the natural flow consequence of the larger target. Existing floating feedback can overlap the email CTA at the initial mobile viewport in both baseline and after; this unrelated shared-widget behavior is unchanged and outside this task.

## Focused validation

- `npx vitest run 'src/app/(public)/contact/page.test.tsx'`: **12 tests passed**, 1 file. Includes two new locale-specific anchor/class-placement/native-focus checks and existing bilingual href, copy, mailto, CTA analytics and metadata checks. Existing Vite native-config warning only.
- `node --check plans/rebrand/audit/RB2-contact-check.mjs`: passed.
- `node plans/rebrand/audit/RB2-contact-check.mjs https://127.0.0.1:4374 after`: **4/4 cases passed**, exit 0, session 26709 completed. No product source edits followed the parent snapshot/build.
- `git diff --check`: passed at focused handoff check.
- Baseline capture attempt against approved `https://127.0.0.1:4372` initially hit sandbox `EPERM` creating the artifact directory. Retried with approved escalation; Playwright Chromium launch failed with `Timeout 180000ms exceeded` before any page capture. No browser capture remained running. Parent took over the same checker; do not duplicate its run.
- `RB2-contact-check.mjs` provides an importable `checkContact(page, options)` and standalone loopback-only CLI. It checks actual bounding box, four clickable inset corners, focus-visible outline, containment, neighbor separation, overflow, href/name and unchanged mailto destinations after fonts/layout settle. It does not activate mail links.
- Parent command: `node plans/rebrand/audit/RB2-contact-check.mjs <approved-loopback-origin> after`; optional `before` phase records baseline geometry without requiring 44px. Artifacts go to ignored `plans/rebrand/renders/RB2/contact/`, four locale/width cases with full-page and focused viewport PNGs plus JSON measurements. No server/build is started by the checker; non-preview network requests are blocked.

## Remaining issues / handoff

- No remaining contact measurement-target issues in the four requested locale/viewport cases. Initial worker baseline-launch failure is superseded by successful parent baseline capture and worker final capture.
- Parent owns full gates/build/crawl and integration acceptance. Parent reports the final 12-case sweep green; this note claims only the directly reviewed contact checks. No new build is needed for the subsequent audit-note updates.

Exact scoped files are listed in `files-RB2-contact.txt`; generated capture outputs are intentionally excluded.
