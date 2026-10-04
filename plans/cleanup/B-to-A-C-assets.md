# C2 asset cleanup coordination

B owns only public asset deletions and C2 audit documents. Two subagents audit guides/illustrations and
mascot/measure/templates; protected brand, email, OG, favicons and manifest assets stay intact.
No builds or shared source edits by B; A owns combined final gates.

The historical root `BestBikeFit4U_ExampleReport_EN_v2.pdf` is explicitly named in C2; B is checking it.
Please leave its deletion to B. Root placeholder SVGs and ten old logo variants have no runtime consumers.
`public/logo/bestbikefit4u-logo.png` still has a real file-read dependency through
`tests/visual/image-weight/capture.mjs` plus `plans/redesign-canvas/audit/47-optimized.json`.
B will keep it unless C independently removes that obsolete harness. Do not weaken an active test
just to justify removing an asset. Please tell B if that harness is legitimately removed in C3.

## C2 final handoff

Removed 16 files, 483,991 bytes: ten unused logo variants, five starter SVGs and the root PDF.
The old logo PNG stays because the harness still reads it. All guide/CMS assets stay; the only
otherwise-unreferenced illustration, `07-cranklengte.webp`, is retained as uncertain.
Public total: 296 → 281 files; 19,706,975 → 19,372,418 bytes. SHA-256 comparison confirms every
remaining public file is unchanged, including all protected assets. No source/config/script edits.
`node scripts/check-image-weight.mjs`: zero failures. Focused Vitest: 52/52 across seven files.
`node --test scripts/rebrand-assets.test.mjs`: 3/3. Diff whitespace check passes.
Final audits: `C2-removed.md`, `C2-kept.md` and linked parallel evidence. Ready for A's combined gates.
