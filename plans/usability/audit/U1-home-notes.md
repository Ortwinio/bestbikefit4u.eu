# U1 homepage implementation

Homepage portion only; combined U1 guard/build/visual review remains with U1 owner.

- Replaced the eight-card calculator list with Mijn houding (5) and Mijn rit (6), ordered as the advice and round-3 boards specify. Each calculator has a direct localized link; both routes have tracked start buttons. Hook: `data-usability="home-routes"`; route buttons: `data-usability="route-start"`, `data-route="posture|ride"`.
- Preserved the live saddle widget, shared reliability calculation, range bar, analytics and existing session/profile data handoff. Untouched 175 cm defaults now have an example chip and explanation, with grey values; actual/reused inputs have no example label.
- Combined the explanatory step content into three concise lines beside a closed native details block retaining report contents in server-rendered HTML. The separate open “Maak je volgende aanpassing bewust” section is removed; its useful existing copy remains in that same disclosure. Pricing explains report access. No new unsupported features or trust claims.
- Canvas/advice differences: kept the canvas's English slogan as H1 (marked `lang="en"`) despite backlog's Dutch-H1 request. Desktop Main's compact “Van meten naar je fitplan” supersedes the mobile board's long report list; retained that list inside details to meet the requested collapse and preserve content. The board's unsupported rider counts, testimonials and 180+ brands remain omitted under rule 14. Widget keeps the live default 175 cm and live calculation instead of copying board example measurements.

## Validation

- Focused homepage and widget regression suite: 13 tests; route destinations/order in NL and EN, report content present while collapsed, existing height sweep and session/profile provenance checks, example state and reuse checks.
- Scoped ESLint passed for the homepage, widget, dictionaries and tests.
- Follow-up removes the duplicate open trust explanation, retaining its three articles in the report disclosure. Tests require exactly three visible fit-plan lines and the trust heading inside the closed disclosure; no fabricated canvas testimonials are copied.
- No build, browser guard or deploy performed in this subtask; combined production guard remains required before U1 can be marked DONE.

## Files

- `src/app/(public)/page.tsx`
- `src/components/home/MarketingHome.module.css`
- `src/components/home/MarketingHome.test.tsx`
- `src/components/home/SaddleHeightTeaser.tsx`
- `src/components/home/SaddleHeightTeaser.test.tsx`
- `src/i18n/marketing/homeRoutes.ts`
- `src/i18n/marketing/homeSaddleWidget.ts`
- `plans/usability/audit/U1-home-notes.md`
