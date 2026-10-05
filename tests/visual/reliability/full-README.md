# Full reliability release visual QA

Run only after F1/F2 source freeze and A's offline production build. This harness never builds, deploys, authenticates to a real backend or sends mail.

- `full-board-reference.mjs`: executes the 18 authoritative board scripts (including imported Calculator variants) in a local DCLogic shim; 34 default/interaction states. Writes ignored `F3-board-reference.json`. This is script reference evidence, not a canvas screenshot. Written model rules override documented board discrepancies.
- `full-run-local.mjs`: starts the existing real production app behind temporary loopback HTTPS, executes `full-public.mjs`, cleans up the server and certificate. Convex targets loopback port 9. External browser requests are blocked. Two local Vercel script endpoints are empty-script fixtures. Only exact disabled-backend CSP and deliberately blocked external-resource diagnostics are separated from application failures.
- Public sweep: 11 actual standalone calculator routes × NL/EN × 1440/390, plus saddle→frame/crank/bike-fit reuse, fresh-browser-context empty state, legacy persistent-store removal and desktop/mobile leave notice: 68 captures. Twelve uncertainty metrics do not imply twelve distinct routes. Tyre pressure is included without inventing an unsupported range.
- Touch contexts are used at 390 px. Desktop notice is opened by a synthetic top-edge mouseout, then checked for focus containment, Escape and once/session behavior. Touch notice is dismissed and must not reopen after another edit. Auth route excludes both notices.
- All screenshots, errors, axe findings and storage assertions are recorded under ignored `plans/reliability/renders/F3-*`. No serious/critical axe, overflow, application/page errors are permitted. Stored sample measurements never leave the local browser.

## Signed-in fixture integration still required

Do not claim full F3 completion from the public suite. Waiting for stable F1/F2 presentation/API contracts to cover:

1. Every calculator with authenticated profile prefills and visible “Uit je profiel” / “From your profile”; edit persists through the mocked profile mutation and a rerender, with no exit notice.
2. Account saddle: one vs three consistent measurements, >5 mm spread, provenance/date/breakdown, paid teaser only after eligible measurements.
3. Knee angle: 20° / 31° / 40°, maximum 5 mm adjustment, uncertainty narrows only in-window, seven-day evaluation and pain warning, access flag states.
4. Dashboard: actual A–D values with ranges, basis and one largest gain; unknown provenance is not replaced with invented dates.
5. Profile merge on signup: mocked authenticated handoff, measured beats declared, newer beats older, no silent measured-profile overwrite. Backend unit/contract tests remain the persistence authority.
6. PDF: C's real report generator with NL/EN fixture data, all six pages rendered and inspected against Rapport; 95% uncertainty/accuracy block and no drawn safety band. No artificial HTML report substitutes.

Required contracts: route/component exports and typed props or exact query response fixtures for B's account/knee/dashboard surfaces; C's report generator entry and fixture payload. A owns integration and final gates, this harness owns only clearly labelled local fixtures.
