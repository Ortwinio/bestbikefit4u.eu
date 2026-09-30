# 29d — HTTPS harness and bike follow-up

## HTTPS implementation

Changed the production preview from HTTP to HTTPS, preserving app CSP and all error checks.
A one-day throwaway loopback certificate is generated with OpenSSL under OS tmp and removed at shutdown.
Node GETs trust only that certificate at the exact preview origin; external origins retain default TLS
validation. Playwright ignores certificate errors only in production contexts (including their
subrequests), as this run does not validate deployment certificate chains. Fixture browser contexts
retain ordinary validation. No global TLS disable or new SSL-error exemption was introduced.

Shared helper integration covers readiness, CMS sitemap discovery and fixture CSS/assets. The actual
app code and snapshot source hash inputs are unchanged. The README documents this topology and limits.

Validation: 9 harness tests pass, including TLS redirect success, unchanged CSP header,
rejection without the scoped certificate, rejection outside the configured origin, and key cleanup.
The first focused run encountered another agent's active snapshot build; it was not interrupted.
The retry reused the completed build on port 4351 and passed all 12 cases for
`/bike-fitting`, `/bikefitting`, `/app` (NL/EN × 1440/390). The six previous SSL failures are now zero;
8 axe passes and 4 expected-404 skips. No error suppression was added.
A separate blog integration smoke passed all 8 cases, including the CMS fixture loading assets via TLS.
All harness JavaScript passes ESLint. Servers closed after each run; the same port was reused.

Evidence: [TLS report](../final-sweep/29d-tls/report.md) and
[blog report](../final-sweep/29d-blog/report.md), with raw JSON and run context alongside each.
TLS snapshot: `619eb8249872556a3093298ee758ae298238c5ce94442728858b8edeed615a69`;
build ID `eLDpwmF4vUcKCnS0rh8UL`.

## Bike routes — confirmed after DONE 29a

After the lead confirmed C's DONE 29a, inspected [29a/report.json](../final-sweep/29a/report.json).
All 12 cases for `/bikes/new/manual`, `/bikes/import/marktplaats` and `/bikes/import/passport`
(NL/EN × 1440/390) have no failed checks. All six mobile touch-target checks and all 12 axe checks pass;
desktop touch-target checks are correctly skipped. C's shared 44px Input/Select defaults resolved
the bike findings without any bike-file edits.

C's full run has 280 cases without failures, including zero console-error failures using this HTTPS
harness. Its source hash and build ID match the focused TLS evidence above. The 29a report remains
C's artifact and is referenced, not included in D's file list.

29d is complete. The final file list is `files-29d.txt`; it contains no PNGs, certificates or keys.
No app code changes, commits or pushes by D. Diagnostic servers were stopped after validation.
