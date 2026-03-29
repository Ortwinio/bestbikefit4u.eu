# Marktplaats Import Preview Upgrade

## Goal

Improve the Marktplaats bike import flow so the rider can:

- see the full relevant advert text instead of a short social/meta snippet
- review a stronger structured summary of what the advert says
- verify the bike visually through a more useful photo preview before saving

This is a follow-up to the existing implemented feature in [plans/feature-marktplaats-bike-import/README.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-marktplaats-bike-import/README.md).

## Scope

This plan covers:

- better advert text extraction and storage for Marktplaats imports
- extracting relevant signals from advert title and description
- improving the rider preview with a “what we found” summary
- improving photo preview so the rider can confirm the imported bike visually
- better warnings when the preview is weak or incomplete

This plan does not cover:

- geometry extraction or generation
- importing structured wheelset/spec data into permanent bike fields
- support for new marketplaces
- automated trust of parsed claims without rider review

## Product Direction

The import should use the advert text in three layers:

1. Raw advert text
- keep the full advert description on the import record
- copy it into the editable bike description draft
- preserve it for traceability and debugging

2. Structured extracted signals
- derive likely fields from the title and advert text
- only use medium/high-confidence values for prefills
- keep low-confidence signals visible as “needs review”, not as silent truth

3. Rider-facing summary
- show a concise “What we found in this advert” section in the preview
- use it to help the rider verify the import quickly

The photo preview should not just show selectable thumbnails. It should actively help the rider answer:

- is this the right bike?
- do these photos look complete enough?
- should I save this import or go back?

## Proposed Outcome

After this work, the import preview should show:

- the full imported advert description
- a concise structured summary of extracted findings
- a larger primary image preview
- a thumbnail strip with selection state
- a clear photo count and preview-quality warnings
- simple rider cues that help confirm whether the bike looks correct

## Acceptance Criteria

### Text import

- the preview uses the full best available advert description, preferring structured/full advert text over short meta snippets
- the full imported advert description is visible in the draft description field without silent truncation
- the original advert text remains stored on the import record for traceability
- the preview includes a structured “What we found in this advert” section
- that summary can show:
  - detected bike identity
  - frame size mention when present
  - notable component mentions
  - condition or maintenance claims
  - uncertainty warnings when extraction confidence is low

### Photo preview

- the preview shows one large primary image and a thumbnail strip
- the rider can switch the primary preview by selecting another thumbnail
- the preview shows how many advert photos were found
- the preview clearly indicates which photos will be imported
- if fewer than 2 valid photos are available, the rider sees a warning
- if no valid photos are available, the rider sees a specific empty-state explanation instead of a blank area

### Save confidence

- the rider can verify the imported bike without reopening the source advert in most normal cases
- the import preview makes low-confidence or incomplete data explicit
- the preview remains editable before save

### Quality

- the implementation does not invent structured facts that are not present in the advert
- geometry stays fully out of scope
- parser changes are covered by tests for long descriptions and image extraction behavior
- the preview UI changes are covered by component tests or equivalent deterministic checks

## Success Criteria

### Product success

- riders can understand what was imported from the advert in under 10 seconds
- riders can visually confirm the bike from the preview photos without opening the Marktplaats page in most cases
- the imported description is good enough that it usually needs editing, not manual re-entry

### Operational success

- preview failures degrade into explicit warnings instead of silent missing text or missing images
- weak previews are detectable through structured warnings
- the import remains safe when the advert exposes only partial data

### Delivery success

- the work stays within the existing Marktplaats import flow and bike import contract
- backend and UI ownership can be split cleanly across subagents
- no regressions to the existing save flow or bike creation path

## Implementation Shape

1. Strengthen parser and import contract.
2. Add extracted advert-signal summary.
3. Improve photo preview and selection UX.
4. Add quality warnings and explicit empty states.
5. Validate with parser tests, UI tests, and full build.

## Execution Files

- [01-advert-text-contract.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/bugfix-marktplaats-import-preview-upgrade/01-advert-text-contract.md)
- [02-photo-preview-contract.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/bugfix-marktplaats-import-preview-upgrade/02-photo-preview-contract.md)
- [03-implementation-roadmap.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/bugfix-marktplaats-import-preview-upgrade/03-implementation-roadmap.md)
- [04-subagent-a-parser-and-signals.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/bugfix-marktplaats-import-preview-upgrade/04-subagent-a-parser-and-signals.md)
- [05-subagent-b-preview-ui-and-photo-verification.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/bugfix-marktplaats-import-preview-upgrade/05-subagent-b-preview-ui-and-photo-verification.md)
- [06-subagent-c-quality-audit.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/bugfix-marktplaats-import-preview-upgrade/06-subagent-c-quality-audit.md)
