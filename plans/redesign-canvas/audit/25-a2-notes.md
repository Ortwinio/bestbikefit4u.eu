# 25a2 — Selected language contrast

Replaced both selected LanguageSwitch foreground classes with `text-primary-foreground`, paired with the existing `bg-primary`. The previous `text-[color:var(--primary-foreground)]` used an OKLCH channel tuple as a complete CSS color; the browser discarded it and inherited dark text. Tailwind's semantic token wraps the tuple correctly and resolves independently in light/dark. No token definitions, shared UI, dictionaries or other agents' files changed.

## Verification

- Requested production sweep: `node tests/visual/final-sweep/sweep.mjs --filter=/calculators,/bandenspanning,/tire-pressure-calculator --output=plans/redesign-canvas/code-renders/25a2-sweep --port=4336 --label=25a2-contrast`.
- 16 routes, 64 NL/EN × 1440/390 cases: **color-contrast 0; all axe checks 64/64 pass; mobile touch targets 32/32 pass**. The same routes had 40 of the original 44 contrast cases; the other four original cases were settings, outside the requested sweep filter.
- The sweep exits 1 only for four previously known React #418 cases: Dutch gearing and power-speed at both widths. No other check fails. Those findings belong to D/lead and remain unsuppressed.
- `node tests/visual/language-switch/check.mjs`: 24 selected-link checks across light/dark, NL/EN, 390/1440, and one route from each requested family. All pass axe color-contrast with no incomplete results, preserve 44px targets and select the expected locale. Evidence: `25-a2-themes.json`.
- 14 ConfiguratorHeaderSwitch regression tests pass, including both selected language branches. Targeted ESLint and `lint:contrast` (254/254 token pairs) pass.
- Source snapshot: `a85233c25f07ebce5d7a423a5773e3d770f871673d2311c02e779f18b319e2ce`.
- Full sweep reports/screenshots remain local under `code-renders/25a2-sweep`; portable summary: `25-a2-sweep.json`. No PNGs in the file list, no commit/push.
