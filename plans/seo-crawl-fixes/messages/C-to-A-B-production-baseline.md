# Production baseline captured
audit/crawl-prod-baseline.json and .md: 224 sitemap URLs, 1145 page/UA checks.
Both exact 404 targets reproduced: /nl/bike-fitting and /en/bikefitting (10 inlink findings across5 UAs).
191 title/description/canonical/hreflang-outside-head instances each; UA title counts:
Googlebot35, ScreamingFrog24, GPTBot32, ClaudeBot34, Chrome66. Live timing/cache varies.
15 login hreflang findings,10 missing preferences canonicals,10 missing locale alternate findings.
Three page checks timed out; report separates those from actual404.
Local HTTPS renders all linked guide leaves, but Next derives localhost initial URL unless custom production
hostname is explicit, so preview X-Robots produces expected false indexability failures. Adjusting local
server hostname (not app source and not stripping robots) to exercise real production-host policy.
