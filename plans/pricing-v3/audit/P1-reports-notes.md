# P1 report boundary

- Central recommendation whitelist keeps calculatedFit core values, confidence, frame sizes and identity.
  It strips explanations, priority steps, pain solutions, alternate climbing fit, pressure commentary,
  shadow comparison, input provenance and progress from enforced free report responses.
- Owner authorization remains at every existing query entry; entitlement matching uses owner and bike.
  Explicit `legacyFullAccess` survives expiry. Report writers accept no such client argument and new
  report inserts do not copy it. Idempotent retries return the existing canonical session recommendation.
- Redaction covers recommendation queries, bike detail, session/history joins and grouped advice.
  Calculator-chain summaries contain timestamps only; lifecycle mails consume core values only.
- `getReportV2.access` and its redacted recommendation are a single Convex snapshot. PDF/email export
  use that bundle, not an earlier access query. Free exports are restricted to the latest owner report
  session; explicitly preserved legacy reports and entitled reports retain full export access.
- Free PDFs use a separate core-only simple renderer, avoiding generated rich narrative/implementation
  plans. Free email notes are empty. No CSS-only restrictions and no new external delivery integration.
- Flag off preserves previous report data and legacy commercial PDF checks. Missing recommendation
  does not remove pending-report pressure data when enforcement is off.
- Tests: 201 passed across 23 files (recommendations, advice, sessions, bike queries, report email,
  PDF route, actual core renderer). Includes default-off, legacy, bike forwarding, owner rejection,
  latest/older report, no narrative, NL/EN core export, and Next-off/Convex-on export-denial cases.
- Focused ESLint passed. Root owns full candidate gates. No commit, deploy or backend invocation.

Coordination payload: `messages/A-report-payload.md`.
