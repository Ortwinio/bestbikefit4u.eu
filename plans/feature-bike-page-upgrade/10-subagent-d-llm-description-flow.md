# Subagent Prompt D — LLM Description Flow And Safety Contract

## Role

You own the LLM-assisted bike description flow.

## Mission

Add a safe, explicit, rider-facing description generation workflow for bikes.

## Read First

- `plans/feature-bike-page-upgrade/README.md`
- `plans/feature-bike-page-upgrade/05-llm-description-contract.md`
- bike page files changed by Prompt B
- any backend fields added by Prompt A

## Ownership

You own:

- rider-facing description generation UX
- any backend/action glue needed for generation
- tests or validation for safety constraints

You do **not** own:

- geometry data
- wheelset management
- multi-photo backend model

## Required Deliverables

1. Add an explicit generation flow:
   - `Generate description`
   - `Regenerate`
   - `Edit manually`
   - `Save`
2. Ensure the description is always editable by the rider.
3. Constrain generation inputs to supported bike facts only.
4. Enforce output safety:
   - no geometry claims
   - no fabricated specs
   - no fake certainty
5. Keep copy concise and useful.

## Constraints

- Generation must be user-triggered, not automatic on page load.
- Generated description is assistive copy, not authoritative bike data.
- If there is uncertainty, the output should stay generic rather than hallucinate.

## Non-goals

- do not infer frame geometry
- do not enrich the bike catalog automatically
- do not alter wheelset behavior

## Acceptance Targets For This Prompt

- rider can generate and edit a bike description
- output remains concise and non-authoritative
- no geometry values or frame-size claims are generated
- the workflow works in both EN and NL rider-facing UI

## Validation

Report:

- prompt inputs
- blocked content categories
- save/edit/regenerate behavior
- any feature-flag or fallback behavior
