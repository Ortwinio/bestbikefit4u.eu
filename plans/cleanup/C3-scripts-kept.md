# C3 scripts and visual tools retained

4 October 2026. Reviewed scripts/ and tests/visual/, package/workflow entry points, full repository references, dynamic invocation strings, imports and C1-dependency-audit.md. No visual batch was proven to cover exclusively removed pages. No deletion quota; uncertainty means keep.

| Paths | Evidence / keep reason |
| --- | --- |
| scripts/performance/debug.mjs | Initially looked like a fixed-port S10 scratch probe, but performance/local.mjs:25 dispatches it with --debug. Keep live option. |
| scripts/convert-hero-video.sh | Reproducible ffmpeg recipe for MP4/WebM still used by HeroBackground.tsx. Missing local archived GIF is not proof outputs are unused. |
| scripts/seed-guides.ts, import-guide-json.ts, import-guide-rewrites.mjs, guides-batch-*/**, images/** | CMS/import and reproducible illustration pipelines, protected current guide data and provenance. Draw scripts call archive-guide-source.py. No production invocation made. |
| scripts/rebrand-assets.mjs, rebrand-assets-outline.py, rebrand-assets-wordmark.json, rebrand-assets.test.mjs | Current asset reproduction; generator reads wordmark JSON, public/brand/LEESMIJ.md documents outline regeneration. |
| tests/visual/image-weight/capture.mjs | Still checks current OG image dimensions, byte budget and Twitter consistency. Reads 47-optimized.json and originals, including old logo comparison. Keep consumer and inputs; do not weaken tests to delete assets. |
| All other tests/visual/** | Existing account, calculator, guide/blog, dark/theme, accessibility, language, PDF and sweep coverage. No conclusive dead-route-only batch. Relative-import scan exceptions were generated/esbuild imports resolved from their custom working directories, not proof of missing pages. |
| scripts/seo-crawl*, domain-migration*, riderprofile-baseline* | Explicitly protected gates and scheduled 18 October baseline; untouched. |
| Other scripts/libraries/tests | Active package commands, manually runnable diagnostics or reproducible generators; no conclusive unused proof. |

C1: retain all input exceptions documented in C1-dependency-audit.md: guide import JSON, six FitRapport boards, route-map.md, 47-optimized.json and any available originals, 44a guide audit, S9 internal-links JSON, S10 summaries if present, 40a-nl snapshots, optional board/contact-sheet image inputs and PDF verifier inputs if present. Keep minimal directory contracts for retained writers. Rebrand capture removal releases only B1 capture outputs; email/PDF rendering and brand generation still write under rebrand. All visual harnesses and fixtures remain.
