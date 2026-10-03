# R16 actual-component interaction renders

Harness: `R16_RENDER=1 node plans/riderprofile/audit/R8-advice-capture.mjs` from the rider worktree. The existing R8 mode remains available without the environment variable and retains its original 32 scenarios.

The R16 mode renders the actual AdvicePageClient, AdviceGroupsView, AdviceProgressActions and client account shell with project CSS/fonts. Only navigation/auth/Convex boundaries are fixtures. Query rows carry the real source/revision/progress contract. Successful mock mutations publish replacement query rows; rejected or pending mutations leave the query data unchanged. This is UI interaction evidence, **not proof of real database persistence, authorization, deletion or revision concurrency**; backend contract tests provide those guarantees separately.

## Scenarios

Twelve states × Dutch/English × 1440/390 = 48 cases, each with a full-page image and a focused advice-item detail image:

- Performed form with explicit UTC calendar date and optional note.
- Pending performed save without an optimistic progress state.
- Saved adjustment waiting for ride feedback.
- Feedback form with no result selected by default.
- Explicit better, same and worse results.
- Explicit existing ride-feedback link; the previous note does not choose the new result automatically.
- Failed performed save preserving the prior new state.
- Failed feedback save preserving the saved adjustment/waiting state.
- Successful recalculation clearing progress and incrementing the fixture outcome revision.
- Stale advice retaining stale as its primary status while showing the adjustment history.

Assertions check seven stable groups, exact submitted UTC date, saved optional note, untouched query state during pending/failed saves, explicit result, linked record ID, reset revision/new status, no page/console errors, no horizontal overflow and no external requests. Date/note entry uses accessible label selectors, not DOM-only input shortcuts.

## Accessibility issue found during validation

The shared textarea wrapper initially rendered a label targeting a different generated ID than its textarea. The real `getByLabel` interaction failed. The UI owner corrected the advice note call site with a stable unique ID and accessible name, and made the date field ID unique too. The harness did not bypass the failed accessibility check or change production source.

Visual review also caught pale coral error copy on the white feedback form. The UI owner changed the conditional alert to `text-destructive-text` and added a class regression test. The R16-only 48-case capture suite was rerun after that correction; other board states do not render this conditional alert and their final captures remain applicable.

An additional unfiltered axe pass found a missing title in the fixture document (48 cases), a low-contrast disabled note label during pending saves (4 cases), and mobile shell content outside landmarks (24 cases). Added the fixture document title; the UI owner changed the pending note to read-only and the mobile shell wrapper to a semantic header. These are real fixes, not disabled rules or selector exemptions. The final rerun includes all boards after the shell change. Axe runs against the full visible page before any supplementary crop-only shell hiding. All violations and incomplete findings are retained in the JSON manifest; automated checks do not establish full accessibility conformance.

The intermediate axe rerun reported zero violations in all 48 cases. Its manual-review findings included generic group-count spans with `aria-label`, subsequently fixed by the UI owner using an aria-hidden visual number and localized screen-reader text. Ring-number contrast is also marked incomplete by axe because the text overlays SVG. Manual token evidence: `ProfileStrengthRings.module.css` uses `--bbf-wit` (#ffffff) over `--bbf-inkt` (#0f2420), **16.23:1**; its percent uses `--bbf-op-donker` (#b9ccc6), **9.68:1** against the same background. Both SVG circles use `fill="none"`, so the center retains the card background. These exceed 4.5:1; the incomplete finding remains in the evidence rather than being suppressed.

## Output and scope

Final unfiltered axe result after all corrections: **48 cases, zero violations**. The remaining incomplete rule is `color-contrast`: it includes both ring numbers over SVG (`imgNode`) and desktop sidebar link spans outside the internal scroll viewport (`elmPartiallyObscured`, related sticky aside). The group-count ARIA finding is resolved. No exemptions or ignored nodes were applied. The ring contrast calculations above address only the ring nodes, not the sidebar nodes.

Additional browser verification addresses the sidebar findings: on Dutch and English desktop performed-form fixtures, focused and scrolled every `aside a` into view, then checked that the element at its center belongs to that link. All **31 links per locale** remained keyboard-focusable and reachable after scrolling. The `sidebarAccess` entries in the final JSON retain per-link text, href, computed colors and both assertions. Offscreen tool links use computed #e1f2ee on the transparent link over the #0f2420 aside; active links use #0f2420 on #cff26a. The sidebar checks run after the unchanged screenshots and axe analysis, so they neither conceal findings nor change the captured initial scroll state. Final rerun still reports zero violations; incomplete nodes remain recorded in full.

Computed-color contrast is **14.02:1** for those inactive tool links and **12.80:1** for active links, both exceeding 4.5:1. This verifies the colors when scrolled into view; it does not claim that initially clipped links were fully visible before scrolling.

Final run: **48/48 passed**, zero page/console errors, zero horizontal overflow and zero external requests. The default R8 run also passed all 32 cases. Focused ESLint passed. The complete R14 board suite was refreshed after the UI changes; all eleven harnesses exited zero.

Inspected mobile Dutch adjustment/date/note and feedback-error forms, desktop English performed/linked and stale-history states, and the English mobile recalculation reset. Optional notes remain readable, result selection remains explicit, saved history is retained on failure, and the reset restores the new-state action. Full-page screenshots show the unchanged account shell. Supplementary article detail screenshots hide fixed/sticky shell overlays during the crop only, avoiding overlay obstruction on tall mobile cards; no interactive layout or production styles are changed.

Images: `renders/R16-advice-<state>-<locale>-<width>.png` and matching `-detail.png`. Results: `renders/R16-advice-results.json`. Images and render manifests are local review artifacts; no PNGs belong in source file lists. The final R14 all-board refresh is reported in `R14-board-coverage.md`.
