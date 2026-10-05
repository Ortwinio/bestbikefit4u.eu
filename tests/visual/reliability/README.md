# Reliability visual and SEO check

After the offline production build, run `node /Users/ortwinverreck/Developer/bikefitboost-reliability/tests/visual/reliability/run-local.mjs`. This starts a temporary HTTPS server on loopback port 3214 and stops it afterwards. A throwaway certificate is trusted only by the child process through `NODE_EXTRA_CA_CERTS`, then removed. The runtime Convex URLs point to loopback port 9, not a production service.

To use an existing local HTTPS server, run `capture.mjs` with its origin as the argument and provide its certificate via `NODE_EXTRA_CA_CERTS`. Plain HTTP is unsuitable for the production middleware's HTTPS rewrite.

The harness uses the real saddle-height page, production components, header/footer and CSS. It does not create accounts, submit a handoff, call production services or send mail. Browser requests outside the local origin are blocked. Screenshots and JSON findings are written only to the ignored `plans/reliability/renders/` folder.

Necessary-only cookie consent is preloaded to keep the cookie banner from obscuring the first-screen layout. Browser `ERR_FAILED` resource errors caused by explicitly blocked external requests are excluded; application console errors and hydration/page errors are not excluded.

The two local Vercel analytics script endpoints are fulfilled with empty JavaScript because `next start` does not serve them. The exact CSP error for the intentionally disabled Convex WebSocket at `ws://127.0.0.1:9/api/` is recorded separately as an offline limitation, not an application error. No other CSP errors are excluded.

Coverage: Dutch and English, 1440×1000 and 390×844, height-only and measured Quick Fix, full calculator without inseam, normal inseam, check warning and confirmation, large warning and override, account handoff link, mobile overflow, browser errors and axe serious/critical findings. SEO checks inspect server HTML for head metadata, canonical/hreflang and structured data.

This checks the visible handoff CTA and local transfer state, not authentication or persisted account values; those remain covered by the handoff unit/contract tests. Rendering the design board is a comparison aid, not an app accessibility gate.
