# F3 PDF and email QA

Final-tree local rerun completed for F3. No application report/email code changed by this QA subtask.

## Final owner-decision rerun — 5 October 2026

- After the signed-in persistence decision and F2 freeze, reran all three PDF commands below and the email preview command on the integrated worktree; every command exited 0.
- PDF: 10 six-page fixture/locale layouts without overflow; four actual six-page A4 PDFs with correct page footers, embedded fonts and bilingual reliability assertions. Final log: `plans/reliability/audit/F3-pdf-final.log`.
- Email: 42 bilingual HTML/text previews and 84 screenshots, with zero overflow, image or unsupported-layout failures. Final log: `plans/reliability/audit/F3-email-final.log`.
- Re-inspected the newly rasterized full Dutch PDF summary and the English knee-angle email at 375 px. Artwork, accuracy figures, headings, CTA and footers are intact and readable; no clipping or overlap. The broader page-by-page inspection below was completed in the preceding candidate review.
- Preview runners used local assets only, with no real email sends or backend calls. Logs and rendered artifacts remain ignored; no build or application server was started by this QA subtask.

## PDF gates — PASS

- `node /Users/ortwinverreck/Developer/bikefitboost-reliability/tests/visual/pdf-report/render.mjs`: exit 0. Ten fixture/locale layouts (baseline, full, sparse, long-input, warning-budget), all six sheets, no horizontal/content-footer overflow.
- `PYTHONPATH=/private/tmp/f1-pdf-python python3 /Users/ortwinverreck/Developer/bikefitboost-reliability/tests/visual/pdf-report/verify.py`: exit 0. Four actual PDFs (baseline/full × NL/EN), six A4 pages each, correct N/6 footers, three named embedded font families, Dutch copy checks pass.
- `node /Users/ortwinverreck/Developer/bikefitboost-reliability/tests/visual/reliability/full-pdf-check.mjs`: exit 0. Reusable final assertion of the above artifacts plus bilingual accuracy block, 95% column/range markup and absence of safety/test-band artwork classes.
- Viewed all six rasterized full-report pages in both languages, plus baseline summary/fit-value pages in both languages. Clear headings, intact artwork, clean tables and footers; no clipping or overlapping text. Summary contains the accuracy block and declared-measurement fallback; fit-value bars show one uncertainty band, not a safety band. Existing safety guidance is appropriately retained as text.
- Artifacts: `plans/reliability/renders/pdf/26-browser.json`, `26-pdf.json`, four PDFs and page PNGs. The report fixtures use 754 mm (baseline) and 749 mm (full); this QA does not change engine outputs or substitute the separate 787 mm model example.

## Email gate — PASS

- `node /Users/ortwinverreck/Developer/bikefitboost-reliability/scripts/render-email-previews.mjs --output=/Users/ortwinverreck/Developer/bikefitboost-reliability/plans/reliability/renders/F3-email-previews`: exit 0.
- 42 bilingual HTML/text previews, 84 screenshots (21 templates × NL/EN × 600/375). All checks pass: no horizontal overflow, failed images or unsupported flex/grid email layout.
- Inspected the new knee-angle evaluation email in both languages at both widths. The 7-day reminder, 25–35° window, maximum 5 mm step, pain warning, CTA and preference links remain visible and legible.
- Runner fulfills approved image paths from local `public/` and aborts all other resource requests; imports template renderers only. No emails or backend calls were sent.
- `git check-ignore` confirms PDF and email preview artifacts remain ignored. No PNG, PDF, log or generated JSON is included in the source file list.

## Files owned by this QA subtask

- `tests/visual/reliability/full-pdf-check.mjs`
- `plans/reliability/audit/F3-pdf-notes.md`
