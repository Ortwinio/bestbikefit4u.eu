# C2 removed assets

Date: 2026-10-04. Worktree: `/Users/ortwinverreck/Developer/bestbikefit4u-migratie`.
Baseline: `91a4e937e54eafffaaf4fab50bd43e9b43afca20`, branch `chore/repo-cleanup`.

Removed **16 files, 483,991 bytes**: ten obsolete logo variants, five Next.js starter SVGs and
one root-level historical example PDF explicitly named in C2. Public assets save 334,557 bytes;
the root PDF saves 149,434 bytes. Nothing currently rendered was replaced or renamed.

## Proof method

Before deleting, searched every basename throughout repository text using
`rg -n -F --hidden --no-ignore`, excluding only Git internals, node_modules, .next and the new cleanup
audit itself. This included ignored and hidden text, scripts, tests, workflows, JSON/CMS imports,
MDX/CSS, Convex, plans and documentation. Then searched shorter logo/starter-name fragments and
public-path construction in source, scripts and consumers. Matching historical inventory entries
are recorded below, not misrepresented as zero references. They describe former assets, not live reads.

Inspected `src/config/brand.ts`, `public/site.webmanifest`, `src/lib/reports/pdfAssets.ts`,
`next.config.ts`, email templates/generator, package scripts/workflows and dynamic public scans.
Current logos use `/brand/svg/**`; PDF embedding uses `brand/png/logo-horizontaal-960.png` plus
protected report assets and retained illustration paths. Icons/OG use protected root/brand files.
The social generator enumerates guides/illustrations, not these deleted assets. Generic image-weight
and optimization scans do not require files merely because they enumerate existing directory entries.
CMS import JSON contains no deleted asset paths or extensionless old-logo identifiers.
No production CMS or external URL access was performed; this is repository/dependency proof, not a
claim that historical external bookmarks or arbitrary remote text cannot contain an old URL.

The old example PDF is in the repository root, not public. The current example generator renders
production report code and fixtures into `plans/rebrand/renders/bikefitboost-report-example-{nl,en}.pdf`;
it neither reads nor generates the old filename. Its old plan references are historical specifications.

The one legacy PNG with a real visual-harness dependency is deliberately **kept**; see C2-kept.md.
No source, test or import record was changed to manufacture non-use.

## Per-path decisions and initial reference evidence

### `public/logo/bestbikefit4u_icon_app.png`

DELETE — Unused former branding variant; current brand assets are separate and retained. 93,635 bytes.

Initial whole-repo matches (historical references remain valid as history):

```text
./plans/feature-logo-branding-refresh/output-01-brand-contract.md:16:- `public/logo/bestbikefit4u_icon_app.png`
./plans/redesign-canvas/audit/47-after.json:495:    "path": "public/logo/bestbikefit4u_icon_app.png",
./plans/redesign-canvas/audit/47-before.json:715:    "path": "public/logo/bestbikefit4u_icon_app.png",
```

### `public/logo/bestbikefit4u_icon_app.svg`

DELETE — Unused former branding variant; current brand assets are separate and retained. 3,873 bytes.

Initial whole-repo matches (historical references remain valid as history):

```text
./plans/feature-logo-branding-refresh/README.md:31:- `public/logo/bestbikefit4u_icon_app.svg`
./plans/feature-logo-branding-refresh/output-01-brand-contract.md:9:- `public/logo/bestbikefit4u_icon_app.svg`
./plans/redesign-canvas/audit/47-after.json:491:    "path": "public/logo/bestbikefit4u_icon_app.svg",
./plans/redesign-canvas/audit/47-before.json:707:    "path": "public/logo/bestbikefit4u_icon_app.svg",
```

### `public/logo/bestbikefit4u_logo_dark.png`

DELETE — Unused former branding variant; current brand assets are separate and retained. 54,131 bytes.

Initial whole-repo matches (historical references remain valid as history):

```text
./plans/redesign-canvas/audit/47-after.json:515:    "path": "public/logo/bestbikefit4u_logo_dark.png",
./plans/redesign-canvas/audit/47-before.json:735:    "path": "public/logo/bestbikefit4u_logo_dark.png",
```

### `public/logo/bestbikefit4u_logo_dark.svg`

DELETE — Unused former branding variant; current brand assets are separate and retained. 3,537 bytes.

Initial whole-repo matches (historical references remain valid as history):

```text
./plans/feature-logo-branding-refresh/README.md:29:- `public/logo/bestbikefit4u_logo_dark.svg`
./plans/redesign-canvas/audit/47-after.json:519:    "path": "public/logo/bestbikefit4u_logo_dark.svg",
./plans/redesign-canvas/audit/47-before.json:739:    "path": "public/logo/bestbikefit4u_logo_dark.svg",
```

### `public/logo/bestbikefit4u_logo_primary.png`

DELETE — Unused former branding variant; current brand assets are separate and retained. 55,253 bytes.

Initial whole-repo matches (historical references remain valid as history):

```text
./plans/redesign-canvas/audit/47-after.json:499:    "path": "public/logo/bestbikefit4u_logo_primary.png",
./plans/redesign-canvas/audit/47-before.json:719:    "path": "public/logo/bestbikefit4u_logo_primary.png",
```

### `public/logo/bestbikefit4u_logo_primary.svg`

DELETE — Unused former branding variant; current brand assets are separate and retained. 3,727 bytes.

Initial whole-repo matches (historical references remain valid as history):

```text
./plans/feature-logo-branding-refresh/README.md:28:- `public/logo/bestbikefit4u_logo_primary.svg`
./plans/feature-logo-branding-refresh/output-01-brand-contract.md:5:- `public/logo/bestbikefit4u_logo_primary.svg`
./plans/redesign-canvas/audit/47-after.json:487:    "path": "public/logo/bestbikefit4u_logo_primary.svg",
./plans/redesign-canvas/audit/47-before.json:703:    "path": "public/logo/bestbikefit4u_logo_primary.svg",
```

### `public/logo/bestbikefit4u_mark.png`

DELETE — Unused former branding variant; current brand assets are separate and retained. 21,769 bytes.

Initial whole-repo matches (historical references remain valid as history):

```text
./plans/feature-logo-branding-refresh/output-01-brand-contract.md:14:- `public/logo/bestbikefit4u_mark.png`
./plans/redesign-canvas/audit/47-after.json:511:    "path": "public/logo/bestbikefit4u_mark.png",
./plans/redesign-canvas/audit/47-before.json:731:    "path": "public/logo/bestbikefit4u_mark.png",
./plans/redesign-canvas/audit/15-notes.md:37:- `src/lib/reports/pdfLayoutTemplate.ts:272`: print header uses self-contained inline SVG/data URI, with Arial text and old blue mark. Report cover also references legacy `/logo/bestbikefit4u_mark.png` (~505). `src/lib/pdf/simplePdf.ts:71` embeds standard Helvetica in a separate minimal PDF fallback. All kept intact because PDF embedding/font/header rendering is a separate pipeline; needs a dedicated render-and-verify pass.
```

### `public/logo/bestbikefit4u_mark.svg`

DELETE — Unused former branding variant; current brand assets are separate and retained. 3,581 bytes.

Initial whole-repo matches (historical references remain valid as history):

```text
./plans/feature-logo-branding-refresh/README.md:30:- `public/logo/bestbikefit4u_mark.svg`
./plans/feature-logo-branding-refresh/output-01-brand-contract.md:11:- `public/logo/bestbikefit4u_mark.svg`
./plans/redesign-canvas/audit/47-after.json:523:    "path": "public/logo/bestbikefit4u_mark.svg",
./plans/redesign-canvas/audit/47-before.json:743:    "path": "public/logo/bestbikefit4u_mark.svg",
```

### `public/logo/logo-bestbikefit4u-v2.png`

DELETE — Unused former branding variant; current brand assets are separate and retained. 67,078 bytes.

Initial whole-repo matches (historical references remain valid as history):

```text
./plans/redesign-canvas/audit/47-after.json:483:    "path": "public/logo/logo-bestbikefit4u-v2.png",
./plans/redesign-canvas/audit/47-before.json:699:    "path": "public/logo/logo-bestbikefit4u-v2.png",
```

### `public/logo/logo-bestbikefit4u-v2.svg`

DELETE — Unused former branding variant; current brand assets are separate and retained. 24,659 bytes.

Initial whole-repo matches (historical references remain valid as history):

```text
./plans/redesign-canvas/audit/47-after.json:507:    "path": "public/logo/logo-bestbikefit4u-v2.svg",
./plans/redesign-canvas/audit/47-before.json:727:    "path": "public/logo/logo-bestbikefit4u-v2.svg",
```

### `public/file.svg`

DELETE — Unreferenced Next.js starter icon, not an app/manifest/OG asset. 391 bytes.

The broad basename match also finds `default-profile.svg`; those are substring false positives.
The required default-profile asset remains. A boundary/full-path repeat found no live `file.svg` consumer.

Initial whole-repo matches (historical references remain valid as history):

```text
./docs/GOOGLE_SIGNIN_ROLLOUT.md:81:4. `/default-profile.svg`
./plans/feature-google-sign-in/04-profile-fallbacks-and-login-ui.md:46:4. `/default-profile.svg`
./plans/redesign-canvas/audit/47-after.json:19:    "path": "public/default-profile.svg",
./plans/redesign-canvas/audit/47-after.json:23:    "path": "public/file.svg",
./plans/redesign-canvas/audit/47-before.json:15:    "path": "public/default-profile.svg",
./plans/redesign-canvas/audit/47-before.json:23:    "path": "public/file.svg",
./src/components/profile/ProfilePhotoUpload.test.tsx:20:    expect(renderToStaticMarkup(<ProfilePhotoUpload />)).toContain('src="/default-profile.svg"');
./src/components/profile/ProfilePhotoUpload.tsx:80:            src="/default-profile.svg"
```

### `public/globe.svg`

DELETE — Unreferenced Next.js starter icon, not an app/manifest/OG asset. 1,035 bytes.

Initial whole-repo matches (historical references remain valid as history):

```text
./plans/redesign-canvas/audit/47-after.json:51:    "path": "public/globe.svg",
./plans/redesign-canvas/audit/47-before.json:75:    "path": "public/globe.svg",
```

### `public/next.svg`

DELETE — Unreferenced Next.js starter icon, not an app/manifest/OG asset. 1,375 bytes.

Initial whole-repo matches (historical references remain valid as history):

```text
./plans/redesign-canvas/audit/47-after.json:47:    "path": "public/next.svg",
./plans/redesign-canvas/audit/47-before.json:67:    "path": "public/next.svg",
```

### `public/vercel.svg`

DELETE — Unreferenced Next.js starter icon, not an app/manifest/OG asset. 128 bytes.

Initial whole-repo matches (historical references remain valid as history):

```text
./plans/redesign-canvas/audit/47-after.json:43:    "path": "public/vercel.svg",
./plans/redesign-canvas/audit/47-before.json:63:    "path": "public/vercel.svg",
```

### `public/window.svg`

DELETE — Unreferenced Next.js starter icon, not an app/manifest/OG asset. 385 bytes.

Initial whole-repo matches (historical references remain valid as history):

```text
./plans/redesign-canvas/audit/47-after.json:55:    "path": "public/window.svg",
./plans/redesign-canvas/audit/47-before.json:79:    "path": "public/window.svg",
```

### `BestBikeFit4U_ExampleReport_EN_v2.pdf`

DELETE — Historical root PDF, not served and not read by the current generator. 149,434 bytes.

Initial whole-repo matches (historical references remain valid as history):

```text
./plans/migratie/inventory-code.md:221:| `BestBikeFit4U_ExampleReport_EN_v2.pdf` (repo root) | not referenced | old example report; remove or replace |
./plans/rebrand/audit/B2-notes.md:5:PDF reports embed the new horizontal PNG at 172×30px. Footers and measurement-guide links use the shared BRAND origin; client downloads use bikefitboost-report. The formerly obsolete example-report generator now renders the current six-page production template with fixture data, bundled fonts, decoded images and no network requests. NL/EN examples and twelve page screenshots are in plans/rebrand/renders/. The old root BestBikeFit4U_ExampleReport_EN_v2.pdf is an unreferenced historical artifact, intentionally retained; there are no public PDF files or live links to it.
./plans/feature-pdf-layout-upgrade/03-build-layout-template-and-sections.md:11:- `BestBikeFit4U_ExampleReport_EN_v2.pdf`
./plans/feature-pdf-layout-upgrade/01-audit-current-pdf-and-example-gap.md:14:- `BestBikeFit4U_ExampleReport_EN_v2.pdf`
./plans/feature-pdf-layout-upgrade/README.md:5:Upgrade the production PDF report in BestBikeFit4U to a polished, multi-section layout based on `scripts/generate-example-report.mjs` and `BestBikeFit4U_ExampleReport_EN_v2.pdf`, while guaranteeing measurement output values are rendered correctly.
./plans/feature-pdf-layout-upgrade/README.md:39:- Example output: `BestBikeFit4U_ExampleReport_EN_v2.pdf`
./plans/feature-pdf-layout-upgrade/output-01-gap-analysis.md:10:The current production PDF pipeline is reliable but intentionally minimal, and it cannot reproduce the layout quality shown in `BestBikeFit4U_ExampleReport_EN_v2.pdf`. A richer renderer is required for parity with the example, with strict value mapping to canonical recommendation fields.
./plans/feature-pdf-layout-upgrade/output-05-validation-and-release-checklist.md:52:   - `BestBikeFit4U_ExampleReport_EN_v2.pdf`
./plans/redesign-canvas/audit/13-notes.md:82:- Source `BestBikeFit4U_ExampleReport_EN_v2.pdf`, visually inspected all three source pages; report structure also `plans/report-v2/README.md` and `plans/report-v2/05-pdf-report-v2.md`. Source values translated to Dutch without recalculation.
./plans/redesign-canvas/13-content-library.md:12:7. `FitReport.dc.html` — **PDF report, A4 portrait** (canvas entry gets `"paper":"a4","print":"flow"`; read `reference/format.md` and ask the lead for `print.md` if you need it). Source: `BestBikeFit4U_ExampleReport_EN_v2.pdf` in the repo root + `plans/report-v2`. Per the brand guide: an ink header strip with the negative logo, result tiles with large DM Mono numbers, and a lime "eerst aanpassen" block. 2–3 pages.
```

## Validation

- `node scripts/check-image-weight.mjs`: PASS, zero failures; public total 19,372,418 bytes after removal
  (19,706,975 bytes before; 296 → 281 files).
- Focused Vitest image-weight, social image, brand config/logo, hero, PDF layout and measurement language:
  **52 tests / 7 files PASS**.
- `node --test scripts/rebrand-assets.test.mjs`: **3 tests PASS**.
- Both parallel audits retained all their assets: 87 guide/illustration files and seven secondary files.
- A owns combined typecheck/lint/unit/contracts/Convex/build/crawl/migration gates; B does not claim those
  complete or start a competing build. No commits, deployment, production/env changes or email operations.

Per-path retained evidence: C2-kept.md, C2-guides-kept.md and C2-secondary-kept.md.

