# Subagent B: Bike Form Standard Geometry Flow

## Role

Owner of the standard brand/model/year/size selection path in the rider bike form.

## Ownership

Primary write scope:

- `src/components/bikes/`
- rider bike create/edit pages only if needed for prop wiring
- related i18n message files

You are not responsible for backend query implementation beyond consuming the contract from Subagent A.

## Mission

Add a dedicated geometry-link section to the rider bike form so a rider can select a standard bike identity from the geometry library.

## Requirements

1. Add a clear geometry-link section to the bike form.
2. Support:
   - standard brand selection
   - model selection scoped to brand
   - year selection only when needed
   - size selection scoped to model/year context
3. Keep geometry linking optional.
4. Do not make the rider interact with raw ids.
5. Use the copy principles from the sprint README:
   - practical
   - precise
   - no overclaiming

## Acceptance Criteria

- the standard flow is understandable on create and edit
- changing brand resets model/year/size
- changing model resets year/size
- changing year resets size where appropriate
- selecting the final size resolves a single geometry record link candidate

## Edge Cases To Cover

- one model only
- one size only
- multiple year variants with same model name
- no geometry results after selecting a path

## Analytics Events

- `bike_geometry_brand_selected`
- `bike_geometry_model_selected`
- `bike_geometry_year_selected`
- `bike_geometry_size_selected`

## Human Audit Checks

- common bike can be linked without confusion
- mobile layout remains readable
- helper text feels trustworthy and not technical

## Output

- implemented form UI
- short closeout note with files changed and any constraints discovered
