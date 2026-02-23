# Output 01 - Content and Behavior Contract

## Completed
- Canonical quotes source created: `src/content/homeQuotes.ts`
- Quote display count constant added: `HOME_QUOTES_DISPLAY_COUNT = 4`
- Section copy decision finalized and encoded in module:
  - localized title/subtitle (`en` and `nl`)
  - quote bodies remain fixed source quotes

## Finalized Content
- Quote dataset size: `20`
- Source of truth: `HOME_QUOTES` in `src/content/homeQuotes.ts`
- Current quote text style in codebase: ASCII apostrophes (`'`) for consistency with repository defaults.

## Randomization Behavior (Implementation Contract for Step 02)
1. Show exactly `4` unique quotes per visit.
2. Never show duplicates inside the same 4-quote set.
3. Sampling strategy:
   - shuffle copy of `HOME_QUOTES` with Fisher-Yates
   - take first `HOME_QUOTES_DISPLAY_COUNT` entries
4. "Per visit" rule:
   - generate selection at page render time for each request
   - do not persist selection in local storage/cookies
5. Hydration safety:
   - preferred approach is server-side selection in homepage server component
   - pass selected quotes into client carousel UI as props
   - avoid client-only initial random generation that can cause hydration mismatch

## Section Copy Decision
- Decision: localized section framing + fixed quote text.
- Rationale:
  - quote text appears as direct rider voice and should remain unchanged
  - section heading/subheading should match page locale for readability

## Next Step
- Execute `02-build-carousel-component.md` using this module and behavior contract.

