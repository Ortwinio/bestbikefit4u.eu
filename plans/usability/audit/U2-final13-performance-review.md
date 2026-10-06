# U2 final13 performance manual review

Reviewer: B performance reviewer. Review in progress; this document is not a blanket approval.

## Frozen evidence and provenance

- Report: /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/final13/report.json
- Build: `-M-UBFJekPQrNYzLqVUSV` (also read from /Users/ortwinverreck/Developer/bikefitboost-usability/.next/BUILD_ID).
- Source hash: `3face2665511ff4e87fdf204ce82e730eb2ab44d34622dd8dc6babf61dcc4d92`.
- Report: `automatedPassed: true`, `automatedOnly: true`, `passed: false`; no stale build sources. Current sourceFingerprint independently matches; verifyBuildProvenance returned `{valid:true,reason:null}`.
- Scope: gearing, climb-planner, power-speed, ftp-wkg, fuel-hydration; NL/EN, 390x844 and 1440x900. Main owns body/pressure.
- Read frozen message, guard contract, usability README, advice v2, rules.mjs and relevant Calculator board logic/route wrappers. No app, harness or build modifications; no network, commits or external messages.

## Confirmed defect, reported to requester before approvals

**F1 — rule 14, gearing, NL/EN at both widths: unsupported equipment recommendation claim remains in expanded content.**

The final13 `details-open` screenshot still includes the “Clear upgrade direction” / “Directe upgrade-richting” card: “You can see right away whether a larger cassette, smaller inner ring, or wider 1x range makes more sense.” The current public calculator shows estimated climbing cadence and its range; it does not produce that equipment recommendation. The card belongs to the expanded “Exact gearing math, fast route check” section.

Actual evidence: /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/final13/gearing-en-1440-details-open.png and /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/final13/gearing-en-390-details-open.png. NL counterpart is present in current source and requires final screenshot confirmation before binding the NL finding.

Source: /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/gearing/page.tsx, `trustPoints`; /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/gearing/GearingCalculatorForm.tsx routes public mode to PublicPerformanceCalculator; /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/power-speed/PerformanceReliabilityResults.tsx renders cadence only for gearing. The richer old account-mode gearing engine does not establish this public claim.

The corrected final13 cadence explanation **is present**: 85% of existing FTP or FTP estimated at 3 W/kg; wheel circumference 2.1 m; bike mass 9 kg; explicit assumptions. F1 concerns another expanded card, not the already-corrected calculation explanation. Metadata in the same page also still promises hardest gear/speed/climb verdict; this is corroborating source evidence, not a screenshot claim.

## Observations already reviewed

- Gearing: all four cases' initial/edited/reused/next main content inspected. Initial 58.1 rpm; chainring 34 to 35 changes it to 56.4 rpm and removes the result example. Reused 34/34, 7%, 80 kg and FTP 240 W yield 85.4 rpm; known-input strip shows those values and the repeated account reason is absent. Actual next page shows gradient 10.5%, with original provenance retained in metrics.
- Climb: all four cases' initial/edited/reused/next main content inspected. Initial 64 min; distance 12 to 12.5 km gives 66.6 min. Reused 12 km, 7%, 240 W and 80 kg gives 63.4 min. Road bike 8.5 kg and 90% FTP are visible. Next power-speed page actually shows 75.5 kg and a different account reason. Corrected short answer promises time and percentage of FTP, not missing outputs.
- Power-speed: both mobile cases' initial/edited/reused/next main content inspected; both desktop cases' initial/edited/reused originals inspected. 220 to 225 W changes 34.8 to 35.1 km/h. Reuse shows 220 W, 80 kg, road bike and 34.7 km/h; the account reason is suppressed. Mobile next FTP screenshot shows 75.5 kg and 3.6 W/kg.
- Initial example values are muted and labelled; edited fields lose their label while untouched fields remain labelled. Reused active inputs lose example treatment. Focus ring is visible on the edited slider. The cookie banner initially covers part of the form but not the header; subsequent states show dismissed consent.
- Account blocks retain the original carry-over promise and session-only storage notice. Mobile result-to-account gaps in report: gearing NL272/EN252 px; climb 232 px; power NL272/EN252 px; FTP 212 px; fuel 332 px. All below 844 px. All 20 cases have no automatic rule failures or captured runtime errors.
- Metrics for FTP→fuel and fuel→saddle use `retained-only`, not `applied-input`. FTP's 295 W test value and fuel's 210 min remain stored, but these destinations have no matching field. Do not describe these transitions as visible prefills.
- Paid forms in inspected cases are a report/step-plan chip plus a Now/Free/Paid ladder. Prices €13.50 single fit / €21.50 per year; explicit statement that payment does not narrow the range. This deliberately avoids the board's unshipped precision, guided-test, sweat-test and seasonal-history promises.

## Remaining at this checkpoint

Complete expanded-detail/source review for all tools; inspect FTP and fuel originals across four cases each; finish power desktop next states; independently verify screenshot/evidence hashes; then issue only genuinely supported per-rule approvals. No manual approval JSON exists at this checkpoint. Rule 14 gearing is withheld. This checkpoint preserves completed work if execution is interrupted.
