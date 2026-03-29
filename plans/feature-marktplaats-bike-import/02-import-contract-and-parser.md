# Step 02 — Import Contract And Parser

## Objective

Define a stable server-side contract for fetching and parsing a Marktplaats advert.

## Product Rules

- only Marktplaats URLs are accepted in v1
- parsing happens on the server, never solely on the client
- imported fields must carry confidence or certainty semantics
- geometry must not be parsed, inferred, or saved

## Tasks

1. Define a typed parsed advert payload with:
   - `sourceUrl`
   - `canonicalUrl`
   - `advertTitle`
   - `description`
   - `imageUrls[]`
   - `candidateBrand`
   - `candidateModel`
   - `candidateBikeType`
   - per-field confidence
2. Define how title parsing maps Dutch marketplace language into app bike types.
3. Decide whether parser logic uses:
   - HTML selectors only
   - structured data / JSON-LD when present
   - a hybrid approach
4. Define parser fallback behavior when:
   - title exists but description is missing
   - images are missing
   - brand/model extraction is uncertain
5. Define test fixtures for at least:
   - a clear road-bike advert
   - a clear TT advert
   - a noisy advert with weak brand/model clues
   - an unsupported or malformed page

## Deliverable

Create `output-02-import-contract.md` with:

- parsed advert interface
- parser rules
- confidence rules
- explicit non-goals
- test fixture matrix
