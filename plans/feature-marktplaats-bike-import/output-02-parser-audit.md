# Output 02 — Parser Audit

## Extraction Strategy

1. Validate the incoming URL strictly as an HTTPS Marktplaats advert URL with a `/v/` path.
2. Fetch HTML server-side only, with:
   - hostname allowlist
   - HTML content-type check
   - response-size limit
   - timeout
3. Parse in this order:
   - JSON-LD structured data for `url`, `name`, `description`, `image`, `brand`, `model`, `category`
   - canonical and Open Graph metadata
   - conservative HTML fallbacks such as `<h1>` and description containers
4. Normalize title text before deterministic brand/model/type extraction.

## Normalization Rules

- title cleanup removes Marktplaats chrome and common sales noise like `zgan`, `te koop`, `maat 56`
- bike type is mapped from deterministic Dutch and English keyword families:
  - `tijdritfiets`, `triathlon`, `tt` -> `tt_triathlon`
  - `racefiets`, `koersfiets`, `wielrenfiets` -> `road`
  - `gravel`, `gravelbike` -> `gravel`
  - `mtb`, `mountainbike`, `trailbike`, `enduro`, `xc` -> `mountain`
  - `cyclocross`, `crossfiets`, `cx` -> `cyclocross`
  - `hybride`, `hybrid` -> `hybrid`
  - `tourfiets`, `trekking`, `touring` -> `touring`
  - `stadsfiets`, `transportfiets`, `omafiets`, `commuter` -> `city`
- brand extraction is conservative and only becomes high confidence when a known brand leads the cleaned title or is present in structured data
- model extraction depends on a stable brand first and removes obvious size/component/title noise before emitting a candidate

## Confidence Rules

- `high`
  - structured data directly provides the field
  - or the title contains an explicit unambiguous leading brand or bike-type keyword
- `medium`
  - a single plausible value is derivable from the cleaned title remainder or secondary keywords
  - still marked `needsReview`
- `low`
  - weak or conflicting evidence exists
  - parser may emit `null` instead of a speculative value
- `none`
  - no stable evidence was found
  - field is explicitly review-required

## Fixture Coverage

- `clear-road-bike.html`
  - strong structured-data advert for road-bike happy path
- `clear-tt-bike.html`
  - strong title-driven TT advert with structured-data support but no explicit model field
- `noisy-weak-advert.html`
  - noisy advert with conflicting `gravel/race` clues and no stable brand
- `malformed-page.html`
  - non-advert page that must fail safely

## Known Brittle Areas

- Marktplaats may change JSON-LD shape or class/test-id names
- image extraction uses generic marketplace image patterns rather than a formal gallery API
- model extraction is intentionally conservative and may under-fill noisy adverts instead of guessing
- hostname/path validation is strict by design and may need to expand if Marktplaats introduces a new canonical advert path shape
