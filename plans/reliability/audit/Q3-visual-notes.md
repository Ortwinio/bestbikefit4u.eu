# Q3 visual and SEO review — 5 October 2026

- Passed 36 real-page production-browser scenarios: NL/EN × 1440×1000 / 390×844 × Quick Fix height-only / inseam and full height-only / normal inseam / check / confirmed / large / override / handoff.
- Every scenario: no horizontal overflow, no axe violations at any severity, no application console errors or page/hydration errors. Values reproduce 190 cm → 789 mm / 740–840 mm and 89 cm → 786 mm / 765–810 mm. Large override retains a dashed bar.
- Confirmed locale-prefixed handoff CTA and measured inseam 89 cm plus height 190 cm in session-only handoff storage. Did not authenticate, submit forms to a backend or test persisted account values.
- Server HTML checks pass for both locales: title/description/social description in head, canonical and NL/EN alternates, FAQ/HowTo/calculator WebPage JSON-LD, no obsolete baseline-band or flexibility-input instructions.
- Full desktop layout matches `Main.dc.html` source: two measurement cards left, advice/range and account refinement right, lime interval with ink marker, one next-step row and collapsible explanations. Board runtime cannot render standalone because its referenced `support.js` is absent; comparison uses authoritative HTML design source, not a fabricated board render.
- Inspected NL/EN mobile Quick Fix viewport renders at 390 px: height, advice, interval and optional inseam fit before practical instructions. A separate local-browser measurement with the default example hint still visible gave optional button bottom 718.31 px and practical section top 742.31 px in both locales, under 844 px. This stricter check is now also in the sweep script.
- Scoped ESLint and the SEO harness regression test pass. The regression test rejects stale band copy, missing description/canonical/hreflang and missing HowTo schema.

## Explicit offline scope

Used the real `.next` production build and the existing local TLS server. Convex URLs target loopback port 9. External browser requests are blocked. Necessary-only consent is preloaded; two Vercel analytics script endpoints are served as empty JavaScript to avoid local-only 404/MIME diagnostics. Exactly 36 expected CSP errors for disabled `ws://127.0.0.1:9/api/` are recorded separately, one per scenario. No other CSP, application or hydration errors are excluded. No real service, mail or production calls.

Local evidence is ignored: `plans/reliability/renders/Q3-visual.json`, 36 full-page PNGs and 8 viewport PNGs. No logs or renders belong in the commit/file list.

Reproduce after the offline production build with `node /Users/ortwinverreck/Developer/bikefitboost-reliability/tests/visual/reliability/run-local.mjs`. The runner owns and tears down its temporary HTTPS server and certificate.
