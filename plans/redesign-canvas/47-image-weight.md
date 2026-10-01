# 47 — Image weight for SEO and load time

Request (Ortwin, 2026-10-01): check that image files are not too large for SEO and load time.
Lead audit of `public/` (205 images): PNG 114.7 MB, SVG 70.9 MB, GIF 9.4 MB, WebP 4.6 MB.

## Findings

1. **New guide heroes are fine:** 48 × WebP 1600×1000, all ≤ 130 kB; CMS imports point to the WebP.
2. **Guide SVG sources (71 MB) sit in `public/illustrations/guides/*.svg`** (0.3–2.9 MB each). They are
   deployed and crawlable, and only used by `src/lib/guides/content/batch-b/content.test.ts:92`.
3. **`og:image` serves raw 2.4–2.7 MB PNGs** for the current guides (`public/guides/media/*-hero.png`,
   e.g. `<meta property="og:image" content=".../003--...-hero.png">` = 2.58 MB). On-page images go through
   `next/image` (same file → 176 kB WebP), so page load is fine, but social/link previews and image search
   get the heavy file.
4. **`next/image`-served but heavy sources** (fine for visitors, heavy for builds/repo and optimizer cold
   starts): questionnaire PNGs (`clock.png` 2.4 MB, `riding-position.png` 1.7 MB, `comfort-discomfort.png`
   1.4 MB, `bestbikefit4u-beginner-intermediate-advanced.png` 2.8 MB), `public/measure/*-bbf4u.png`
   (1.1–2.2 MB), mascot on 404 (1.75 MB).
5. **Unused files (no reference in the repo):** `bike-terrain.png`, `climbing-cyclist.png`, `cyclist.png`,
   `type-of-riding.png`, `profile-complete.png`, `mascote/bestbikefit4u-mascote-on-bike.png`,
   `mascote/bestbikefit4u-mascote.png`, `logo/bestbikefit4u-logo-cropped.png` (≈ 18 MB);
   `bestbikefit4u-home.gif` (9.4 MB, only in an old plan/script; the hero uses mp4/webm).

## Task 47 — Codex C

1. Move the guide SVG sources out of `public/` to `plans/redesign-canvas/illustration-sources/guides/` and
   add that folder to `.gitignore` (the repo must not carry 71 MB of SVG). Make the batch-B geometry test
   independent of the SVG files (assert on the generator's geometry data or a small JSON sidecar committed
   next to the content), so tests pass in a clean checkout.
2. Open Graph / Twitter images: guides use a dedicated 1200×630 image ≤ 200 kB (WebP or JPEG; JPEG if a
   platform needs it), generated from the guide's hero; same for other pages that set `og:image` to a large
   PNG. Keep `og:image:width/height/alt`. The rewritten guides use their new illustration.
3. Re-encode the `next/image` sources from finding 4 to WebP (or AVIF) at max 2× their largest rendered
   size, target ≤ 250 kB each; update references; keep visual quality (compare before/after).
4. Delete the unused files in finding 5 (re-check with a repo-wide grep incl. CSS, emails, scripts, Convex,
   CMS JSON; keep anything referenced). Keep `logo/bestbikefit4u-logo.png` (used by a script).
5. Add a guard: `scripts/check-image-weight.mjs` + `npm run lint:images` in `lint`: fail on any file in
   `public/` > 300 kB (raster) or > 150 kB (SVG), with an explicit allow-list for video files.
6. Check LCP images on home, a guide, a calculator and the dashboard have `priority`/correct `sizes`.

Acceptance: `lint:images` passes, all tests/typecheck/lint pass, `public/` total reported before/after,
og:image sizes listed per page type, screenshots of re-encoded images vs originals.
Notes `audit/47-notes.md`, `files-47.txt` (no png). No commit. Print **DONE 47**.
