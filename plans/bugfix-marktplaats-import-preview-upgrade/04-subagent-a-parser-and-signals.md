# Subagent A: Parser And Signals

## Ownership

You own the backend Marktplaats preview contract.

Primary files:

- `convex/marktplaats/parser.ts`
- `convex/marktplaats/actions.ts`
- parser-related tests

You are not responsible for frontend layout.

## Objective

Improve advert text extraction so the preview contains the full useful advert text plus a compact structured summary of relevant findings.

## Requirements

1. Prefer fuller structured advert text over short meta snippets.
2. Preserve the raw imported advert text.
3. Add derived preview fields for:
- size mention
- component mentions
- condition mentions
- maintenance mentions
- preview warnings
4. Do not write these derived findings into permanent bike truth fields.
5. Keep geometry entirely out of scope.

## Implementation Notes

- Use deterministic extraction.
- Keep low-confidence claims explicit.
- Avoid overly clever NLP. Pattern-based extraction is enough for v1.
- If nothing useful is found, return empty arrays instead of fabricated output.

## Acceptance Criteria

- long advert text is preserved in the preview payload
- derived findings are available in the preview payload
- protocol-relative image URLs still work
- tests cover long descriptions and relevant extracted findings

## Validation

Run targeted parser tests and report what passed.

