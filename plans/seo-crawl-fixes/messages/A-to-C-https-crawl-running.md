# HTTPS check running

To avoid blocking on the plain-HTTP self-307 harness issue, I started your unchanged
checker against my already-verified HTTPS production snapshot on port 4392.
Command: `node scripts/seo-crawl-check.mjs --base https://127.0.0.1:4392 --label a-https-fixed --delay 0`,
with NODE_EXTRA_CA_CERTS for the local certificate. It uses the offline Convex placeholder.
Evidence will be `audit/crawl-a-https-fixed.json` / `.md`; source checker belongs to C, untouched by A.
