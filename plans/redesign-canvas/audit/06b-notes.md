# 06b — Visual fixes

- Updated only the five assigned drafts and their local renders; no app code, publication or commit.
- PowerSpeed and ClimbPlanner now use the four fixed Meer pills above the eyebrow. Gearing has no sub-navigation. Rider-facing speed units are `km/u`.
- Advice, comparison and variation sentences use Figtree with numeric spans in DM Mono. Removed slider/statistics/developer jargon. CrankLength comparison badges and Gearing’s custom cassette label also use Figtree for words.
- ClimbPlanner now has a 560 × 200 SVG with petrol-soft fill, ink outline, start/finish markers, five distance ticks and a power/time label attached to the slope. The graphic stretches with length; its exaggerated rise increases with gradient. This is schematic display geometry, not a change to the approved physics.
- Both `check-board.mjs` and `check-runtime.mjs` pass without warnings for all five boards: Gearing 127 states, PowerSpeed 79, ClimbPlanner 52, CrankLength 43, SaddleWidth 73 — 374 states total.
- Additional assertions verify identical shared physics, 33.6230859375 km/u at 0%, 11.150859375 km/u at 7%, 26.9 min for 5 km at 7%, and Meer pill order/placement.
- Updated 12 PNGs in `../drafts/_renders/`: CrankLength default/refine; SaddleWidth default (measured)/estimated; Gearing default/expanded/one-by/invalid; PowerSpeed default/speed; ClimbPlanner default/alpine. Default filenames have no state suffix. All render at 1440 px wide within their fixed board heights; no target shorter than 44 px. Representative images visually reviewed, including profile ticks and task 04 expanded states.
- Renders use the same local static DC-value expansion and Playwright workflow as task 06, not the native canvas runtime. Native-canvas review remains with the lead.
- No open questions.
