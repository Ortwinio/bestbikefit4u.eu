# Crawl: rebrand

- Base: https://127.0.0.1:64811
- UTC: 2026-10-03T21:18:53.836Z → 2026-10-03T21:18:55.664Z
- 0 sitemap URLs; 25 page/UA checks; 66 sequential GET requests.
- Five raw-HTML user agents; no JavaScript; 0 ms minimum delay between requests.
- Result: FAIL; 29 findings.
- Offline Convex fallback: repository guides render; live-only CMS/blog coverage is unavailable.

| Finding | Count |
| --- | ---: |
| invalid-sitemap-url | 4 |
| canonical-not-self | 25 |

## Examples
- Googlebot: https://www.bikefitboost.com/sitemap.xml — invalid-sitemap-url
- Googlebot: https://www.bikefitboost.com/sitemap.xml — invalid-sitemap-url
- Googlebot: https://www.bikefitboost.com/sitemap.xml — invalid-sitemap-url
- Googlebot: https://www.bikefitboost.com/sitemap.xml — invalid-sitemap-url
- Googlebot: https://www.bikefitboost.com/nl/login — canonical-not-self
- Googlebot: https://www.bikefitboost.com/en/login — canonical-not-self
- Googlebot: https://www.bikefitboost.com/nl/login?src=seo-crawl-check — canonical-not-self
- Googlebot: https://www.bikefitboost.com/nl/email-preferences — canonical-not-self
- Googlebot: https://www.bikefitboost.com/en/email-preferences — canonical-not-self
- Screaming Frog: https://www.bikefitboost.com/nl/login — canonical-not-self
- Screaming Frog: https://www.bikefitboost.com/en/login — canonical-not-self
- Screaming Frog: https://www.bikefitboost.com/nl/login?src=seo-crawl-check — canonical-not-self
- Screaming Frog: https://www.bikefitboost.com/nl/email-preferences — canonical-not-self
- Screaming Frog: https://www.bikefitboost.com/en/email-preferences — canonical-not-self
- GPTBot: https://www.bikefitboost.com/nl/login — canonical-not-self
- GPTBot: https://www.bikefitboost.com/en/login — canonical-not-self
- GPTBot: https://www.bikefitboost.com/nl/login?src=seo-crawl-check — canonical-not-self
- GPTBot: https://www.bikefitboost.com/nl/email-preferences — canonical-not-self
- GPTBot: https://www.bikefitboost.com/en/email-preferences — canonical-not-self
- ClaudeBot: https://www.bikefitboost.com/nl/login — canonical-not-self

Complete source offsets, metadata values, reciprocal pairs and inlinks are in the sibling JSON.
Links are HTML navigation anchors/areas; authenticated API/action links are listed but not requested.
