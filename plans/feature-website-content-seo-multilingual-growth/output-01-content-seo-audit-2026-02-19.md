# Output 01: Content + SEO Audit (2026-02-19)

## Summary

bestbikefit4u.eu has a solid base (clear product narrative, EN/NL routing, metadata and alternates), but it under-leverages conversion messaging and has at least one critical technical SEO gap.

## What Was Checked

- Local source files:
  - `src/app/(public)/page.tsx`
  - `src/app/(public)/about/page.tsx`
  - `src/app/(public)/faq/page.tsx`
  - `src/i18n/messages/en.ts`
  - `src/i18n/messages/nl.ts`
  - `src/i18n/metadata.ts`
- Live pages:
  - `/en`
  - `/nl`
  - `/robots.txt`
  - `/sitemap.xml`

## Findings

### P0 - Technical SEO Blocker

1. `robots.txt` and `sitemap.xml` return the site 404 page in production.
2. No app-level robots/sitemap route files were found under `src/app`.

Impact:

- Crawlers may not reliably discover/understand index policies and URL inventory.

### P1 - Metadata/Structured Data

1. Canonicals are generated as locale-relative paths in `src/i18n/metadata.ts`.
2. No structured data JSON-LD detected on homepage source.

Impact:

- Weaker entity signals and less robust canonical handling across crawlers/tools.

### P1 - Conversion Messaging Gap

1. Homepage copy is clear but mostly feature-first.
2. "Why start bike fitting" is implied but not strongly framed around pain and outcomes.

Impact:

- Lower motivation for users with symptom-driven intent.

### P1 - Multilingual Copy Quality

1. NL copy mixes Dutch and English technical wording.
2. Vocabulary and style are not fully standardized across Home/About/FAQ.

Impact:

- Reduced clarity and trust for Dutch-language users.

## File-Level Notes

- `src/i18n/metadata.ts:7` canonical currently built via locale path prefix.
- `src/i18n/messages/en.ts:32` and `src/i18n/messages/nl.ts:33` metadata are present but generic.
- `src/i18n/messages/en.ts:78` and `src/i18n/messages/nl.ts:79` "Why choose" sections are feature-oriented.
- `src/i18n/messages/nl.ts:121` includes mixed term "setback" in NL list item.
- `src/app/(public)/faq/page.tsx:121` and `src/app/(public)/about/page.tsx:145` include mixed EN/NL terminology patterns.

## Recommended Priority

1. Ship Step 01 (technical SEO foundation) first.
2. Ship Step 02 and Step 03 together for conversion and localization quality.
3. Then scale through Step 04 and Step 05.

