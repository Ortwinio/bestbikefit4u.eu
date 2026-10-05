# F1 — models, backend and report reliability

Implemented shared uncertainty wrappers for the twelve documented metrics, plus FTP watts for the actual watts result. Existing engine centres remain unchanged, including the 787 mm report regression. Account status alone never narrows uncertainty: actual matching provenance is required. Continuous scales use the widest model range; frame/crank require actual size options. All 18 canvas scripts were executed as references. Written model widths take precedence over illustrative board values (speed, climb, cadence, hydration and default report C/D).

Shared inseam plausibility now drives engine validation, public calculator warnings, account warnings and saved provenance. Bounds are 55–105 cm. Repeats, tolerance and unresolved warnings persist and are frozen with session observations. Historical PDF evidence uses session snapshots; missing provenance remains declared. Account saddle advice adds the measured mean and explicit bike/goal/flex/core/climbing breakdown. Knee-angle advice uses the 25–35 degree window, 4 mm model sigma, approximately 2 mm per degree and maximum 5 mm adjustment steps.

Owned, authenticated Convex APIs store measurements and preferences, return actual dashboard A–D centres/ranges and the largest available improvement, and schedule evaluation seven days after a knee measurement. Retry IDs are idempotent, paid gating reuses existing access, and service-mail preferences/ownership/supersession are rechecked before delivery. No real provider call was made. Account/bike deletion removes the new data. Measurement series cannot revive after an unrelated profile edit. Invalid legacy measured values cannot contaminate a replacement measurement; aggregate warnings remain visible.

PDF page 1 has the accuracy block; page 3 has actual 95% ranges without drawing engine safety/test bands. Unsupported ranges remain blank. See F1-pdf-notes.md and F1-backend-notes.md for details. UI and cross-calculator reuse belong to B/F2 and A/F3.

## Verification

Final focused integration suite: 40 files, 456 tests passed (models, provenance, engine/public adapters, sessions, recommendations, deletion, mail and reports). Whole-tree typecheck, Convex tsc and complete npm run lint passed. Five additional frozen-session regressions passed (461 focused tests in total); defaults never become measured evidence, and later profile edits cannot mutate captured quality.

Four NL/EN baseline/full PDFs passed six-page A4/font/footer/copy verification; ten browser variants had zero overflow. The PDF subagent visually inspected summary and fit-value pages. Email previews cover 42 bilingual messages and 84 screenshots at 600/375 px; all image, layout and overflow checks pass. The backend subagent visually reviewed the new NL/EN evaluation mail. Artifacts remain ignored under plans/reliability/renders and are excluded from the manifest.

A owns the final combined build, complete unit/contracts, crawl and UI/axe gates. F1 did not start a competing build. No commits, deploys, production changes, environment edits or real mails.
