# S18 — CodeQL audit-tooling fixes

Replaced four full-URL substring assertions in S8-runtime.mjs with Markdown-link extraction, new URL() parsing, an exact trusted-origin comparison, and parsed pathname equality/prefix checks. Private/retired-route checks now also inspect parsed pathnames. No suppressions.

S5-home-capture.mjs now uses the existing sendFixtureError helper: diagnostics go to stderr and the browser receives a generic 500 (or generic 404 for ENOENT), never the exception text.

Validation: node plans/seo-semrush/audit/S8-runtime.mjs passes both GET/HEAD endpoint and URL checks; node plans/seo-semrush/audit/S5-home-capture.mjs after passes all four NL/EN 1440/390 cases with no overflow, runtime errors or broken images. Refreshed capture provenance is retained in S5-after-capture.json; PNGs remain ignored. Shared http-errors Vitest tests, full npm run lint and git diff --check pass. Hosted CodeQL itself was not rerun locally; its next PR run must confirm alert closure. No commit/deploy.
