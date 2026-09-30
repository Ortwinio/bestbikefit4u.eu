# 15 — Phase 6a: code foundation (tokens, fonts, brand assets)

**This is app code.** Read `README.md`, `reference/brand.md` and `BOARD-RULES.md` first. Work on branch `redesign/canvas` in the repo (no new branch), and **don't commit**: the lead reviews the diff and commits.

## Goal
Put the lime/petrol brand into the app's foundation, so every existing page switches style at once without breaking anything. No page layouts in this step.

## Tasks
1. **Tokens** — `src/app/globals.css` (Tailwind v4, semantic oklch tokens): map the existing semantic tokens to the brand palette from `reference/brand.md`. Proposal: `background` = paper `#F5F8F3`, `foreground`/`card-foreground` = ink `#0F2420`, `card` = white, `primary` = petrol `#0A7263` (+ `primary-foreground` white, hover `#075A4E`), `accent` = lime `#CFF26A` (+ `accent-foreground` = ink), `secondary`/`muted` = petrol-soft `#E1F2EE`, `muted-foreground` = `#4A5F5A`, `border`/`input` = `#DCE6E1`, `ring` = `#9CC21F`, `success` = lime + ink text, `warning` = `#FFD66B`, `destructive` = `#FFB199` background with an ink-dark text variant (check contrast!). Convert the hex values to the oklch notation the file uses. **Dark mode**: the file has dark tokens. Design them analogously (ink as the ground, lime accent, petrol lightened for AA). Also add brand tokens (`--bbf-*` from brand.md) for direct use.
2. **Contrast check**: write `scripts/check-brand-contrast.mjs`, which calculates the WCAG contrast for every foreground/background token pair (light and dark) and fails below 4.5:1 (3:1 for large text/UI). Add it to `npm run lint` as `lint:contrast`.
3. **Fonts** — via `next/font/google`: Bricolage Grotesque (600/700/800, display), Figtree (400–700, body), DM Mono (500, numbers) as CSS variables (`--font-display`, `--font-body`, `--font-mono`) in the root layout(s). Make them available as Tailwind `font-display`, `font-sans` and `font-mono`. Headings (`h1`–`h3`) use the display font by default.
4. **Brand assets** — `src/config/brand.ts`: point `assets` to `public/brand/` (`logo-horizontaal.svg`, `logo-horizontaal-negatief.svg`, `beeldmerk.svg`, the app icon). Replace `src/app/icon.png` and `src/app/favicon.ico` with the versions from `public/brand/favicon/` (+ `apple-icon.png` = apple-touch-icon). `src/app/manifest.ts`: `theme_color` `#0F2420`, `background_color` `#F5F8F3`, and icons from `public/brand/favicon/` (192/512/maskable). The OG image default → `public/brand/social/og-image-1200x630.png` wherever the default OG image is set.
5. **Logo component**: find where the logo is rendered (header, footer, sidebar, emails, PDF) and make it use `BRAND.assets` with the correct variant (negatief on dark). Leave emails/PDF alone if they need a separate pipeline; note it.

## Done when
- `npm run typecheck`, `npm run lint` (including the new `lint:contrast`) and `npm run test:unit` pass. `npm run build` passes, or you document exactly which env variable is missing (don't invent secrets).
- A visual check: start `npm run dev:frontend` and take screenshots (headless) of `/nl`, `/nl/calculators/saddle-height`, `/nl/pricing` and `/nl/login`. Save them to `plans/redesign-canvas/code-renders/15-*.png`. The pages still work and look like the old layout in the new colors and fonts.
- `plans/redesign-canvas/audit/15-notes.md`: the token mapping table (old → new), contrast results, changed files, and anything you deliberately left alone.

Print `DONE 15`.
