# Step 01 — i18n Static Audit

## Objective

Find hardcoded user-facing strings in source files and verify translation key parity between EN and NL dictionaries.

## Tasks

1. **Locate all translation dictionaries:**
   - Find `src/i18n/` or equivalent — list all message files
   - Identify the EN and NL dictionary files

2. **Key parity check:**
   - For every key in the EN dictionary, verify the NL dictionary has the same key
   - Flag any missing NL keys (P0 if on a route shown to NL users, P1 otherwise)
   - Flag any extra NL keys without EN equivalents (potential dead code)

3. **Hardcoded string scan:**
   - Search source files for patterns like `"Bike"`, `"Save"`, `"Continue"`, `"Loading..."`, etc. in JSX/TSX outside of dictionary lookups
   - Focus on: `src/app/`, `src/components/` (exclude test files and type-only files)
   - Exclude: proper nouns (brand names, "BestBikeFit4U"), numeric values, technical identifiers

4. **`<html lang>` check:**
   - Confirm that locale-aware layouts set `<html lang="en">` or `<html lang="nl">` dynamically
   - Check root layout and any locale-specific layouts

5. **Hreflang / canonical check:**
   - Verify that public pages include `<link rel="alternate" hreflang="...">` tags for both locales

## Output

Document in `output-01-i18n-static-audit.md`:
- Missing NL keys (table: key | EN value | present in NL?)
- Hardcoded strings found (file:line | string | suggested key name)
- `<html lang>` status per layout
- Hreflang presence on public pages
