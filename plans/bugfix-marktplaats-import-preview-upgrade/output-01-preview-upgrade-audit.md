# Output 01 — Preview Upgrade Audit

## Findings

### High

- The current backend preview payload does not expose the richer advert-text contract required by the follow-up plan. The plan requires `rawAdvertDescription`, `descriptionSummary`, `sizeMention`, `componentMentions`, `conditionMentions`, `maintenanceMentions`, and `previewWarnings` in [01-advert-text-contract.md:26](/Users/ortwinverreck/Developer/bestbikefit4u/plans/bugfix-marktplaats-import-preview-upgrade/01-advert-text-contract.md#L26). The live preview response in [actions.ts:8](/Users/ortwinverreck/Developer/bestbikefit4u/convex/marktplaats/actions.ts#L8) only returns `description`, `imageUrls`, brand/model/bike-type candidates, and `needsReview`. Likely acceptance gap:
  - full advert text traceability is only partial
  - there is no structured “What we found in this advert” summary
  - weak-preview warnings are too shallow for the new acceptance bar

- The current preview UI has no structured advert-summary section at all. The plan requires a rider-facing “What we found in this advert” section in [README.md:44](/Users/ortwinverreck/Developer/bestbikefit4u/plans/bugfix-marktplaats-import-preview-upgrade/README.md#L44) and [README.md:72](/Users/ortwinverreck/Developer/bestbikefit4u/plans/bugfix-marktplaats-import-preview-upgrade/README.md#L72). The current UI in [MarktplaatsBikeImportFlow.tsx:205](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/MarktplaatsBikeImportFlow.tsx#L205) only shows editable fields, confidence badges, a warning list, and a description textarea. Likely acceptance gap:
  - riders still need to infer important advert facts by reading the full description manually
  - the preview is not yet optimized for a sub-10-second understanding pass

- The current photo UI does not satisfy the required verification UX. The plan requires a large primary image, a thumbnail strip, photo count, and weak-photo warnings in [02-photo-preview-contract.md:7](/Users/ortwinverreck/Developer/bestbikefit4u/plans/bugfix-marktplaats-import-preview-upgrade/02-photo-preview-contract.md#L7). The current preview renders a uniform selectable card grid in [MarktplaatsBikeImportFlow.tsx:296](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/MarktplaatsBikeImportFlow.tsx#L296) with no dedicated large preview, no explicit photo count, and no `<2 photos` warning state. Likely acceptance gap:
  - rider cannot visually confirm the bike as quickly as the plan intends
  - weak photo coverage is not called out explicitly

### Medium

- The client preview normalizer is still built for the old thin payload and will need careful upgrade work to avoid silent data loss. Current shape in [marktplaatsImport.ts:29](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/marktplaatsImport.ts#L29) contains only `advertTitle`, `description`, `photos`, simple fields, and `warnings`. If backend adds richer summary fields but this mapper is not updated precisely, the UI can pass typecheck while silently discarding new payload sections.

- Unknown bike type still falls back to `road` in [marktplaatsImport.ts:56](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/marktplaatsImport.ts#L56). This is already a quality gap in the existing flow and becomes more visible in the preview-upgrade work because the new contract explicitly says low-confidence findings should stay reviewable and non-authoritative in [README.md:39](/Users/ortwinverreck/Developer/bestbikefit4u/plans/bugfix-marktplaats-import-preview-upgrade/README.md#L39). After implementation, this needs explicit re-checking so the richer summary does not coexist with a silent authoritative fallback.

- The current backend preview path still prioritizes a single `description` field with no explicit distinction between raw advert text and shorter fallback/meta text. The follow-up contract in [01-advert-text-contract.md:40](/Users/ortwinverreck/Developer/bestbikefit4u/plans/bugfix-marktplaats-import-preview-upgrade/01-advert-text-contract.md#L40) specifically requires that short meta descriptions not replace fuller advert text. This is a risky area in:
  - [actions.ts:86](/Users/ortwinverreck/Developer/bestbikefit4u/convex/marktplaats/actions.ts#L86)
  - parser extraction logic in `convex/marktplaats/parser.ts`

### Low

- The current empty-photo state is explicit, which is good, but it is still too binary for the follow-up target. [MarktplaatsBikeImportFlow.tsx:303](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/MarktplaatsBikeImportFlow.tsx#L303) handles the no-photo case, but there is no middle “weak coverage” state for one-photo or low-confidence previews.

- The current preview remains editable, which is already aligned with the follow-up acceptance criteria. The main risk here is regression after adding richer read-only summary surfaces. Editable fields currently sit in [MarktplaatsBikeImportFlow.tsx:234](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/MarktplaatsBikeImportFlow.tsx#L234).

## Risky Files

- [actions.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/marktplaats/actions.ts)
  - preview payload shape is currently too thin
  - likely source of raw/full advert text and summary additions

- [parser.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/marktplaats/parser.ts)
  - most likely location for full-description preference, extracted signals, and confidence warnings

- [marktplaatsImport.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/marktplaatsImport.ts)
  - highest mapper risk
  - easy place to accidentally discard or flatten richer payload fields
  - current `road` fallback is a pre-existing quality hazard

- [MarktplaatsBikeImportFlow.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/MarktplaatsBikeImportFlow.tsx)
  - largest UI acceptance surface
  - likely place for summary section, photo count, large primary preview, thumbnail strip, and weak-preview warnings

- Any new parser/UI tests added under:
  - `convex/marktplaats/__tests__`
  - `src/components/features/bikes`

## Likely Acceptance Gaps To Recheck After Implementation

- `full advert text is visible`
  - current state: likely `fail`
  - reason: only a single `description` field exists and there is no evidence yet that full structured advert text is preserved over shorter fallback text

- `structured summary is useful and non-fabricated`
  - current state: `fail`
  - reason: no structured summary section exists in payload or UI

- `photo preview gives visual confirmation`
  - current state: `partial`
  - reason: there are selectable photos, but no large primary image or thumbnail-strip verification flow

- `weak/no-photo states are explicit`
  - current state: `partial`
  - reason: no-photo is explicit, weak-photo coverage is not

- `preview remains editable`
  - current state: `pass`
  - reason: current preview is fully editable before save

- `no geometry or invented specs are introduced`
  - current state: `pass`
  - reason: current flow only handles identity, description, and photos; no geometry/spec persistence appears in scope

## Exact Checks To Apply After Implementation

### Backend Payload Checks

- Confirm preview payload includes:
  - `rawAdvertDescription`
  - `descriptionSummary`
  - `sizeMention`
  - `componentMentions`
  - `conditionMentions`
  - `maintenanceMentions`
  - `previewWarnings`

- Confirm long-description fixtures keep the fuller advert text instead of collapsing to an OG/meta snippet.

- Confirm extracted signals are only derived from advert title/description content actually present in the source advert.

- Confirm no new field writes geometry or structured specs into durable bike fields during preview.

### UI Checks

- Verify the draft description textarea shows the full imported advert description without silent truncation.

- Verify a rider-facing “What we found in this advert” section exists and is separate from the editable form fields.

- Verify that summary content distinguishes findings from uncertainties, for example:
  - explicit low-confidence cues
  - warnings for weak/partial parse
  - no phrasing that implies certainty when the parser is unsure

- Verify the photo section includes:
  - one large primary image
  - thumbnail strip
  - visible photo count
  - clear selected vs deselected state
  - switching the primary preview by selecting another thumbnail

- Verify no-photo state renders a specific explanation, not a blank container.

- Verify one-photo or low-photo cases produce an explicit weak-coverage warning.

- Verify the editable fields remain usable after summary/photo additions:
  - name
  - brand
  - model
  - bike type
  - description

### Safety / Regression Checks

- Verify the client mapper in [marktplaatsImport.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/bikes/marktplaatsImport.ts) preserves all new payload fields rather than dropping them.

- Verify bike type does not silently fall back to `road` when the upgraded payload intentionally leaves bike type uncertain.

- Verify existing save flow still sends:
  - `importId`
  - editable bike identity fields
  - description
  - selected image URLs
  - primary image URL

- Verify no regressions to existing empty/error/loading states in the preview flow.

### Test Checks

- Parser tests should include:
  - long advert description
  - meta description plus fuller advert text
  - one-photo advert
  - no-photo advert
  - noisy advert with uncertain claims

- UI tests should include:
  - summary section rendering
  - full description rendering
  - primary image switching
  - weak-photo warning
  - no-photo empty state
  - editability preserved after preview upgrade

## Preliminary Verdict

Current state against the follow-up target: `not ready`

Reason:

- the current implementation is still on the pre-upgrade contract
- the main missing pieces are exactly the ones this follow-up plan is meant to add:
  - full advert-text handling
  - structured rider summary
  - stronger photo verification UX
  - weak-preview warnings beyond the current basic warning list

No code was changed for this audit note.
