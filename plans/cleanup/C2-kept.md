# C2 retained assets

Date: 2026-10-04. Baseline `91a4e937e54eafffaaf4fab50bd43e9b43afca20`, `chore/repo-cleanup`.
All **281 remaining public files** are byte-identical to the initial inventory (SHA-256 comparison).
No public image was recompressed, renamed, replaced or regenerated.

## Protected groups

| Kept path/group | Files | Reason and evidence |
| --- | ---: | --- |
| `public/brand/**` | 76 | Explicit owner protection, including source artwork and alias variants. `src/config/brand.ts` selects current SVGs; `src/lib/reports/pdfAssets.ts` embeds PNG/report/font assets; `scripts/email-assets/generate.mjs` uses the brand logo. |
| `public/email/**` | 10 | Explicit protection and mail-template assets. The generator and templates retain these URLs; no mail rendering or sending changes. |
| `public/og/**` | 80 | Explicit protection; guide images have production DB references. Social-image mapping and `scripts/domain-migration-check.mjs` require these files. No database access was used to infer non-use. |
| `public/android-chrome-192.png`, `public/android-chrome-512.png`, `public/maskable-512.png` | 3 | Root PWA aliases in `public/site.webmanifest` and brand config. |
| `public/apple-touch-icon.png`, `public/favicon.ico`, `public/favicon.svg`, `public/favicon-16.png`, `public/favicon-32.png` | 5 | Protected favicon/installable aliases; dimensions and icon contents covered by `scripts/rebrand-assets.test.mjs`. Keep even where a particular alias lacks a direct component reference. |
| `public/site.webmanifest` | 1 | Explicitly protected PWA manifest and asset URL contract. |
| `public/og-image-1200x630.png`, `public/og-image.svg` | 2 | Protected root OG aliases. Raster selected by brand config; SVG preserved under owner rule, not assumed unused from a missing direct reference. |

## Referenced root assets

| Exact kept path | Runtime consumer |
| --- | --- |
| `public/bestbikefit4u-home.mp4` | `src/components/home/HeroBackground.tsx:77`; real hero video source, not a redundant archive. |
| `public/bestbikefit4u-home.webm` | `src/components/home/HeroBackground.tsx:78`; alternate source remains in markup. No format-support assumptions used to delete it. |
| `public/bestbikefit4u-home-poster.jpg` | `src/components/home/HeroBlock.tsx:50`; retained loading/reduced-motion poster. |
| `public/bestbikefit4u-beginner-intermediate-advanced.webp` | `src/components/questionnaire/questions/ExperienceLevelSelector.tsx:34`. |
| `public/clock.webp` | `src/components/questionnaire/questions/WeeklyHoursSelector.tsx:34`. |
| `public/comfort-discomfort.webp` | `src/components/questionnaire/questions/PainDiscomfortSelector.tsx:30`. |
| `public/riding-position.webp` | `src/components/questionnaire/QuestionRenderer.tsx:123`. |
| `public/default-bike.svg` | `src/components/bikes/BikeGarageOverview.tsx:79` and `src/app/(dashboard)/fit/page.tsx:57`; live bike-image fallback. |
| `public/default-profile.svg` | `src/components/profile/ProfilePhotoUpload.tsx:80`; live profile fallback. Not the deleted starter `file.svg`. |

## Legacy logo deliberately kept

`public/logo/bestbikefit4u-logo.png` (59,982 bytes) has no current product rendering dependency, but
`tests/visual/image-weight/capture.mjs:16` explicitly selects its row from
`plans/redesign-canvas/audit/47-optimized.json`, then reads `public/${row.output}` at line 19.
This is an actual indirect file-read dependency, unlike mere before/after inventory listings.
Keep until that harness is independently retired by C3; B does not remove a test to justify a deletion.
Initial references are preserved here even if the C1/C3 owners later remove their historical artifacts.

## Parallel per-path audits

- **87 guide/illustration assets:** `C2-guides-kept.md` records every path and initial references,
  including CMS import JSON, extensionless content identifiers, dynamic hero/social rendering,
  email generation and PDF embedding. Includes 31 guide PNGs and 56 WebP illustrations.
- **Seven secondary assets:** `C2-secondary-kept.md` records the mascot used by not-found, five
  measurement images selected by the wizard map, and the geometry CSV used by two admin downloads.

## Uncertain candidate

`public/illustrations/07-cranklengte.webp` has only historical inventory matches in the repository.
Keep: guide/blog CMS fields accept arbitrary image paths, and production references cannot be ruled
out under the no-production-access constraint. This is not interchangeable with the separate guide
illustration `36-cranklengte.webp`. No database scan or speculative replacement was performed.

The historical root example PDF was removed, not retained; it was never a public URL. See
`C2-removed.md` for each deletion, initial references, byte totals and passing image checks.
