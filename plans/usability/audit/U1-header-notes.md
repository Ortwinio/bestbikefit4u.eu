# U1 mobile header

Implemented against `usability-advies-v2.md` rules 5 and 15 and the 64 px header in `canvas/project/m/Home.dc.html`.

- Shared marketing header uses one 63 px row plus its 1 px border below 1280 px: logo, login or accessible dashboard avatar, and a 44 × 44 menu trigger.
- Language selection moves inside the mobile menu. Both calculator routes expose all eleven localized calculator links, including the correct NL/EN tyre-pressure route. Existing account links and sign-out remain in the menu.
- Approved configurator pages use the shared header on mobile; their existing calculator header/tab bar remains on desktop. Desktop marketing navigation is preserved.
- Cookie consent moves from the mobile top edge to the bottom, caps its height below the header, and sits below the navigation dialog. Its buttons and privacy link have minimum 44 px height.
- Existing theme tokens, dark logo, localized links, auth actions, and locale-switch behavior are retained. No homepage dictionary, account layout, environment, production, or backend changes.

## Markers for the guard

`data-usability="site-header"` marks actual header elements. On configurator pages, filter visible elements because mobile/desktop headers are responsive siblings. `data-usability="mobile-header"` marks the shared header row, `data-usability="menu-trigger"` its button, and `data-usability="cookie-banner"` the consent wrapper. Measure the outer header for the full 64 px including its border.

## Validation

- Scoped ESLint passes for all seven changed/added TypeScript files.
- Focused Vitest: 5 files, 17 tests pass (`HeaderMobileMenu`, `ConfiguratorHeaderSwitch`, `HeaderAuthActions`, cookie consent core/browser tests).
- The new menu test exercises the real dialog open/close interaction in both languages, the two route groups (5 + 6 links), localized pressure URLs, language availability, and login/dashboard access.
- Final browser geometry, contrast, screenshots, responsive desktop comparison, and the combined usability guard remain with U1 owner. No build was started by this subtask.

## Files

- `src/components/layout/Header.tsx`
- `src/components/layout/HeaderMobileMenu.tsx`
- `src/components/layout/HeaderMobileMenu.test.tsx`
- `src/components/layout/MarketingNavigation.tsx`
- `src/components/layout/ConfiguratorHeaderSwitch.tsx`
- `src/components/layout/ConfiguratorHeaderSwitch.test.tsx`
- `src/components/layout/CookieConsentBanner.tsx`
- `plans/usability/audit/U1-header-notes.md`

## Guard follow-up: login and skip link

The first owner-run browser guard passed the homepage header geometry (64 px header / 44 px trigger) and found no shared header on mobile login. Added the same Header to the auth layout below its existing `lg` desktop breakpoint. Removed the duplicate mobile presentation logo, hid the handoff-panel logo on mobile, and adjusted mobile viewport minimum heights to account for the header. Desktop login panels remain unchanged. The root keyboard skip link now has minimum 44 px width and height.

Additional files: `src/app/(auth)/layout.tsx`, `src/app/(auth)/login/page.test.tsx`, `src/app/layout.tsx`, `src/components/account/LoginPresentation.tsx`, and `src/components/account/LoginHandoffPanel.tsx`.

Follow-up validation: login plus header tests pass (3 files / 46 tests); scoped ESLint passes all five additional files. Browser verification awaits the next owner build.
