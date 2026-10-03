# S11 — answer-first calculator content

All eleven public calculators now render a bilingual answer section immediately after the form: a direct answer, plain-language method, limits, a worked example with explicit inputs and engine-generated results, and common mistakes. The shared section renders on the server, including without JavaScript. It uses existing tokens and layout patterns; calculator behavior is unchanged.

Examples call the same public engines/adapters as their forms: fit adapters for bike fit, saddle height, frame size and crank length; saddle-width, public gearing and basic-pressure engines; and performance functions for speed, climbing, FTP and hydration. No result is transcribed into the dictionary. Inputs are explicitly illustrative and do not represent user/account data. Frame sizing copy accurately explains that its current size table uses height/category, while inseam affects the separate saddle estimate. Hydration copy distinguishes its heuristic position from a sweat measurement.

FAQPage schema is added where missing and shares the visible questions and answers. The gearing page now displays its existing schema questions. Pressure shares one FAQ getter. There is one FAQPage per calculator, with NL/EN coverage.

Validation: 76 focused S10/S11 tests pass, full typecheck and lint pass. A production build passes. The five-user-agent local sitemap crawl passes 1,145 page/agent checks with no findings. Final raw HTML checks pass all 22 routes: one answer section, one FAQPage with all questions and answers visible. Each section adds 125–176 readable words. Structural text/HTML density improves in all 22 comparisons against the same DOM with the answer section removed; this is explicitly not an independent historic capture. See `S11-raw-html.json`. Runtime browser data is offline; no account/production data was read or written.

No commit or deploy. The after performance build contains both S10 and S11 changes, so metric differences are not attributed to either change alone.
