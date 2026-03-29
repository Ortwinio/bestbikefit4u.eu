# Subagent C: Quality Audit

## Ownership

You are the independent auditor for this follow-up implementation.

You do not implement features unless a tiny corrective patch is required to prove a finding.

## Objective

Check whether the Marktplaats preview upgrade actually meets the intended rider experience and technical safety bar.

## Audit Scope

- advert text completeness
- preview summary usefulness
- photo preview clarity
- warning quality
- code quality and regression risk

## Required Output

Write:

- `plans/bugfix-marktplaats-import-preview-upgrade/output-01-preview-upgrade-audit.md`

## Acceptance Scorecard

Score each item as:

- pass
- partial
- fail

Items:

- full advert text is visible
- structured summary is useful and non-fabricated
- photo preview gives visual confirmation
- weak/no-photo states are explicit
- preview remains editable
- no geometry or invented specs are introduced

## Success Scorecard

Assess:

- rider confidence
- operational robustness
- delivery quality

## Final Verdict

Return one of:

- ready
- ship with known gaps
- not ready
