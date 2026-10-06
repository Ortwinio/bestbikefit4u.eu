# U1 login visual and code review — build 3

Status: **not approved for rule 14**. The inspected layout satisfies the mobile header requirement, but expanded login benefits describe paid report content as universally included in a free account. This document records an agent review, not a human approval or a release-green assertion.

## Evidence and scope

- Build: `nrNDRX3KXTT0C7uLLdRUZ`.
- Source hash: `d7e7b76db5577e8e87369bf4e89b22dfb62ca88b7a298454bca21b64d0a888ba`.
- Report: `plans/usability/renders/guard/U1/report.json`, generated `2026-10-06T10:15:01.703Z`; build provenance reports valid.
- Viewed all ten actual login PNGs through the image tool at readable resolution: initial and details-open for NL/EN at 390×844 and 1440×900, plus both mobile menu-open states. SHA-256 recomputation matched every recorded screenshot hash below.
- Compared against `plans/usability/canvas/project/Login.dc.html` and `plans/usability/canvas/project/m/Login.dc.html`; read the actual login, header, consent, selectable, and report-access implementation.
- No source, harness, report JSON, environment, or production changes. No real login/email request. Only this review file is written.

## Findings

### Rule 14: free-account claims need correction

`src/app/(auth)/login/page.tsx:83` introduces the EN benefit list with “Your free account includes”; lines 86–87 promise a prioritized adjustment sequence and an email report with the complete fit analysis. The NL equivalent at lines 134–138 makes the same claims. These are visible in every details-open screenshot.

`convex/recommendations/access.ts:6` defines the restricted core recommendation and removes `fitNotes`, `adjustmentPriorities`, and `recommendationItems` at lines 19–21. `hasFullReportAccess` at line 25 permits full content when enforcement is disabled, for an explicit legacy entitlement, or through the user's full-report entitlement. `visibleRecommendation` at line 30 otherwise returns the restricted core recommendation. These exceptions do not justify a universal promise to new free users.

`reportAccess` at line 35 does allow the latest free report to be emailed/downloaded, so claiming that free users cannot receive any report would also be wrong. The unsupported part is **complete** analysis and the guaranteed adjustment sequence. `src/i18n/account/reportAccess.ts:13` explicitly describes a full adjustment plan with adjustment order as paid; `src/i18n/calculators/calculatorPaid.ts:5` likewise puts the full fit report and adjustment order under paid access. Login should describe the actual free core values/report accurately before rule 14 is approved.

### Nonblocking observations

- The initial EN mobile consent banner covers most of the Send Login Code button; the NL banner overlaps its lower edge and the subsequent explanatory content. Both offer readable, adequately sized consent actions. They do not cover the header, so this is **not** a rule-5 failure. Dismissing consent reveals the complete form in the captured expanded state. It is still useful friction evidence for future layout consideration.
- The newsletter card has no visible unchecked checkbox outline. Code in `src/components/ui/Selectable.tsx:79` intentionally hides its check icon until selected; the whole card is the checkbox target, and the signup state defaults to false in `src/app/(auth)/login/page.tsx:278`. This is a discoverability observation, not a newly invented release requirement or evidence of automatic subscription.
- Axe reports the consent heading/body outside a landmark (`region`, moderate) in all four initial cases. This is outside the reported contrast/target pass and should remain visible in the review record.
- The canvas shows Google login; this offline build does not. `src/app/(auth)/login/page.tsx:293` feature-gates Google authentication. Hiding an unavailable provider is preferable to claiming it works; this review does not verify the production provider configuration.

## Four case/state reviews

### NL, 390×844

Initial: single logo, Inloggen, menu in one row; report measures outer header 64 px and menu 44×48 px. The canvas calls for 44×44; this implementation is slightly taller while preserving the minimum target and 64 px header. Title wraps cleanly to two lines, email label/help remain readable, and there is no horizontal overflow. Cookie choices and privacy link remain legible below the header.

Menu-open: language controls, Mijn houding with five tools, and Mijn rit with six tools are readable and comfortably separated. Close control is visible. The sheet fills the viewport and scrolls for the remaining public/account links; the full-page screenshot also includes the underlying page below the viewport, which is not an extra in-viewport menu panel. This state is navigation, not a paid upsell overlay.

Details-open: consent is dismissed; the login action and calculator-without-account link are unobscured. Benefit disclosure expands naturally without clipping. Its free-account report/sequence claims are the rule-14 finding above.

### EN, 390×844

Initial: the longer heading wraps to three lines without clipping. Header dimensions match NL and the logo/login/menu fit. The cookie banner obscures most of the login button, but does not overlap the header; both consent choices remain readable.

Menu-open: English route/tool labels fit in one column, including Power and speed and Fuel and hydration. Language and close actions remain visible. The menu's scroll requirement is the same as NL.

Details-open: complete form, help copy, and calculator link are readable. Expanded content fits the card; it repeats the unsupported universal free benefits. Feedback control overlaps decorative bicycle art rather than a form field in this capture.

### NL, 1440×900

Initial: intended desktop split layout remains: logo/illustration/benefits left, form right. No unnecessary mobile header or duplicated logo. Input and primary action have ample space. The bottom consent banner covers some lower promotional/support material, not the email input or primary action.

Details-open: consent is gone, benefit text expands the page vertically without overlap. Form remains comfortably spaced. Expanded claims fail rule 14; current screenshots otherwise show readable typography and adequate targets.

### EN, 1440×900

Initial: split layout and two-line title fit. Input and Send Login Code action are clear. Banner placement matches NL, with readable essential/all choices. No horizontal overflow is recorded.

Details-open: English benefit text and form help remain legible; no clipping or target collision is visible. Same rule-14 issue. The longer full-page output reflects expanded content, not desktop horizontal overflow.

## Rule conclusions and limits

- **Rule 5:** pass for the two mobile cases; header remains 64 px and consent does not obscure it. Desktop case is not applicable.
- **Rule 12:** no paid urgency, countdown, fear, or upgrade overlay found in any captured state or the reviewed login presentation. Consent and navigation are not upgrade overlays. The login OAuth `beforeunload` code suppresses a provider redirect interruption; it does not introduce a paid leave prompt. Calculator leave-notice lifecycle is outside this login review.
- **Rule 14:** not approved because the expanded free-account claims conflict with restricted report entitlements. No wrong price string is visible in these cases.
- **Rule 15:** captured light-theme layouts have no reported undersized visible targets, contrast failures, or horizontal overflow; visuals are legible. Focus styles exist in the relevant controls and the initial email field visibly has a focus ring. This review does not substitute for a complete interactive keyboard traversal or assert uncaptured code-entry/error/success, checked-newsletter, dark-theme, or authenticated-menu states were inspected.

## Screenshot SHA-256 provenance

| Case/state | File | SHA-256 |
| --- | --- | --- |
| NL mobile initial | `login-nl-390.png` | `0cb3f89fd7d0135478bb6384478276eb32ad3ccf6b0d2c0228bd55f5d202df31` |
| NL mobile menu | `login-nl-390-menu-open.png` | `6ac65143e9309266695b8bec854b8e93dc54c7cbb32f227829c6e7ab7b8bcdc3` |
| NL mobile details | `login-nl-390-details-open.png` | `c24e688b54f0dd74e332aebf98d9be01af73a8ca6f09176f0141a3b4d1afa1ba` |
| NL desktop initial | `login-nl-1440.png` | `44e69ea3da411bace1a8108fd4aed5a1c696b46305338400c0e02440a501ed45` |
| NL desktop details | `login-nl-1440-details-open.png` | `be61a07229a189393a69faac08080218395685870aadb6e69b9962f32881e42e` |
| EN mobile initial | `login-en-390.png` | `2fb6a74c947cc00f6a9437d3cda194442e85421a0ff7afde87d5b3a30810da42` |
| EN mobile menu | `login-en-390-menu-open.png` | `2d46a59e747a2443979b146fffd2b16c955869feae572e6e5c5b833bd64413d6` |
| EN mobile details | `login-en-390-details-open.png` | `3e23288769feaaa095cce29ddf66a2e76d0f7e1f78105a8fedf845c55e2d31aa` |
| EN desktop initial | `login-en-1440.png` | `cd4a3a038764aad73ae4262e5deddb2c6a594c35056cef3d6a2dbbe3e8ecd507` |
| EN desktop details | `login-en-1440-details-open.png` | `04e7814145f1b695b9ea31898d981a3798de9a8197f152124a246abbdb2e91a9` |
