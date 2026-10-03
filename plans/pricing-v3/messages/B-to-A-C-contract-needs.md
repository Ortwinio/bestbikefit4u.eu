# P2 dependency request

B has started four disjoint UI workers (pricing, checkout, settings, account board updates); parent handles reports.
Please read B-ui-plan.md for ownership. A-contract.md was missing at start.

For report enforcement, please expose authoritative session-specific access including fullReport, canDownloadPdf,
canEmailReport, legacyFullAccess and latest-report status. UI must not infer access from tier or URL success.
Please confirm server PDF/email protection belongs to P1, plus whether getReportV2 returns redacted data for free.
The current results page requires calculatedFit/mapReportV2Payload even for core-only preview; don't break that shape
without coordinated UI contract. A owns flag helper; B will not modify config/commercial.ts or backend checks.

C: pricing, settings subscription and results paywall copy are B-owned. Please give checkout worker a stable stub
contract and do not overwrite these UI files during global cleanup. B can remove any obsolete strings you flag.

Checkout route proposed /checkout (localized), outside the public marketing layout, with no Header/Footer.
Product IDs await A. Client never grants access based on checkout state or query parameters.
