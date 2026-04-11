# SEO Technical Content Remediation Plan

## Goal

Turn the issues reported in `docs/issues_overview_report.csv` into a code-aware, implementation-ready remediation plan for BestBikeFit4U.

## Scope

Included:
- public route inventory under `src/app/(public)`
- locale routing, canonical, alternate, robots, sitemap, and redirect behavior
- internal linking from shared navigation and public templates
- heading hierarchy in shared public components and representative page families
- backlog prioritization for engineering and content

Excluded:
- off-site SEO strategy
- backlink work
- editorial copy rewriting beyond structural/content-pattern recommendations
- infra settings outside the repo, except where they must be validated

## Deliverables

- route and indexing audit
- issue-by-issue SEO findings
- template and cluster-level root causes
- phased implementation plan
- developer-ready backlog
- validation checklist
- implemented P1/P2 remediation status

## Status

- `01-route-and-indexing-audit.md` complete
- `02-link-and-heading-remediation.md` complete
- `03-validation-and-rollout.md` complete
- `output-01-seo-audit-and-remediation-plan.md` complete
- `output-02-implemented-fixes-and-validation.md` complete

## Key Findings

1. The most actionable SEO problems are not missing metadata. They come from route duplication, parameterized internal links, and public links to robots-blocked app/login flows.
2. The `canonicalised` and `parameter` warnings are largely explained by `case-study?pain=` links and tire-pressure alias routes.
3. The `blocked by robots.txt` warning is real, but much of it is caused by intentional public links to login and protected app routes. That is a crawl-efficiency problem, not necessarily an indexing bug.
4. The `H2 non-sequential` warnings are likely shared-component semantics issues caused by `h3` card titles appearing before the first page-level `h2`.
5. The single `noindex` and `nofollow` warnings are not explained by any normal indexable public template. They are most likely a non-canonical/invalid dynamic URL or a non-production crawl artifact and must be confirmed with a URL-level export.

## Acceptance Criteria

- every report issue is mapped to likely code owners and route families
- template-level fixes are preferred over manual page edits
- critical fixes are prioritized by SEO impact, UX impact, and effort
- validation steps are specific enough to convert directly into QA and release checks
