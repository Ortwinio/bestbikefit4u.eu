# 12 — Subagent E Prompt: Independent Quality Audit

## Mission

Audit the completed Marktplaats bike import implementation independently. Your primary job is to find gaps, not to praise the work.

## Read First

- `plans/feature-marktplaats-bike-import/README.md`
- `plans/feature-marktplaats-bike-import/07-implementation-roadmap.md`
- all implementation closeout outputs from Subagents A-D

## Required Review Areas

1. Acceptance criteria
2. Success criteria
3. Code quality
4. Data integrity
5. Failure handling
6. Traceability and observability
7. Scope discipline:
   - no geometry import
   - no hidden LLM fact invention

## Findings Format

List findings first, ordered by severity:

- High
- Medium
- Low

Each finding should include:

- why it matters
- exact file references
- whether it blocks ship

## Required Scorecards

### Acceptance Scorecard

For every acceptance criterion in the main README, mark:

- pass
- partial
- fail

### Success Scorecard

For every success criterion in the main README, mark:

- achieved
- at risk
- not achieved

## Required Final Verdict

Choose exactly one:

- `ready`
- `ship with known gaps`
- `do not ship`

## Required Output

Create:

- `plans/feature-marktplaats-bike-import/output-05-final-audit.md`

That file must contain:

- findings
- acceptance scorecard
- success scorecard
- code quality verdict
- final ship recommendation
