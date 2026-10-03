# S5 homepage visual capture

Complete: unchanged BEFORE source frozen before parent homepage edits; BEFORE and AFTER captured for NL/EN at 1440×1000 and 390×844. Eight full-page PNGs are in `../renders/S5-*.png`.

## Results

| Locale | Width | Before height | After height | Change |
| --- | ---: | ---: | ---: | ---: |
| NL | 1440 | 4964 | 5013 | +49 px |
| NL | 390 | 9016 | 9142 | +126 px |
| EN | 1440 | 4956 | 4956 | 0 px |
| EN | 390 | 8973 | 9123 | +150 px |

All eight captures: no horizontal overflow, no page runtime errors, no broken images, and no external requests. All three local font families loaded. Each version has the same 11 section elements (including the three collapsed discovery sections), 10 grid containers, grid columns, child counts, section widths and horizontal positions. The hero dimensions remain identical.

The neutral guidance text wraps differently: the NL desktop proof band grows 17.7 px and guidance section 31.5 px; NL mobile guidance grows 126 px; EN mobile proof band grows 19.5 px and guidance grows 130.2 px. Subsequent sections move down by those amounts. Thus the layout structure is preserved, but full-page height is not pixel-identical. No clipping or overlap was observed in inspected desktop/mobile renders. Parent also inspected AFTER NL desktop and EN mobile.

## Method and evidence

`S5-home-capture.mjs` reuses the repository esbuild/Playwright fixture approach and existing Next link/image adapters. It bundles the actual homepage, header, footer, teaser, dictionaries, theme provider, CSS modules and compiled global Tailwind stylesheet. Fonts come from `public/brand/report/fonts`; variable weight ranges are declared explicitly. Browser requests are restricted to the ephemeral loopback server, with all other requests aborted and recorded.

Synthetic signed-out auth and no-op mutations prevent backend writes. CMS blog content is empty and the consent banner is omitted to represent its dismissed state. No production data, network services, mail, new dependencies, commits, or deploys were used. This verifies offline client-rendered layout/runtime, not Next SSR, hydration, production CMS content or SEO metadata.

`S5-before-capture.json` and `S5-after-capture.json` contain source/bundle/CSS SHA-256 hashes, loaded fonts, text, section measurements, grid measurements and request/error records. `S5-visual-comparison.json` contains the per-section comparison.

The complete original source snapshot was moved to `/private/tmp/bbf-semrush-S5-before-source` before final captures. Generated JS/CSS bundles also live only in `/private/tmp/S5-{before,after}-{bundle.js,styles.css}`. No copied application source or bundles remain under plans. Only the harness, evidence JSON, notes, manifest and screenshots belong to this worker.

Run from the semrush worktree:

```sh
node plans/seo-semrush/audit/S5-home-capture.mjs before
node plans/seo-semrush/audit/S5-home-capture.mjs after
```

The BEFORE command requires the local frozen snapshot and its symlink to existing worktree dependencies. The AFTER command uses current worktree source. Parent owns the broader S5 test/build gates.
