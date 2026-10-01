# 44 — Guides: audit against the writing guide, rewrite, new illustrations

Request (Ortwin, 2026-09-30): a writing guide for the guide pages (problem → background → concrete
bike-fitting tips → links to other guides), check every guide against it incl. SEO, rewrite the guides,
and replace images with more relevant illustrations made with our illustration skill.

Writing guide (binding): `plans/redesign-canvas/44-schrijfwijzer-gidsen.md`.
Illustration skill (read it fully, scripts are in its appendix):
`~/.claude/skills/synced/0c1abaed-2dd7-48aa-9c40-860558849b78_86c85444-dcee-46eb-ac3a-bd832bfd8388/bestbikefit4u-illustraties/SKILL.md`
(route B, draw from code; no web photos).

Where guides live: CMS in Convex (`convex/guides/*`, `api.guides.queries.getPublishedGuide`,
hero image `heroImagePublicPath`) with code fallbacks in `src/lib/guides/content/*.ts`,
`src/app/(public)/guides/data.ts`, `src/i18n/marketing/guideProse*`/`guideTitles`, backlog CSV.
~30 guides per locale incl. hub pages (`pain-and-discomfort`, `ride-types`, `rider-profiles`,
`setup-parameters`, `shoe-foot-cleat-fit`).

## 44a — Audit (Codex D, right after 40a; read-only, no content changes)

1. Establish the source of truth per guide in production: CMS record (published) or code fallback.
   Read production only through the public site/HTML and the code; do not write to any database.
2. Score every NL and EN guide against the checklist in section 6 of the writing guide: structure
   (problem/background/tips/links present and in order, word counts), tone (je-vorm, English leaks,
   hype, invented numbers), SEO (title length, description length, H1, keyword in H1/first 100 words/H2,
   internal links and anchor language, orphan guides with < 2 inbound links, duplicate titles or
   descriptions, structured data, hreflang/canonical, dateModified), image (present? relevant? alt NL/EN,
   size, format).
3. Output `audit/44a-guides-audit.md`: one row per guide with pass/fail per check and the top fixes, plus
   a proposed Dutch primary keyword per guide and a proposed illustration subject per guide; and
   `audit/44a-guides-audit.json` (machine-readable). Print **DONE 44a**.

## 44b — Rewrite + illustrations (after the lead reviews 44a; split over agents)

Per guide: rewrite NL first, then EN, exactly to the writing guide; keep the slug; update SEO fields,
FAQ, related links (NL titles on NL pages), structured data and dateModified; draw a new hero illustration
(16:10, WebP < 200 kB, `public/illustrations/guides/NN-onderwerp.webp`, alt NL/EN) that shows the guide's
subject. Content goes into the code content files **and** into a CMS import file
(`plans/redesign-canvas/guides-import/<slug>.json`) in the CMS schema. **Publishing to the production CMS
is a separate step that needs Ortwin's go**; no database writes by agents.

Acceptance per batch: every guide passes the checklist (rerun the 44a audit script), screenshots NL/EN
1440/390, the illustration reviewed next to the text, lint/typecheck/tests, `files-44b-<batch>.txt`.
