# S9 — bike-fitting topic ownership

Completed 3 October 2026. No commit or deployment.

Decision recorded before implementation: retain `/en/bike-fitting` and `/nl/bikefitting`. They were already the dedicated reciprocal topic pages; `/nl/fiets-afstellen` competed with them. The choice follows the existing architecture and creates no new topic URL.

Both locale variants of `/fiets-afstellen`, plus the opposite-locale bike-fitting aliases, now redirect directly with explicit 301 to the canonical locale page. Unprefixed setup requests resolve directly using the preferred locale. The retired setup page is removed from sitemap discovery and marked non-indexable by route policy; the old component remains behind the redirect. Locale switching and metadata helpers resolve its canonical pair consistently.

Descriptive shared footer links and contextual links on all 48 rewritten guides per locale point directly to the canonical pages. Home/pain inbound links no longer point to the retired setup URL. Existing header links are retained. `audit/S9-internal-links.json` enumerates the guide source URLs; runtime validation fetches six distinct source guides per locale and confirms their rendered links.

Validation: 105 focused tests pass, including locale/proxy, sitemap/policy, home, footer, guide-link and editorial metadata regressions. Full typecheck, lint and production build pass. `scripts/seo-discovery-check.mjs` confirms four aliases give direct 301, canonical destinations 200, exactly one title/description/canonical in head, reciprocal hreflang and at least five distinct source pages per locale. `audit/S8-S9-runtime.json` has zero failures. The local five-user-agent crawl passes all 875 checks, no metadata/404/hreflang failures (`plans/seo-crawl-fixes/audit/crawl-s8-s9.md`).
