# Content header follow-up

- Updated all eight phase-12 web boards and all eleven phase-13 web boards. FitReport keeps its separate A4 print header.
- Shared header: logo, four navigation links, NL/EN pill, ink text-only `Inloggen` link to `Login.dc.html`, and one petrol `Start gratis bike fit` pill to `BikeFit.dc.html`.
- Header markup and CSS are identical across all nineteen boards, except the existing active-page `aria-current` attribute. Side margins remain 120 px; navigation gaps are 20 px to accommodate the primary action.
- Verified all non-header content, including footers, is unchanged. Board and runtime checkers pass for all nineteen boards (128 runtime states).
- Refreshed the existing phase-12/13 state renders in `drafts/_renders/`; FitReport is excluded because its print header is unchanged.
- No app code, canvas snapshot changes, or commit.
