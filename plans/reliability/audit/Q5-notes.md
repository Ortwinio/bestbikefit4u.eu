# Q5 — homepage widget integration QA

Status: preparing sweep cases; waiting for B's DONE Q4 before combined execution.

Planned scope: existing36 saddle/Quick Fix cases plus12 homepage default/changed-height/CTA-landing cases (NL/EN1440/390). Verify above-fold widget, shared result, keyboard/axe, localized full calculator landing, height prefill and active inseam step. Full combined gates follow Q4 freeze. No commits, deployments, production/environment changes or mails; logs/renders remain ignored.

Preparation complete: `tests/visual/reliability/run-local.mjs --home` forwards the homepage matrix to the existing local-TLS sweep; Q5 output names preserve Q3 evidence. New home helper derives expected outputs from the shared model (175cm726±45,190cm789±49), checks above-fold controls/range/CTA, clicks the actual CTA and verifies locale/full-mode/prefill/inseam focus. Pre-navigation layout-shift diagnostics are recorded separately from screenshots. Two harness tests and scoped ESLint pass. No Q5 production build, browser sweep or combined gates have been run yet; explicitly waiting for DONE Q4.
