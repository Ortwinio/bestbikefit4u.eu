# P2 EN results visual review

## Final v3 verification by parent

Build6KW82hm49ljNYI1ddtwmm: every one of the36 EN result PNG hashes matches the worker-reviewed v2 image.
No new visual delta; v2 acceptance below carries forward. Final200 capture passes. It uses the same-build
compiled disk CSS, independently verified identical to repaired local HTTP CSS; see P2-css-provenance.json.
This supersedes only build/provenance, not the exact reviewed file coverage below.

Status: **v2 EN static visual review PASSED** for 24 full pages and 12 mobile viewports.
Build `0Dw9Uq506jBKvW5c7Uwwh`, origin `http://127.0.0.1:60620/`.
The v2 section below supersedes the initial hold and findings requiring rerender.

## V2 acceptance and exact delta coverage

Compared every current EN results PNG against
`renders/p2-visual/initial-screenshot-hashes.json` (initial build
`UYxIkN6xXxBU0VSr0nQh7`, origin 58410). Verified all 24 full-page hashes also
match the rerun `/private/tmp/P2-report-review/manifest.json`.

There are now **17 EN full-page hash groups**. Eight cases changed, represented
by seven changed groups; manually inspected all seven updated atlases, including
all three mobile strips. The other 16 cases are byte-identical to already inspected
initial images and inherit that review. All 12 mobile viewport PNGs are byte-identical
to the originals individually opened during the initial review; no new viewport
visual differences are asserted or left unreviewed.

Case convention below: `en-results-{state}-{flag}-{width}.png`.

| States | Flag | Width | Current SHA-256 prefix | Review evidence |
|---|---|---|---|---|
| free, free-older | off | 1440 | 66ca948c066ef297 | Initial, identical |
| paid | off | 1440 | 6fc9dfe7ca89e9a1 | V2 manual |
| legacy | off | 1440 | 7e2b3816c426bf08 | Initial, identical |
| single, other-bike | off | 1440 | bd0a39aac912c620 | V2 manual, single representative |
| free | on | 1440 | a77ee0d597cf0215 | Initial, identical |
| paid | on | 1440 | 5444008f7953d75d | V2 manual |
| legacy | on | 1440 | 174b9b332a986a09 | Initial, identical |
| single | on | 1440 | 4ebe39355457fd74 | V2 manual |
| other-bike | on | 1440 | d42fb0f4db1e1ff | V2 manual |
| free-older | on | 1440 | 80e629b04164adfe | V2 manual |
| free, paid, single, other-bike, free-older | off | 390 | 06f6c94b481b2c0a | Initial, identical |
| legacy | off | 390 | 92f4352a3033aec5 | Initial, identical |
| free | on | 390 | d33d87f2b5b47308 | Initial, identical |
| paid, single | on | 390 | d451210b045449a9 | Initial, identical |
| legacy | on | 390 | eca289c18fc0f127 | Initial, identical |
| other-bike | on | 390 | 9fdc2f98a5f05081 | Initial, identical |
| free-older | on | 390 | 3c7db117d86d0943 | V2 manual, all strips |

Viewport convention: `en-results-{state}-{flag}-390-viewport.png`. All 12 checked
against initial hashes; groups below explicitly enumerate coverage:

| States | Flag | Unchanged SHA-256 |
|---|---|---|
| free, paid, single, other-bike, free-older | off | 1090d43ce6c4ee98a4a7a04941219668363ea2f82e61d90056c9b7cee81013a0 |
| legacy | off | fcaa54f8ed888ebc9efcdb6f1c0af302a6e7d03d4ce86df4e015499cb71ff855 |
| free, free-older | on | 4618be353d9a727fd23d154a21e20bbe6d0f25ce005591890d7e6b4d0de8ddd2 |
| legacy | on | 0d0d05220257bbe3a07e7922569bf756e64923355f2b48b3a2cd27b64bb1ca24 |
| paid, single, other-bike | on | 9eaf9ad600cab69e4d6d33cd8e2cc5676fe7bfeb066409e82e28d35c1f397152 |

**Closed findings:**

- Paid desktop sidebar now reads Annual plan; single and other-bike read Single fit,
  with both enforcement flags. Labels fit their cards. Other-bike ON still correctly
  shows basic report access despite the account-wide Single fit label.
- Free-older ON at 390 now has a short disabled Download PDF button and a separate,
  readable two-line latest-report explanation contained within the card. No visible
  horizontal overflow remains. The desktop explanation also fits without overlap.
- No new visual defects in the changed full pages. Prior unchanged layout coverage
  remains valid. Email observation remains non-blocking for the reasons recorded below.

Acceptance is confined to EN results static screenshots and these six states, not
all app surfaces, interactions or uncaptured product variants. Dashboard contrast
verification and NL review remain with their assigned reviewers. Only this audit
document was edited during the v2 review; no app changes, builds or captures.

## Initial capture sweep (historical evidence)

Reviewed production-proxy origin 58410 captures from `renders/p2-visual`, using
`/private/tmp/P2-report-review/manifest.json` and its strip atlases. Parent owns NL.
All 24 original EN full-page PNG SHA-256 hashes were checked against that manifest.
Manually inspected all 14 EN representative atlases (7 desktop + 7 mobile), including
every strip: desktop scaled to 720; mobile native width, except the overflowing case.
Also opened all 12 original 390×844 mobile viewport PNGs individually.

## Exact full-page coverage

Case filename convention: `en-results-{state}-{flag}-{width}.png`.
Each row below applies separately to both listed widths; hashes identify the two
representatives (full hashes retained in the parent manifest).

| States covered | Flag | Widths | Representative state | SHA-256 prefix 1440 / 390 |
|---|---|---|---|---|
| free, paid, single, other-bike, free-older | off | 1440, 390 | free | 66ca948c066ef297 / 06f6c94b481b2c0a |
| legacy | off | 1440, 390 | legacy | 7e2b3816c426bf08 / 92f4352a3033aec5 |
| free | on | 1440, 390 | free | a77ee0d597cf0215 / d33d87f2b5b47308 |
| paid, single | on | 1440, 390 | paid | e5ebf514f697dfb9 / d451210b045449a9 |
| legacy | on | 1440, 390 | legacy | 174b9b332a986a09 / eca289c18fc0f127 |
| other-bike | on | 1440, 390 | other-bike | 2769f6dd523c0b85 / 9fdc2f98a5f05081 |
| free-older | on | 1440, 390 | free-older | a7955ec151985e00 / 08baf0991a85b197 |

This expands to six states × two flags × two widths = 24 full pages. Grouped
cases are byte-identical, not merely visually similar. Mobile atlas strips: three
per representative except legacy-on, which has four; all were inspected.

## Exact original viewport coverage

All files below are under `renders/p2-visual` and were opened, without substituting atlases:

- `en-results-free-off-390-viewport.png`
- `en-results-paid-off-390-viewport.png`
- `en-results-single-off-390-viewport.png`
- `en-results-legacy-off-390-viewport.png`
- `en-results-other-bike-off-390-viewport.png`
- `en-results-free-older-off-390-viewport.png`
- `en-results-free-on-390-viewport.png`
- `en-results-paid-on-390-viewport.png`
- `en-results-single-on-390-viewport.png`
- `en-results-legacy-on-390-viewport.png`
- `en-results-other-bike-on-390-viewport.png`
- `en-results-free-older-on-390-viewport.png`

## Findings and disposition

1. **Account plan truthfulness — requires rerender.** Desktop paid/single states
   show Free in the sidebar despite paid entitlement. Parent confirmed real legacy
   `user.tier` defect. Account owner replaced it with authoritative account-wide
   `getAccess({}).productId`, independent of enforcement, with NL/EN scoped labels.
   Loading/null access remains unknown, not Free; stale Pro/Premium cannot leak.
   This invalidates prior desktop hash grouping after rebuild: recheck all states.
2. **Mobile PDF overflow — requires rerender.**
   `en-results-free-older-on-390.png`, report action card: the long disabled PDF
   label extends beyond card/page width. Same issue parent found in NL; parent
   owns shortening the button and moving explanation into a paragraph. Initial
   viewport looks normal, so full-page inspection is essential.
3. **Email presentation observation, not an access leak.** Both free-older-on
   widths show an apparently active Email Report button beside disabled PDF.
   Source inspection confirms a denied-access click shows the latest-only notice
   and returns before opening the modal; sending is also guarded. No backend leak
   inferred from appearance. Parent can retain this deliberate explanatory action.

## Otherwise observed

- Desktop hierarchy, hero, measurement rows, comparison table and action cards are readable.
- Mobile hero, language controls, rings, navigation and legacy notice fit the viewport.
- Free/other-bike ON show basic accuracy, core-only report action copy and upsell;
  paid/single ON show refined accuracy and full comparison; legacy preserves full report.
- OFF cases retain unrestricted report layout. Unknown current bike measurements
  remain explicitly unknown rather than fabricated differences.
- No additional EN overlap/truncation found beyond the PDF overflow. White atlas
  padding is not app whitespace; fixed mobile navigation crossing full-page content
  is screenshot positioning, not evidence of permanently inaccessible content.

Scope is static captured appearance only: no expanded reasoning, menu interaction,
email delivery, PDF contents or backend authorization verification. No new captures,
builds or report-source edits by this reviewer. Do not interpret capture-run zero
failures as visual acceptance. Parent-requested AccountPlan and dashboard contrast
source fixes are separate from acceptance of these now-stale captures.
