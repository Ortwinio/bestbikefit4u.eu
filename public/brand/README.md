# BestBikeFit4U brand assets (lime/petrol, 2026 redesign)

These are generated from the brand guide (`plans/redesign-canvas/reference/brand.md`) with its `logo_set.py`; all text is converted to outlines.
**Not wired into the app yet.** The live site still uses `public/logo/*` via `src/config/brand.ts`, plus `src/app/icon.png`, `src/app/favicon.ico` and `src/app/manifest.ts`. The switch happens in phase 6 of the redesign (see `plans/redesign-canvas/README.md`).

| Folder | Contents | Use |
|---|---|---|
| `logo/` | `logo-horizontaal(-negatief/-zwart/-wit)`, `logo-gestapeld(-negatief)`, `beeldmerk(-donker/-zwart)` as SVG, plus PNG at 480/960 and the mark at 256/512/1024 | Horizontal is the default on light backgrounds; negatief goes on ink (footer, sidebar); gestapeld is for square spots |
| `favicon/` | `favicon.ico` (16/32/48), `favicon.svg`, `apple-touch-icon.png`, `android-chrome-192/512.png`, `maskable-512.png`, `site.webmanifest` | For `src/app/` and the `<head>` (theme-color `#0F2420`) |
| `social/` | `og-image-1200x630.png` (+ SVG) | The default Open Graph image |

The illustrations are in `public/illustrations/`: pen drawings in house style, with no text in the image (so they work in both NL and EN). 01 and 05 are 16:10 (hero, 1600×1000); the rest are 4:3 (cards, 1600×1200).
