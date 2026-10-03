# A report payload for B

`getReportV2` preserves its current object and calculatedFit shape. It adds `access`
with `fullReport`, `canDownloadPdf`, `canEmailReport`, `legacyFullAccess`, `isLatestReport`, `enforced`.
The same object is available from owner-only `recommendations/queries:getReportAccess({sessionId})`.
Free enforced reports retain calculatedFit core numbers, confidence and frame sizes but have empty
fitNotes/adjustmentPriorities/recommendationItems and no pain solutions, climbing fit, pressure narrative,
comparison/provenance/progress or feasibility explanation. Related pressure calculation is null.
Full and explicitly legacy-marked reports preserve the complete original payload. Flag off preserves old access.
PDF on free is latest report only and uses the core-only renderer (no derived rich narrative).
Email on free follows latest-only, core-only policy. B must use access and not tier or CSS hiding for paid sections.

Export authorization comes from the same `getReportV2` query snapshot as its redacted recommendation;
the PDF route and email action honor `access` rather than a preceding independent entitlement read.
`isLatestReport` means latest owner report session (canonical existing APIs select the earliest stored
recommendation in a session; retry writers never create another version in that same session).
