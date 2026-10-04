# C2 secondary assets: kept

Audit date: 2026-10-04. Branch: `chore/repo-cleanup`.
Repository: `/Users/ortwinverreck/Developer/bestbikefit4u-migratie`.
Initial reference commit: `91a4e937e54eafffaaf4fab50bd43e9b43afca20`.

Kept: **7 files** (1 mascot, 5 measurement illustrations, 1 CSV template). Uncertain-only candidates: **0**; every file has a positive application reference.

## Exact inventory and decisions

Line numbers below refer to the initial commit and matched the working tree when inspected.

| Exact kept path | Positive reference and reason |
| --- | --- |
| `public/mascote/bestbikefit4u-mascote-on-bike-transparent.webp` | `src/app/not-found.tsx:125`: `src="/mascote/bestbikefit4u-mascote-on-bike-transparent.webp"`. Required by the not-found page. |
| `public/measure/height-bbf4u.webp` | `src/components/measurements/measurementIllustrations.ts:21`: `src: "/measure/height-bbf4u.webp"`, selected by the `height` measurement. |
| `public/measure/inseam-bbf4u.webp` | `src/components/measurements/measurementIllustrations.ts:28`: `src: "/measure/inseam-bbf4u.webp"`, selected by the `inseam` measurement. |
| `public/measure/torso-bbf4u.webp` | `src/components/measurements/measurementIllustrations.ts:35`: `src: "/measure/torso-bbf4u.webp"`, selected by `torsoLength`. |
| `public/measure/arm-length-bbf4u.webp` | `src/components/measurements/measurementIllustrations.ts:42`: `src: "/measure/arm-length-bbf4u.webp"`, selected by `armLength`. |
| `public/measure/shoulder-bbf4u.webp` | `src/components/measurements/measurementIllustrations.ts:49`: `src: "/measure/shoulder-bbf4u.webp"`, selected by `shoulderWidth`. |
| `public/templates/geometry-import-template.csv` | `src/app/(dashboard)/admin/geometry/page.tsx:21` and `src/app/(dashboard)/admin/geometry/import/page.tsx:21`: `const GEOMETRY_TEMPLATE_PATH = "/templates/geometry-import-template.csv";`. Download links consume that constant at lines 247 and 199 respectively. |

## Dynamic consumers

`MeasurementIllustrationCard.tsx:16` performs `measurementIllustrations[measurement]`; line 23 passes `illustration.src` to the image. `IllustratedMeasurementHelp.tsx:24` renders that card. `StepBodyMeasurements.tsx:113,155` supplies `height` and `inseam`; `StepAdvancedMeasurements.tsx:156,198,240` supplies `torsoLength`, `armLength`, and `shoulderWidth`. These are runtime-selected images, not merely unused dictionary entries. `ProfileLanguage.test.tsx:94` iterates all entries and renders the card.

The CSV path is indirect through `GEOMETRY_TEMPLATE_PATH` in two real download links. The import page also uses `geometry-import-template.csv` as its initial/reset filename at lines 122 and 256.

## Preserved initial and historical evidence

These references were observed before completion and independently searched at the fixed initial commit, so parallel plan/code deletion cannot erase this audit's evidence:

- `plans/migratie/inventory-code.md:217` records the exact mascot path and `src/app/not-found.tsx:125`; line 218 records all five `public/measure/*-bbf4u.webp` images and their shared mapping.
- `plans/redesign-canvas/audit/47-after.json:651,655,659,663,667,671,675` records respectively torso, shoulder, inseam, height, arm, mascot, and CSV paths from the table above.
- `plans/redesign-canvas/audit/47-replacements.json:6-11` maps arm, height, inseam, shoulder, torso, and transparent mascot PNG URLs to their current same-stem WebP URLs. `47-optimized.json:47-103` records those conversions. Historical PNG references do not make their WebP replacements unused.
- `plans/redesign-canvas/audit/files-47.txt:63-69` inventories the same seven paths.
- `plans/feature-profile-wizard-measurement-illustrations/README.md:30-34` lists the five original measurement PNGs. `output-01-asset-contract.md:5,9,18,22,26` preserves the original mapping and line 35 names the shared TypeScript contract.
- `scripts/images/optimize-public.mjs:10,13,26` mentions historical mascot PNGs and dynamically selects widths with `name.startsWith("mascote/")` and `name.startsWith("measure/")`. The old PNG variants are absent from the assigned current inventory; this audit did not delete them.

## Search coverage and reproducibility

Inventory included hidden/ignored files using `rg --files --hidden --no-ignore public/mascote public/measure public/templates`; exactly seven files were returned. Nested agent-instruction discovery found only the repository `AGENTS.md`.

Initial whole-working-tree search used `rg -n --hidden -i 'mascote|/measure/|public/measure|/templates/|public/templates'` with `.git`, `node_modules`, the lockfile, and the audit output directory excluded. This captures untracked working-tree material as well as tracked references.

To preserve references independently of concurrent deletions, the following whole-tracked-repository search ran against the fixed commit:

```sh
git -C /Users/ortwinverreck/Developer/bestbikefit4u-migratie grep -n -I -E 'mascote|measure/|geometry-import-template|GEOMETRY_TEMPLATE_PATH|measurementIllustrations|getMeasurementIllustration' 91a4e937e54eafffaaf4fab50bd43e9b43afca20 -- ':!package-lock.json'
```

This includes source, scripts, tests, hidden workflows, JSON/CMS import data, Convex/email templates, PDF renderer code, configuration, package scripts, and OG/manifest text. A focused repeat covered `.github`, `scripts`, `tests`, `convex`, `src/lib`, `src/app/api`, `next.config.ts`, `package.json`, and JSON/MDX/CSS files. Searches included directory fragments, extension-independent stems, constants, and the consumer chain above, rather than relying on complete URL matches alone.

No production CMS access or binary PDF content extraction was needed or performed: positive runtime consumers already mandate keeping every scoped asset. These text searches are not a claim that opaque binary content or external database references are absent. No absence claim is used to justify any deletion.

## Checks and boundaries

Image-weight check passed with zero failures. Image-weight and measurement-card language tests passed (31 tests across 2 files). All seven assets are retained; no build was required. Protected `brand/**`, `email/**`, `og/**`, favicons, manifest/OG assets, root assets, and logos remain outside this secondary agent's edits. The shared cleanup README was not edited.
