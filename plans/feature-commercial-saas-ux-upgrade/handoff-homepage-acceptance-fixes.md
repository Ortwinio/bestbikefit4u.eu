# Handoff: Homepage Acceptance Fixes

This is a minimal acceptance-fix checklist for Codex B based on the current homepage lane state.

## Scope

- `src/app/(public)/page.tsx`
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`
- minimal directly related homepage tests only

## Acceptance Fixes

### 1. Align hero trust-strip copy with the homepage copy handoff

File:
- `src/app/(public)/page.tsx`

Current gap:
- structure is correct, but the 3 hero trust-strip cards still use the older wording

Required target:

EN:
- `Method-backed calculations, not guesswork.`
- `Saddle height, reach, drop — in millimeters.`
- `Transparent about what online fitting can and can't do.`

NL:
- `Onderbouwde berekeningen, geen giswerk.`
- `Zadelhoogte, reach, drop — in millimeters.`
- `Eerlijk over wat online fitting wel en niet kan.`

### 2. Align homepage dictionary copy with the approved copy pass

Files:
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`

Current gap:
- CTA routing is updated, but hero/recommendation/final CTA copy does not fully match the exact handoff wording

Required target:
- hero title, accent, and description match `handoff-homepage-copy.md`
- recommendation card title/description/CTA match `handoff-homepage-copy.md`
- final CTA title/description/button match `handoff-homepage-copy.md`
- EN/NL keep semantic parity

### 3. Refresh homepage tests to assert the accepted copy, not only structure

File:
- `src/app/(public)/page.test.tsx`

Required assertions:
- hero primary CTA points to `/calculators/bike-fit`
- secondary CTA points to `/pricing`
- tertiary sign-in link exists
- calculator section remains above quotes/education content
- hero trust-strip copy matches approved wording
- EN/NL copy renders the expected accepted CTA framing

## Done When

- homepage structure remains intact
- trust-strip wording matches the approved conversion copy
- dictionary copy matches the approved homepage copy pass
- homepage tests cover both structure and accepted messaging
