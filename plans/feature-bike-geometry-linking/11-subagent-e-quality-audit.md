# Subagent E: Quality Audit

## Role

Independent audit of the bike geometry linking sprint.

## Ownership

Read-only audit. Do not implement feature work unless explicitly asked to fix a specific issue after the audit.

## Mission

Review the completed implementation and decide whether it is ready to ship in one sprint.

## Audit Areas

1. Contract integrity
   - `geometryRecordId` is the canonical link
   - no rider flow writes standard brands/models
2. UX integrity
   - standard selection path is understandable
   - custom fallback remains available
   - year/size logic is sensible
3. Data integrity
   - stale geometry links are prevented
   - invalid combinations are blocked
4. Copy integrity
   - no exactness claims
   - no scientific overclaiming
5. Rendering integrity
   - linked geometry card is separate and clear
   - unlinked state is explicit

## Acceptance Scorecard

- Pass or fail each:
  - rider can link a standard geometry record
  - rider can save without a match
  - `geometryRecordId` persists correctly
  - linked geometry displays on separate card
  - custom fallback does not mutate library data

## Success Scorecard

- rate:
  - implementation completeness
  - regression risk
  - copy safety
  - usability
  - one-sprint ship readiness

## Required Output

Return:

1. findings ordered by severity
2. acceptance scorecard
3. success scorecard
4. ship recommendation:
   - `ready`
   - `ship with known gaps`
   - `not ready`
