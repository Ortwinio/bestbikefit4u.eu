# Mobile Lighthouse baseline

Build production first (`npm run build`). Keep `.next` unchanged during collection.
`node scripts/performance/local.mjs --label=before` starts a temporary HTTPS production server on 3197,
collects three mobile samples of six templates, asserts strict median budgets and stops the server.
After rebuilding the changes, run `--label=after`, then `node scripts/performance/compare.mjs`.
Alternatively run `run.mjs --base=http://localhost:<port> --label=before` against an existing local server.
The Next middleware in this project needs HTTPS to avoid loopback rewrite redirects; prefer `local.mjs`.

`CHROME_PATH` overrides automatic discovery of the validated Chromium 140 in the Playwright cache.
Without that browser, the harness fails with setup guidance instead of silently collecting invalid results. Use the SAME executable for both runs.
Lighthouse 12.6.1 encountered NO_FCP with cached Chromium 145 during the initial S10 check despite the
page painting in Playwright. Cached Chromium 140 (Playwright chromium-1187) completed collection.
This is a local collector compatibility limitation, not a measured site regression. Raw LHR includes
browser/Lighthouse versions. Temporary TLS certificates are trusted by the local Node process only;
Chrome's certificate exception applies only to this local test server, never a production run.

Reports are written to `plans/seo-semrush/audit/S10-<label>/` (compact Lighthouse evidence JSON, logs, summary and follow-up tickets).
Full raw reports, including screenshot data, stay in the operating-system temp folder `bbf-s10-raw-<label>/`.
Missing samples/navigation errors fail the gate; unavailable numbers are never reported as zero.
Exit code 1 can mean a budget failure after successful collection; inspect `summary.json`.
These simulated mobile lab numbers are not real-user Core Web Vitals. Speed Insights requires deployed
traffic and is a separate observation source. Cookie choices are not automatically accepted.
