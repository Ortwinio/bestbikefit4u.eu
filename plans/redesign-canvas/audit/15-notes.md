# 15 — Code foundation

Implemented on `redesign/canvas`, uncommitted for lead review. No canvas or draft files edited by Codex C.

## Validation

- `npm run typecheck`: passed.
- `npm run lint`: passed, including 214/214 contrast checks.
- `npm run test:unit`: 162 files, 640 tests passed.
- `npm run build`: passed, 229 static pages generated. Google Fonts required network access outside the sandbox; no missing environment variables or invented credentials.

## Shared component compatibility

- Status fills are pale brand colors; existing standalone status text classes now use `text-success-text`, `text-warning-text`, `text-destructive-text` and `text-danger-text` (including opacity variants). These are readable on existing page surfaces.
- Shared button primary/outline styles use solid semantic colors; hover uses valid existing hover tokens. Sizes and page layouts preserved.

## Fonts, logos and metadata (Codex C assets subtask)

- `src/app/layout.tsx`: next/font/google Bricolage Grotesque 600/700/800 (`--font-display`), Figtree 400/500/600/700 (`--font-body`), DM Mono 500 (`--font-mono`) on root html; semantic body bg/foreground and font-sans. Browser theme color ink; metadata icon sizes now correct, Apple icon 180×180, root OG/Twitter image points to supplied brand social PNG.
- `src/config/brand.ts`: primary/negative horizontal SVG and mark from `/brand/logo/`; favicon and 192/512/maskable/Apple assets from `/brand/favicon/`; social default from `/brand/social/og-image-1200x630.png`.
- `src/app/manifest.ts`: paper background, ink theme, 192/512 PNG and 512 maskable app icons.
- Replaced `src/app/icon.png` and `src/app/favicon.ico`, added `src/app/apple-icon.png`, copied exactly from supplied `public/brand/favicon/` assets. Added `src/app/opengraph-image.png` as the exact supplied social image: file-based metadata provides the inherited default when nested pages define their own openGraph title/description; page/CMS explicit images stay intentional.
- `src/components/branding/BrandLogo.tsx`: correct horizontal intrinsic dimensions 381×64 and mark/icon dimensions 64×64. Existing theme-aware primary selects negative logo in dark theme; explicit dark remains available for fixed dark surfaces. Removed previous app-icon wrapper's gradients, border, padding and shadow, preserving actual art.
- `src/components/layout/Header.tsx`: mobile horizontal logo minimum width raised from 84 to brand minimum 120 px. Other dimensions/layouts retained.

### Audited / deliberately unchanged

- HeaderMobileMenu, auth layout, dashboard sidebar/mobile header inherit updated shared BrandLogo automatically. Sidebar remains theme-aware because its existing surface is light in light theme and dark in dark theme.
- Footer currently has no logo at all. No footer layout/content block introduced in foundation-only step.
- `convex/auth.ts:147`, `convex/emails/actions.ts:120`, `convex/emails/htmlHelpers.ts:10`: Resend server HTML pipelines render brand as styled text, with inline colors/font stacks. Kept intact for a separate email-compatible branding pass (raster images/client-safe font fallbacks and actual email rendering validation).
- `src/lib/reports/pdfLayoutTemplate.ts:272`: print header uses self-contained inline SVG/data URI, with Arial text and old blue mark. Report cover also references legacy `/logo/bestbikefit4u_mark.png` (~505). `src/lib/pdf/simplePdf.ts:71` embeds standard Helvetica in a separate minimal PDF fallback. All kept intact because PDF embedding/font/header rendering is a separate pipeline; needs a dedicated render-and-verify pass.
- Existing public page/footer gradients and illustration assets were not rewritten; no page layouts were redesigned.


# Token foundation findings

214/214 foreground/background checks pass (4.5:1 text, 3:1 focus and invalid rings). Primary white/petrol 5.83:1; ink/lime 12.80:1; ink/destructive peach 9.28:1; ink/warning 11.66:1. Dark primary #77C7B3/ink 8.20:1. Dark surfaces #18332D and #23453D.

Proposed #9CC21F ring was replaced with petrol on light surfaces, light petrol on dark, because proposed lime ring fails 3:1 on paper and white. Brand hex direct-use tokens remain fixed in both modes. Semantic tuples use OKLCH converted from exact sRGB hex, rounded to five/seven/five decimal places.

Public/dashboard gradient surfaces and body gradients become solid token surfaces, preserving layout. Light sidebar remains a light petrol-soft surface; dark sidebar uses the dark surface. Removed existing cyclic --foreground:var(--foreground) dashboard override. Fixed surface-secondary/tertiary to valid full colors for direct var() consumers. Added status text tokens separate from pale status fills; parent is migrating source usages. Existing standard decorative border/input colors stay brand rand (these are not the focus or invalid state indicators).

Font-sans uses --font-body; explicit font-display/font-mono utilities use the next/font variables directly, avoiding self-reference. Existing h1-h6 display defaults retained.

Files: src/app/globals.css, scripts/check-brand-contrast.mjs, package.json. No drafts edited or commits made.

| Mode / token | Old | New |
|---|---|---|
| :root `--bbf-lime` | `new` | `#CFF26A` |
| :root `--bbf-lime-zacht` | `new` | `#E6F8A8` |
| :root `--bbf-petrol` | `new` | `#0A7263` |
| :root `--bbf-petrol-hover` | `new` | `#075A4E` |
| :root `--bbf-petrol-zacht` | `new` | `#E1F2EE` |
| :root `--bbf-inkt` | `new` | `#0F2420` |
| :root `--bbf-tekst` | `new` | `#3B4F4A` |
| :root `--bbf-gedempt` | `new` | `#4A5F5A` |
| :root `--bbf-op-donker` | `new` | `#B9CCC6` |
| :root `--bbf-rand` | `new` | `#DCE6E1` |
| :root `--bbf-papier` | `new` | `#F5F8F3` |
| :root `--bbf-wit` | `new` | `#FFFFFF` |
| :root `--bbf-warning` | `new` | `#FFD66B` |
| :root `--bbf-destructive` | `new` | `#FFB199` |
| :root `--bbf-font-display` | `new` | `var(--font-display), sans-serif` |
| :root `--bbf-font-body` | `new` | `var(--font-body), system-ui, sans-serif` |
| :root `--bbf-font-cijfers` | `new` | `var(--font-mono), ui-monospace, monospace` |
| :root `--bbf-radius-knop` | `new` | `999px` |
| :root `--bbf-radius-kaart` | `new` | `24px` |
| :root `--bbf-radius-paneel` | `new` | `32px` |
| :root `--bbf-radius-veld` | `new` | `14px` |
| :root `--public-shell-background` | `99.20% 0.004 248.0` | `97.54721% 0.0073056 132.41432` |
| :root `--public-shell-elevated` | `97.80% 0.010 244.0` | `94.74321% 0.0187021 180.26554` |
| :root `--public-card` | `98.90% 0.002 248.0` | `100.00000% 0.0000000 89.87556` |
| :root `--public-card-subtle` | `97.10% 0.010 243.0` | `94.74321% 0.0187021 180.26554` |
| :root `--public-card-strong` | `96.40% 0.020 242.0` | `94.73259% 0.1036280 118.73767` |
| :root `--public-band` | `95.60% 0.018 242.3` | `94.74321% 0.0187021 180.26554` |
| :root `--public-hero` | `96.20% 0.022 241.0` | `94.73259% 0.1036280 118.73767` |
| :root `--public-cta` | `94.80% 0.026 240.0` | `94.73259% 0.1036280 118.73767` |
| :root `--public-border-soft` | `90.80% 0.016 242.3` | `91.59516% 0.0126119 164.77798` |
| :root `--public-border-strong` | `84.20% 0.032 241.0` | `91.59516% 0.0126119 164.77798` |
| :root `--public-shell-glow` | `66.11% 0.156 242.3 / 0.16` | `24.12662% 0.0283111 180.00152 / 0.38` |
| :root `--dashboard-shell` | `98.60% 0.006 246.0` | `97.54721% 0.0073056 132.41432` |
| :root `--dashboard-shell-elevated` | `97.50% 0.012 243.0` | `94.74321% 0.0187021 180.26554` |
| :root `--dashboard-sidebar` | `95.60% 0.019 241.8` | `94.74321% 0.0187021 180.26554` |
| :root `--dashboard-sidebar-elevated` | `97.20% 0.012 244.2` | `94.74321% 0.0187021 180.26554` |
| :root `--dashboard-surface` | `98.10% 0.007 246.0` | `100.00000% 0.0000000 89.87556` |
| :root `--dashboard-surface-muted` | `96.70% 0.014 242.0` | `94.74321% 0.0187021 180.26554` |
| :root `--dashboard-surface-strong` | `95.90% 0.022 241.0` | `94.73259% 0.1036280 118.73767` |
| :root `--dashboard-hero` | `95.80% 0.022 241.2` | `94.73259% 0.1036280 118.73767` |
| :root `--dashboard-border-soft` | `86.80% 0.024 241.8` | `91.59516% 0.0126119 164.77798` |
| :root `--dashboard-border-strong` | `79.80% 0.040 241.0` | `91.59516% 0.0126119 164.77798` |
| :root `--dashboard-nav-foreground` | `33.50% 0.032 241.0` | `46.65532% 0.0267256 178.91784` |
| :root `--dashboard-nav-foreground-strong` | `24.50% 0.026 246.0` | `24.12662% 0.0283111 180.00152` |
| :root `--dashboard-nav-hover-surface` | `93.80% 0.024 241.0` | `94.73259% 0.1036280 118.73767` |
| :root `--dashboard-nav-active-surface` | `90.60% 0.038 240.8` | `94.73259% 0.1036280 118.73767` |
| :root `--dashboard-backdrop` | `26.00% 0.012 264.0 / 0.38` | `24.12662% 0.0283111 180.00152 / 0.38` |
| :root `--dashboard-field-background` | `99.40% 0.002 248.0` | `100.00000% 0.0000000 89.87556` |
| :root `--dashboard-field-border` | `oklch(0% 0 0 / 0.10)` | `oklch(91.59516% 0.0126119 164.77798)` |
| :root `--dashboard-field-border-hover` | `oklch(0% 0 0 / 0.18)` | `oklch(49.55246% 0.0880509 179.13989)` |
| :root `--background` | `100.00% 0.000 0.0` | `97.54721% 0.0073056 132.41432` |
| :root `--foreground` | `24.08% 0.020 271.8` | `24.12662% 0.0283111 180.00152` |
| :root `--card-foreground` | `24.08% 0.020 271.8` | `24.12662% 0.0283111 180.00152` |
| :root `--popover` | `100.00% 0.000 0.0` | `97.54721% 0.0073056 132.41432` |
| :root `--popover-foreground` | `24.08% 0.020 271.8` | `24.12662% 0.0283111 180.00152` |
| :root `--primary` | `66.11% 0.156 242.3` | `49.55246% 0.0880509 179.13989` |
| :root `--primary-foreground` | `98.50% 0.000 0.0` | `100.00000% 0.0000000 89.87556` |
| :root `--primary-light` | `78.00% 0.092 240.0` | `94.74321% 0.0187021 180.26554` |
| :root `--primary-middle` | `71.50% 0.122 241.5` | `49.55246% 0.0880509 179.13989` |
| :root `--primary-dark` | `57.00% 0.145 242.3` | `41.99046% 0.0742164 179.31931` |
| :root `--secondary-foreground` | `31.00% 0.032 242.3` | `24.12662% 0.0283111 180.00152` |
| :root `--muted` | `96.60% 0.006 248.0` | `94.74321% 0.0187021 180.26554` |
| :root `--muted-foreground` | `50.04% 0.040 238.3` | `46.65532% 0.0267256 178.91784` |
| :root `--accent` | `95.20% 0.032 60.0` | `90.91632% 0.1665224 121.85914` |
| :root `--accent-foreground` | `31.00% 0.060 48.0` | `24.12662% 0.0283111 180.00152` |
| :root `--destructive` | `63.68% 0.208 8.0` | `82.90148% 0.0978429 37.82491` |
| :root `--destructive-foreground` | `14.00% 0.004 286.0` | `24.12662% 0.0283111 180.00152` |
| :root `--success` | `72.05% 0.192 160.3` | `90.91632% 0.1665224 121.85914` |
| :root `--success-foreground` | `14.00% 0.004 286.0` | `24.12662% 0.0283111 180.00152` |
| :root `--warning` | `74.09% 0.168 60.0` | `89.05702% 0.1333179 88.52761` |
| :root `--warning-foreground` | `24.08% 0.020 271.8` | `24.12662% 0.0283111 180.00152` |
| :root `--info` | `66.11% 0.156 242.3` | `49.55246% 0.0880509 179.13989` |
| :root `--info-foreground` | `98.50% 0.000 0.0` | `100.00000% 0.0000000 89.87556` |
| :root `--border` | `90.80% 0.016 242.3` | `91.59516% 0.0126119 164.77798` |
| :root `--border-light` | `96.80% 0.004 248.0` | `91.59516% 0.0126119 164.77798` |
| :root `--border-dark` | `79.00% 0.025 238.3` | `91.59516% 0.0126119 164.77798` |
| :root `--input` | `90.80% 0.016 242.3` | `91.59516% 0.0126119 164.77798` |
| :root `--ring` | `66.11% 0.156 242.3` | `49.55246% 0.0880509 179.13989` |
| :root `--surface-foreground` | `24.08% 0.020 271.8` | `24.12662% 0.0283111 180.00152` |
| :root `--overlay` | `100.00% 0.000 0.0` | `97.54721% 0.0073056 132.41432` |
| :root `--overlay-foreground` | `24.08% 0.020 271.8` | `24.12662% 0.0283111 180.00152` |
| :root `--field-background` | `100.00% 0.000 0.0` | `100.00000% 0.0000000 89.87556` |
| :root `--success-text` | `new` | `var(--foreground)` |
| :root `--warning-text` | `new` | `var(--foreground)` |
| :root `--destructive-text` | `new` | `var(--foreground)` |
| :root `--primary-hover` | `color-mix(in oklab, oklch(66.11% 0.156 242.3) 88%, oklch(98.50% 0.000 0.0) 12%)` | `oklch(41.99046% 0.0742164 179.31931)` |
| :root `--destructive-hover` | `color-mix(in oklab, oklch(63.68% 0.208 8.0) 90%, oklch(14.00% 0.004 286.0) 10%)` | `oklch(82.90148% 0.0978429 37.82491)` |
| :root `--success-hover` | `color-mix(in oklab, oklch(72.05% 0.192 160.3) 90%, oklch(14.00% 0.004 286.0) 10%)` | `oklch(94.73259% 0.1036280 118.73767)` |
| :root `--warning-hover` | `color-mix(in oklab, oklch(74.09% 0.168 60.0) 88%, oklch(24.08% 0.020 271.8) 12%)` | `oklch(89.05702% 0.1333179 88.52761)` |
| :root `--accent-hover` | `color-mix(in oklab, oklch(95.20% 0.032 60.0) 88%, oklch(74.09% 0.168 60.0) 12%)` | `oklch(94.73259% 0.1036280 118.73767)` |
| :root `--primary-soft` | `color-mix(in oklab, oklch(66.11% 0.156 242.3) 14%, transparent)` | `oklch(94.74321% 0.0187021 180.26554)` |
| :root `--primary-soft-hover` | `color-mix(in oklab, oklch(66.11% 0.156 242.3) 20%, transparent)` | `oklch(94.74321% 0.0187021 180.26554)` |
| :root `--destructive-soft` | `color-mix(in oklab, oklch(63.68% 0.208 8.0) 15%, transparent)` | `oklch(82.90148% 0.0978429 37.82491)` |
| :root `--destructive-soft-hover` | `color-mix(in oklab, oklch(63.68% 0.208 8.0) 20%, transparent)` | `oklch(82.90148% 0.0978429 37.82491)` |
| :root `--surface-secondary` | `var(--public-card-subtle)` | `oklch(var(--public-card-subtle))` |
| :root `--surface-tertiary` | `var(--public-hero)` | `oklch(var(--public-hero))` |
| :root `--field-border` | `oklch(0% 0 0 / 0.12)` | `oklch(91.59516% 0.0126119 164.77798)` |
| :root `--field-border-hover` | `oklch(0% 0 0 / 0.22)` | `oklch(49.55246% 0.0880509 179.13989)` |
| :root `--field-border-invalid` | `oklch(63.68% 0.208 8.0)` | `oklch(49.55246% 0.0880509 179.13989)` |
| .dark `--public-shell-background` | `22.80% 0.019 268.0` | `24.12662% 0.0283111 180.00152` |
| .dark `--public-shell-elevated` | `26.20% 0.022 262.0` | `29.74506% 0.0351159 177.67575` |
| .dark `--public-card` | `29.20% 0.021 259.0` | `29.74506% 0.0351159 177.67575` |
| .dark `--public-card-subtle` | `32.40% 0.024 256.0` | `29.74506% 0.0351159 177.67575` |
| .dark `--public-card-strong` | `35.20% 0.035 247.0` | `36.18102% 0.0424832 176.78888` |
| .dark `--public-band` | `35.00% 0.032 246.0` | `29.74506% 0.0351159 177.67575` |
| .dark `--public-hero` | `36.00% 0.040 244.0` | `36.18102% 0.0424832 176.78888` |
| .dark `--public-cta` | `38.00% 0.046 242.0` | `36.18102% 0.0424832 176.78888` |
| .dark `--public-border-soft` | `38.00% 0.022 242.3` | `46.65532% 0.0267256 178.91784` |
| .dark `--public-border-strong` | `46.00% 0.035 241.0` | `46.65532% 0.0267256 178.91784` |
| .dark `--public-shell-glow` | `72.00% 0.145 242.3 / 0.22` | `24.12662% 0.0283111 180.00152 / 0.38` |
| .dark `--dashboard-shell` | `24.80% 0.020 266.0` | `24.12662% 0.0283111 180.00152` |
| .dark `--dashboard-shell-elevated` | `27.60% 0.022 261.0` | `29.74506% 0.0351159 177.67575` |
| .dark `--dashboard-sidebar` | `26.60% 0.024 257.0` | `29.74506% 0.0351159 177.67575` |
| .dark `--dashboard-sidebar-elevated` | `30.00% 0.028 252.0` | `29.74506% 0.0351159 177.67575` |
| .dark `--dashboard-surface` | `31.20% 0.024 258.0` | `29.74506% 0.0351159 177.67575` |
| .dark `--dashboard-surface-muted` | `34.00% 0.024 254.0` | `29.74506% 0.0351159 177.67575` |
| .dark `--dashboard-surface-strong` | `37.40% 0.036 246.0` | `36.18102% 0.0424832 176.78888` |
| .dark `--dashboard-hero` | `36.60% 0.040 244.0` | `36.18102% 0.0424832 176.78888` |
| .dark `--dashboard-border-soft` | `43.00% 0.026 242.0` | `46.65532% 0.0267256 178.91784` |
| .dark `--dashboard-border-strong` | `52.00% 0.040 241.0` | `46.65532% 0.0267256 178.91784` |
| .dark `--dashboard-nav-foreground` | `87.00% 0.020 240.0` | `82.90924% 0.0222050 174.86826` |
| .dark `--dashboard-nav-foreground-strong` | `97.50% 0.010 245.0` | `100.00000% 0.0000000 89.87556` |
| .dark `--dashboard-nav-hover-surface` | `38.00% 0.034 246.5` | `36.18102% 0.0424832 176.78888` |
| .dark `--dashboard-nav-active-surface` | `44.20% 0.050 241.0` | `36.18102% 0.0424832 176.78888` |
| .dark `--dashboard-backdrop` | `0% 0 0 / 0.52` | `24.12662% 0.0283111 180.00152 / 0.38` |
| .dark `--dashboard-field-background` | `29.40% 0.020 258.0` | `29.74506% 0.0351159 177.67575` |
| .dark `--dashboard-field-border` | `oklch(100% 0 0 / 0.12)` | `oklch(46.65532% 0.0267256 178.91784)` |
| .dark `--dashboard-field-border-hover` | `oklch(100% 0 0 / 0.22)` | `oklch(77.23989% 0.0845368 176.14123)` |
| .dark `--background` | `24.08% 0.020 271.8` | `24.12662% 0.0283111 180.00152` |
| .dark `--foreground` | `98.48% 0.000 0.0` | `100.00000% 0.0000000 89.87556` |
| .dark `--card-foreground` | `98.48% 0.000 0.0` | `100.00000% 0.0000000 89.87556` |
| .dark `--popover` | `24.08% 0.020 271.8` | `24.12662% 0.0283111 180.00152` |
| .dark `--popover-foreground` | `98.48% 0.000 0.0` | `100.00000% 0.0000000 89.87556` |
| .dark `--primary` | `72.00% 0.145 242.3` | `77.23989% 0.0845368 176.14123` |
| .dark `--primary-foreground` | `98.50% 0.000 0.0` | `24.12662% 0.0283111 180.00152` |
| .dark `--primary-light` | `80.00% 0.110 240.0` | `94.74321% 0.0187021 180.26554` |
| .dark `--primary-middle` | `75.50% 0.128 241.5` | `77.23989% 0.0845368 176.14123` |
| .dark `--primary-dark` | `63.00% 0.135 242.3` | `77.23989% 0.0845368 176.14123` |
| .dark `--secondary-foreground` | `98.43% 0.019 243.0` | `100.00000% 0.0000000 89.87556` |
| .dark `--muted` | `30.00% 0.014 255.0` | `29.74506% 0.0351159 177.67575` |
| .dark `--muted-foreground` | `76.00% 0.018 240.0` | `82.90924% 0.0222050 174.86826` |
| .dark `--accent` | `36.00% 0.060 60.0` | `90.91632% 0.1665224 121.85914` |
| .dark `--accent-foreground` | `92.00% 0.024 80.0` | `24.12662% 0.0283111 180.00152` |
| .dark `--destructive` | `55.00% 0.180 8.0` | `82.90148% 0.0978429 37.82491` |
| .dark `--destructive-foreground` | `98.50% 0.000 0.0` | `24.12662% 0.0283111 180.00152` |
| .dark `--success` | `79.99% 0.182 160.3` | `90.91632% 0.1665224 121.85914` |
| .dark `--success-foreground` | `14.00% 0.004 286.0` | `24.12662% 0.0283111 180.00152` |
| .dark `--warning` | `78.00% 0.145 60.0` | `89.05702% 0.1333179 88.52761` |
| .dark `--warning-foreground` | `24.08% 0.020 271.8` | `24.12662% 0.0283111 180.00152` |
| .dark `--info` | `72.00% 0.145 242.3` | `77.23989% 0.0845368 176.14123` |
| .dark `--info-foreground` | `98.50% 0.000 0.0` | `24.12662% 0.0283111 180.00152` |
| .dark `--border` | `38.00% 0.022 242.3` | `46.65532% 0.0267256 178.91784` |
| .dark `--border-light` | `46.00% 0.024 240.0` | `46.65532% 0.0267256 178.91784` |
| .dark `--border-dark` | `29.00% 0.018 258.0` | `46.65532% 0.0267256 178.91784` |
| .dark `--input` | `30.00% 0.014 255.0` | `46.65532% 0.0267256 178.91784` |
| .dark `--ring` | `72.00% 0.145 242.3` | `77.23989% 0.0845368 176.14123` |
| .dark `--surface-foreground` | `98.48% 0.000 0.0` | `100.00000% 0.0000000 89.87556` |
| .dark `--overlay` | `21.00% 0.018 265.0` | `24.12662% 0.0283111 180.00152` |
| .dark `--overlay-foreground` | `98.48% 0.000 0.0` | `100.00000% 0.0000000 89.87556` |
| .dark `--field-background` | `28.00% 0.020 260.0` | `29.74506% 0.0351159 177.67575` |
| .dark `--success-text` | `new` | `var(--success)` |
| .dark `--warning-text` | `new` | `var(--warning)` |
| .dark `--destructive-text` | `new` | `var(--destructive)` |
| .dark `--primary-hover` | `color-mix(in oklab, oklch(72.00% 0.145 242.3) 88%, oklch(98.50% 0.000 0.0) 12%)` | `oklch(94.74321% 0.0187021 180.26554)` |
| .dark `--destructive-hover` | `color-mix(in oklab, oklch(55.00% 0.180 8.0) 90%, oklch(98.50% 0.000 0.0) 10%)` | `oklch(82.90148% 0.0978429 37.82491)` |
| .dark `--success-hover` | `color-mix(in oklab, oklch(79.99% 0.182 160.3) 90%, oklch(14.00% 0.004 286.0) 10%)` | `oklch(94.73259% 0.1036280 118.73767)` |
| .dark `--warning-hover` | `color-mix(in oklab, oklch(78.00% 0.145 60.0) 88%, oklch(24.08% 0.020 271.8) 12%)` | `oklch(89.05702% 0.1333179 88.52761)` |
| .dark `--accent-hover` | `color-mix(in oklab, oklch(36.00% 0.060 60.0) 88%, oklch(78.00% 0.145 60.0) 12%)` | `oklch(94.73259% 0.1036280 118.73767)` |
| .dark `--primary-soft` | `color-mix(in oklab, oklch(72.00% 0.145 242.3) 18%, transparent)` | `oklch(36.18102% 0.0424832 176.78888)` |
| .dark `--primary-soft-hover` | `color-mix(in oklab, oklch(72.00% 0.145 242.3) 24%, transparent)` | `oklch(36.18102% 0.0424832 176.78888)` |
| .dark `--destructive-soft` | `color-mix(in oklab, oklch(55.00% 0.180 8.0) 15%, transparent)` | `oklch(36.18102% 0.0424832 176.78888)` |
| .dark `--destructive-soft-hover` | `color-mix(in oklab, oklch(55.00% 0.180 8.0) 20%, transparent)` | `oklch(36.18102% 0.0424832 176.78888)` |
| .dark `--surface-secondary` | `var(--public-card-subtle)` | `oklch(var(--public-card-subtle))` |
| .dark `--surface-tertiary` | `var(--public-hero)` | `oklch(var(--public-hero))` |
| .dark `--field-border` | `oklch(100% 0 0 / 0.12)` | `oklch(46.65532% 0.0267256 178.91784)` |
| .dark `--field-border-hover` | `oklch(100% 0 0 / 0.22)` | `oklch(77.23989% 0.0845368 176.14123)` |
| .dark `--field-border-invalid` | `oklch(55.00% 0.180 8.0)` | `oklch(77.23989% 0.0845368 176.14123)` |

## Full contrast results

```text
PASS light card-foreground / card: 16.23:1 (minimum 4.5:1)
PASS light popover-foreground / popover: 15.16:1 (minimum 4.5:1)
PASS light primary-foreground / primary: 5.83:1 (minimum 4.5:1)
PASS light secondary-foreground / secondary: 14.02:1 (minimum 4.5:1)
PASS light muted-foreground / muted: 5.90:1 (minimum 4.5:1)
PASS light accent-foreground / accent: 12.80:1 (minimum 4.5:1)
PASS light destructive-foreground / destructive: 9.28:1 (minimum 4.5:1)
PASS light success-foreground / success: 12.80:1 (minimum 4.5:1)
PASS light warning-foreground / warning: 11.66:1 (minimum 4.5:1)
PASS light info-foreground / info: 5.83:1 (minimum 4.5:1)
PASS light surface-foreground / surface: 16.23:1 (minimum 4.5:1)
PASS light overlay-foreground / overlay: 15.16:1 (minimum 4.5:1)
PASS light danger-foreground / danger: 9.28:1 (minimum 4.5:1)
PASS light foreground / background: 15.16:1 (minimum 4.5:1)
PASS light foreground / background: 15.16:1 (minimum 4.5:1)
PASS light muted-foreground / background: 6.37:1 (minimum 4.5:1)
PASS light foreground / card: 16.23:1 (minimum 4.5:1)
PASS light muted-foreground / card: 6.83:1 (minimum 4.5:1)
PASS light foreground / field-background: 16.23:1 (minimum 4.5:1)
PASS light muted-foreground / field-background: 6.83:1 (minimum 4.5:1)
PASS light foreground / surface-secondary: 14.02:1 (minimum 4.5:1)
PASS light muted-foreground / surface-secondary: 5.90:1 (minimum 4.5:1)
PASS light foreground / surface-tertiary: 14.19:1 (minimum 4.5:1)
PASS light muted-foreground / surface-tertiary: 5.97:1 (minimum 4.5:1)
PASS light foreground / public-shell-background: 15.16:1 (minimum 4.5:1)
PASS light muted-foreground / public-shell-background: 6.37:1 (minimum 4.5:1)
PASS light foreground / public-shell-elevated: 14.02:1 (minimum 4.5:1)
PASS light muted-foreground / public-shell-elevated: 5.90:1 (minimum 4.5:1)
PASS light foreground / public-card: 16.23:1 (minimum 4.5:1)
PASS light muted-foreground / public-card: 6.83:1 (minimum 4.5:1)
PASS light foreground / public-card-subtle: 14.02:1 (minimum 4.5:1)
PASS light muted-foreground / public-card-subtle: 5.90:1 (minimum 4.5:1)
PASS light foreground / public-card-strong: 14.19:1 (minimum 4.5:1)
PASS light muted-foreground / public-card-strong: 5.97:1 (minimum 4.5:1)
PASS light foreground / public-band: 14.02:1 (minimum 4.5:1)
PASS light muted-foreground / public-band: 5.90:1 (minimum 4.5:1)
PASS light foreground / public-hero: 14.19:1 (minimum 4.5:1)
PASS light muted-foreground / public-hero: 5.97:1 (minimum 4.5:1)
PASS light foreground / public-cta: 14.19:1 (minimum 4.5:1)
PASS light muted-foreground / public-cta: 5.97:1 (minimum 4.5:1)
PASS light foreground / dashboard-shell: 15.16:1 (minimum 4.5:1)
PASS light muted-foreground / dashboard-shell: 6.37:1 (minimum 4.5:1)
PASS light foreground / dashboard-shell-elevated: 14.02:1 (minimum 4.5:1)
PASS light muted-foreground / dashboard-shell-elevated: 5.90:1 (minimum 4.5:1)
PASS light foreground / dashboard-sidebar: 14.02:1 (minimum 4.5:1)
PASS light muted-foreground / dashboard-sidebar: 5.90:1 (minimum 4.5:1)
PASS light foreground / dashboard-sidebar-elevated: 14.02:1 (minimum 4.5:1)
PASS light muted-foreground / dashboard-sidebar-elevated: 5.90:1 (minimum 4.5:1)
PASS light foreground / dashboard-surface: 16.23:1 (minimum 4.5:1)
PASS light muted-foreground / dashboard-surface: 6.83:1 (minimum 4.5:1)
PASS light foreground / dashboard-surface-muted: 14.02:1 (minimum 4.5:1)
PASS light muted-foreground / dashboard-surface-muted: 5.90:1 (minimum 4.5:1)
PASS light foreground / dashboard-surface-strong: 14.19:1 (minimum 4.5:1)
PASS light muted-foreground / dashboard-surface-strong: 5.97:1 (minimum 4.5:1)
PASS light foreground / dashboard-hero: 14.19:1 (minimum 4.5:1)
PASS light muted-foreground / dashboard-hero: 5.97:1 (minimum 4.5:1)
PASS light foreground / dashboard-field-background: 16.23:1 (minimum 4.5:1)
PASS light muted-foreground / dashboard-field-background: 6.83:1 (minimum 4.5:1)
PASS light dashboard-nav-foreground / dashboard-sidebar: 5.90:1 (minimum 4.5:1)
PASS light dashboard-nav-foreground-strong / dashboard-sidebar: 14.02:1 (minimum 4.5:1)
PASS light dashboard-nav-foreground / dashboard-nav-hover-surface: 5.97:1 (minimum 4.5:1)
PASS light dashboard-nav-foreground-strong / dashboard-nav-hover-surface: 14.19:1 (minimum 4.5:1)
PASS light dashboard-nav-foreground / dashboard-nav-active-surface: 5.97:1 (minimum 4.5:1)
PASS light dashboard-nav-foreground-strong / dashboard-nav-active-surface: 14.19:1 (minimum 4.5:1)
PASS light panel-foreground / panel-surface: 14.02:1 (minimum 4.5:1)
PASS light panel-muted-foreground / panel-surface: 5.90:1 (minimum 4.5:1)
PASS light panel-foreground / panel-surface-subtle: 14.02:1 (minimum 4.5:1)
PASS light panel-muted-foreground / panel-surface-subtle: 5.90:1 (minimum 4.5:1)
PASS light panel-foreground / panel-shell-background: 15.16:1 (minimum 4.5:1)
PASS light panel-muted-foreground / panel-shell-background: 6.37:1 (minimum 4.5:1)
PASS light panel-foreground / panel-field-background: 16.23:1 (minimum 4.5:1)
PASS light panel-muted-foreground / panel-field-background: 6.83:1 (minimum 4.5:1)
PASS light primary-foreground / primary-hover: 8.13:1 (minimum 4.5:1)
PASS light destructive-foreground / destructive-hover: 9.28:1 (minimum 4.5:1)
PASS light success-foreground / success-hover: 14.19:1 (minimum 4.5:1)
PASS light warning-foreground / warning-hover: 11.66:1 (minimum 4.5:1)
PASS light accent-foreground / accent-hover: 14.19:1 (minimum 4.5:1)
PASS light primary / background: 5.45:1 (minimum 4.5:1)
PASS light primary / card: 5.83:1 (minimum 4.5:1)
PASS light primary / muted: 5.04:1 (minimum 4.5:1)
PASS light primary / primary-soft: 5.04:1 (minimum 4.5:1)
PASS light primary / primary-soft-hover: 5.04:1 (minimum 4.5:1)
PASS light success-text / background: 15.16:1 (minimum 4.5:1)
PASS light success-text / card: 16.23:1 (minimum 4.5:1)
PASS light success-text / muted: 14.02:1 (minimum 4.5:1)
PASS light warning-text / background: 15.16:1 (minimum 4.5:1)
PASS light warning-text / card: 16.23:1 (minimum 4.5:1)
PASS light warning-text / muted: 14.02:1 (minimum 4.5:1)
PASS light destructive-text / background: 15.16:1 (minimum 4.5:1)
PASS light destructive-text / card: 16.23:1 (minimum 4.5:1)
PASS light destructive-text / muted: 14.02:1 (minimum 4.5:1)
PASS light destructive-text / destructive-soft: 9.28:1 (minimum 4.5:1)
PASS light destructive-text / destructive-soft-hover: 9.28:1 (minimum 4.5:1)
PASS light success-text/80 / card: 8.54:1 (minimum 4.5:1)
PASS light success-text/90 / card: 12.05:1 (minimum 4.5:1)
PASS light ring / background: 5.45:1 (minimum 3:1)
PASS light field-border-invalid / background: 5.45:1 (minimum 3:1)
PASS light ring / card: 5.83:1 (minimum 3:1)
PASS light field-border-invalid / card: 5.83:1 (minimum 3:1)
PASS light ring / field-background: 5.83:1 (minimum 3:1)
PASS light field-border-invalid / field-background: 5.83:1 (minimum 3:1)
PASS light ring / dashboard-field-background: 5.83:1 (minimum 3:1)
PASS light field-border-invalid / dashboard-field-background: 5.83:1 (minimum 3:1)
PASS light ring / public-hero: 5.10:1 (minimum 3:1)
PASS light field-border-invalid / public-hero: 5.10:1 (minimum 3:1)
PASS light ring / dashboard-hero: 5.10:1 (minimum 3:1)
PASS light field-border-invalid / dashboard-hero: 5.10:1 (minimum 3:1)
PASS dark card-foreground / card: 13.55:1 (minimum 4.5:1)
PASS dark popover-foreground / popover: 16.23:1 (minimum 4.5:1)
PASS dark primary-foreground / primary: 8.20:1 (minimum 4.5:1)
PASS dark secondary-foreground / secondary: 13.55:1 (minimum 4.5:1)
PASS dark muted-foreground / muted: 8.07:1 (minimum 4.5:1)
PASS dark accent-foreground / accent: 12.80:1 (minimum 4.5:1)
PASS dark destructive-foreground / destructive: 9.28:1 (minimum 4.5:1)
PASS dark success-foreground / success: 12.80:1 (minimum 4.5:1)
PASS dark warning-foreground / warning: 11.66:1 (minimum 4.5:1)
PASS dark info-foreground / info: 8.20:1 (minimum 4.5:1)
PASS dark surface-foreground / surface: 13.55:1 (minimum 4.5:1)
PASS dark overlay-foreground / overlay: 16.23:1 (minimum 4.5:1)
PASS dark danger-foreground / danger: 9.28:1 (minimum 4.5:1)
PASS dark foreground / background: 16.23:1 (minimum 4.5:1)
PASS dark foreground / background: 16.23:1 (minimum 4.5:1)
PASS dark muted-foreground / background: 9.68:1 (minimum 4.5:1)
PASS dark foreground / card: 13.55:1 (minimum 4.5:1)
PASS dark muted-foreground / card: 8.07:1 (minimum 4.5:1)
PASS dark foreground / field-background: 13.55:1 (minimum 4.5:1)
PASS dark muted-foreground / field-background: 8.07:1 (minimum 4.5:1)
PASS dark foreground / surface-secondary: 13.55:1 (minimum 4.5:1)
PASS dark muted-foreground / surface-secondary: 8.07:1 (minimum 4.5:1)
PASS dark foreground / surface-tertiary: 10.55:1 (minimum 4.5:1)
PASS dark muted-foreground / surface-tertiary: 6.29:1 (minimum 4.5:1)
PASS dark foreground / public-shell-background: 16.23:1 (minimum 4.5:1)
PASS dark muted-foreground / public-shell-background: 9.68:1 (minimum 4.5:1)
PASS dark foreground / public-shell-elevated: 13.55:1 (minimum 4.5:1)
PASS dark muted-foreground / public-shell-elevated: 8.07:1 (minimum 4.5:1)
PASS dark foreground / public-card: 13.55:1 (minimum 4.5:1)
PASS dark muted-foreground / public-card: 8.07:1 (minimum 4.5:1)
PASS dark foreground / public-card-subtle: 13.55:1 (minimum 4.5:1)
PASS dark muted-foreground / public-card-subtle: 8.07:1 (minimum 4.5:1)
PASS dark foreground / public-card-strong: 10.55:1 (minimum 4.5:1)
PASS dark muted-foreground / public-card-strong: 6.29:1 (minimum 4.5:1)
PASS dark foreground / public-band: 13.55:1 (minimum 4.5:1)
PASS dark muted-foreground / public-band: 8.07:1 (minimum 4.5:1)
PASS dark foreground / public-hero: 10.55:1 (minimum 4.5:1)
PASS dark muted-foreground / public-hero: 6.29:1 (minimum 4.5:1)
PASS dark foreground / public-cta: 10.55:1 (minimum 4.5:1)
PASS dark muted-foreground / public-cta: 6.29:1 (minimum 4.5:1)
PASS dark foreground / dashboard-shell: 16.23:1 (minimum 4.5:1)
PASS dark muted-foreground / dashboard-shell: 9.68:1 (minimum 4.5:1)
PASS dark foreground / dashboard-shell-elevated: 13.55:1 (minimum 4.5:1)
PASS dark muted-foreground / dashboard-shell-elevated: 8.07:1 (minimum 4.5:1)
PASS dark foreground / dashboard-sidebar: 13.55:1 (minimum 4.5:1)
PASS dark muted-foreground / dashboard-sidebar: 8.07:1 (minimum 4.5:1)
PASS dark foreground / dashboard-sidebar-elevated: 13.55:1 (minimum 4.5:1)
PASS dark muted-foreground / dashboard-sidebar-elevated: 8.07:1 (minimum 4.5:1)
PASS dark foreground / dashboard-surface: 13.55:1 (minimum 4.5:1)
PASS dark muted-foreground / dashboard-surface: 8.07:1 (minimum 4.5:1)
PASS dark foreground / dashboard-surface-muted: 13.55:1 (minimum 4.5:1)
PASS dark muted-foreground / dashboard-surface-muted: 8.07:1 (minimum 4.5:1)
PASS dark foreground / dashboard-surface-strong: 10.55:1 (minimum 4.5:1)
PASS dark muted-foreground / dashboard-surface-strong: 6.29:1 (minimum 4.5:1)
PASS dark foreground / dashboard-hero: 10.55:1 (minimum 4.5:1)
PASS dark muted-foreground / dashboard-hero: 6.29:1 (minimum 4.5:1)
PASS dark foreground / dashboard-field-background: 13.55:1 (minimum 4.5:1)
PASS dark muted-foreground / dashboard-field-background: 8.07:1 (minimum 4.5:1)
PASS dark dashboard-nav-foreground / dashboard-sidebar: 8.07:1 (minimum 4.5:1)
PASS dark dashboard-nav-foreground-strong / dashboard-sidebar: 13.55:1 (minimum 4.5:1)
PASS dark dashboard-nav-foreground / dashboard-nav-hover-surface: 6.29:1 (minimum 4.5:1)
PASS dark dashboard-nav-foreground-strong / dashboard-nav-hover-surface: 10.55:1 (minimum 4.5:1)
PASS dark dashboard-nav-foreground / dashboard-nav-active-surface: 6.29:1 (minimum 4.5:1)
PASS dark dashboard-nav-foreground-strong / dashboard-nav-active-surface: 10.55:1 (minimum 4.5:1)
PASS dark panel-foreground / panel-surface: 13.55:1 (minimum 4.5:1)
PASS dark panel-muted-foreground / panel-surface: 8.07:1 (minimum 4.5:1)
PASS dark panel-foreground / panel-surface-subtle: 13.55:1 (minimum 4.5:1)
PASS dark panel-muted-foreground / panel-surface-subtle: 8.07:1 (minimum 4.5:1)
PASS dark panel-foreground / panel-shell-background: 16.23:1 (minimum 4.5:1)
PASS dark panel-muted-foreground / panel-shell-background: 9.68:1 (minimum 4.5:1)
PASS dark panel-foreground / panel-field-background: 13.55:1 (minimum 4.5:1)
PASS dark panel-muted-foreground / panel-field-background: 8.07:1 (minimum 4.5:1)
PASS dark primary-foreground / primary-hover: 14.02:1 (minimum 4.5:1)
PASS dark destructive-foreground / destructive-hover: 9.28:1 (minimum 4.5:1)
PASS dark success-foreground / success-hover: 14.19:1 (minimum 4.5:1)
PASS dark warning-foreground / warning-hover: 11.66:1 (minimum 4.5:1)
PASS dark accent-foreground / accent-hover: 14.19:1 (minimum 4.5:1)
PASS dark primary / background: 8.20:1 (minimum 4.5:1)
PASS dark primary / card: 6.84:1 (minimum 4.5:1)
PASS dark primary / muted: 6.84:1 (minimum 4.5:1)
PASS dark primary / primary-soft: 5.33:1 (minimum 4.5:1)
PASS dark primary / primary-soft-hover: 5.33:1 (minimum 4.5:1)
PASS dark success-text / background: 12.80:1 (minimum 4.5:1)
PASS dark success-text / card: 10.68:1 (minimum 4.5:1)
PASS dark success-text / muted: 10.68:1 (minimum 4.5:1)
PASS dark warning-text / background: 11.66:1 (minimum 4.5:1)
PASS dark warning-text / card: 9.73:1 (minimum 4.5:1)
PASS dark warning-text / muted: 9.73:1 (minimum 4.5:1)
PASS dark destructive-text / background: 9.28:1 (minimum 4.5:1)
PASS dark destructive-text / card: 7.74:1 (minimum 4.5:1)
PASS dark destructive-text / muted: 7.74:1 (minimum 4.5:1)
PASS dark destructive-text / destructive-soft: 6.03:1 (minimum 4.5:1)
PASS dark destructive-text / destructive-soft-hover: 6.03:1 (minimum 4.5:1)
PASS dark success-text/80 / card: 7.42:1 (minimum 4.5:1)
PASS dark success-text/90 / card: 8.96:1 (minimum 4.5:1)
PASS dark ring / background: 8.20:1 (minimum 3:1)
PASS dark field-border-invalid / background: 8.20:1 (minimum 3:1)
PASS dark ring / card: 6.84:1 (minimum 3:1)
PASS dark field-border-invalid / card: 6.84:1 (minimum 3:1)
PASS dark ring / field-background: 6.84:1 (minimum 3:1)
PASS dark field-border-invalid / field-background: 6.84:1 (minimum 3:1)
PASS dark ring / dashboard-field-background: 6.84:1 (minimum 3:1)
PASS dark field-border-invalid / dashboard-field-background: 6.84:1 (minimum 3:1)
PASS dark ring / public-hero: 5.33:1 (minimum 3:1)
PASS dark field-border-invalid / public-hero: 5.33:1 (minimum 3:1)
PASS dark ring / dashboard-hero: 5.33:1 (minimum 3:1)
PASS dark field-border-invalid / dashboard-hero: 5.33:1 (minimum 3:1)

Brand contrast: 214/214 checks passed.
```
