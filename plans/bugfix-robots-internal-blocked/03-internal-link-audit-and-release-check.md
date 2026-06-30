# Step 03 — Internal Link Audit And Release Check

## Goal

Reduce SEO crawler noise by finding public indexable pages that link to intentionally blocked URLs.

## Tasks

1. Crawl or statically inspect public pages for links to robots-blocked prefixes:
   - `/dashboard`
   - `/fit`
   - `/bikes`
   - `/profile`
   - `/settings`
   - `/feedback`
   - `/login`
   - localized variants
2. Categorize each link:
   - necessary user CTA
   - unnecessary crawl path
   - wrong public/private route target
3. For unnecessary crawl paths, remove the link, add `rel="nofollow"` only if deliberately appropriate, or point to an indexable public explainer page instead.
4. Re-run the SEO validator and a lightweight production robots check.
5. Write `plans/bugfix-robots-internal-blocked/output-03-release-check.md` with:
   - final robots output
   - changed files
   - validation results
   - remaining expected blocked URLs, if any

## Acceptance Criteria

- Public pages do not expose avoidable internal crawl paths to blocked app URLs.
- Any remaining links to blocked URLs are intentional product CTAs.
- The release note explains why remaining private/auth/API disallows are expected.
