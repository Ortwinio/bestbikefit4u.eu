# 24 — Handed-over bikes and editorial dark-mode pass

## Changes

- Editorial pages compose the shared marketing theme aliases introduced in 19.6. Page surfaces,
  cards, headings, supporting text, links, FAQ panels and focus colors adapt to light/dark mode.
  Lime badges and CTA panels keep their contrasting ink text.
- Stack/reach SVG strokes, guides and labels now use theme tokens rather than raw colors.
- Bike garage counts and comparison-step badges explicitly pair `bg-accent` with
  `text-accent-foreground`, fixing white-on-lime numbers in dark mode.
- Bike warnings use brand warning/ink tokens. Fit-preview frame strokes retain readable contrast.
- Gallery/lightbox colors use brand tokens; labels and arrow controls have opaque ink backgrounds
  for contrast over light photos. The selected-thumbnail ring uses the semantic primary token.
- Setup article status bullets use semantic text variants rather than pale status-fill colors.
- No engine, query, mutation, auth, billing, copy or schema behavior changed. No shared UI/global
  styles or frozen dictionaries changed. No commit.

Exact source/test/harness list: `files-dark-a2.txt` (13 paths).

## Coverage and screenshots

`plans/redesign-canvas/code-renders/24-dark-*.png`: **108 captures**, each tested at 1440 and 390 pixels,
in light and dark mode. `24-dark-results.json` records the complete matrix and fixture limitations.

Public routes use the actual local Next app:
- `/nl/why-bikefit-matters`
- `/en/bike-fitting` and `/nl/bikefitting` (their intended locale-specific routes)
- `/nl/fiets-afstellen`
- `/nl/science/bike-fit-methods`, `/nl/science/calculation-engine`, `/nl/science/stack-and-reach`
- Open FAQ states on the landing and setup pages.

Bike routes use actual current components and dashboard shell with explicit read-only Convex/auth
fixtures, current compiled Next CSS/fonts, and Next Link/Image adapters:
- `/bikes`: populated, empty and loading.
- `/bikes/new`, `/bikes/new/manual`, `/bikes/import/passport`, `/bikes/import/marktplaats`.
- `/bikes/compare-fit`.
- `/bikes/[bikeId]`: populated, missing, loading, gallery and open lightbox.
- `/bikes/[bikeId]/edit`: details, measurements, gearing and notes tabs.

No authenticated backend access or real writes are claimed. Fixtures reuse the QA sweep's bike entry
and baseline runtime plus batch-1 Link/Image adapters, without editing those owned files. The local
gallery fixture adds two illustration assets, not rider photos. Import submission is not exercised.
External HTTPS requests are blocked. Reduced motion gives stable post-transition color measurements.

Final matrix: all responses HTTP 200 (fixture responses for bikes), correct theme, zero browser runtime
errors, zero unexpected queries, zero broken visible images, zero document overflow and zero measured
text-contrast failures. Checks use alpha-composited solid backgrounds, 4.5:1 normal text / 3:1 large text;
disabled/hidden controls are excluded. This is a targeted visual/contrast check, not a complete WCAG audit.
Desktop/mobile page-family, diagram, edit-form, import and lightbox screenshots were inspected visually.

Reproduce from the repo with a running local Next app:
`node tests/visual/dark-a2/capture.mjs` (`RENDER_BASE_URL` optionally overrides localhost:3000).
The preview interruption during tool recovery required a rerun; the final complete matrix exits 0.

## Validation

- `npm run lint`: PASS.
- `npm run lint:contrast`: **254/254 PASS**.
- `npm run lint:css-modules`: **18 files, 0 raw-color lines**.
- `npm run typecheck`: PASS.
- Targeted bike/editorial unit tests: **12 files, 47 tests PASS**, including the new SVG-token regression.
- Owned diff whitespace check: PASS.

Logs: `/private/tmp/bbf24-{lint,contrast,css,types,tests,final-render}.log`.
