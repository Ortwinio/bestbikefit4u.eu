# U1 login/header review — build 6

## Result

**Login visual/code review passes for the ten explicitly inspected light-theme screenshots below.** The prior rule-14 blocker is resolved: expanded benefits now describe saved rider measurements and emailing the core values of the latest report. Mobile feedback is a separate in-flow action rather than an overlapping floating action.

This is an agent review of captured states, not a human sign-off or a claim that the full guard is green. The guard was still running and its final `report.json` was not available when this note was written. Numeric target/contrast results must come from that report; this review does not fabricate those results.

## Provenance

- Build ID, read from `.next/BUILD_ID` and `.next/usability-provenance.json`: `9eTXrYdBYp5cFF1Cohdt-`.
- Stamped application hash: `1c31ee452f639258a75612ebe301c607b1f84eec33283c023f76be4990d10ff2`.
- Build completed: `2026-10-06T12:28:12.857Z`.
- Images: `plans/usability/renders/guard/build6/`.
- All listed screenshots were actually opened through the image tool. Long representative dashboard captures were reopened with original-resolution detail for readable inspection.
- Hashes below were computed directly from the inspected PNGs. No source, harness, or screenshot changes were made.

## Login cases and states

| Case | States actually inspected | Result |
| --- | --- | --- |
| NL 390×844 | Initial with cookie consent; menu open; benefits details open after consent dismissal | Pass for captured visual states. Single-row logo/login/menu fits; cookie consent does not obscure header. Both routes and all eleven calculator labels are readable in the menu. Expanded free benefits are truthful. Feedback sits below the presentation card. |
| EN 390×844 | Initial with cookie consent; menu open; benefits details open after consent dismissal | Pass for captured visual states. Three-line heading remains readable; no horizontal clipping. Menu labels fit, close/language actions remain visible. Expanded profile/core-report copy fits; feedback no longer overlays the bicycle or form. |
| NL 1440×900 | Initial with cookie consent; benefits details open | Pass for captured visual states. Desktop split layout and single logo retained. Input and primary action remain clear. Updated benefits fit naturally in the left panel. Desktop feedback does not overlap the form in these screenshots. |
| EN 1440×900 | Initial with cookie consent; benefits details open | Pass for captured visual states. Two-line title and form fit; expanded English benefits remain readable. No visible clipping or target collision. |

## Rules 5, 12, 14 and 15

- **5: login pass on mobile; desktop not applicable.** Header remains visually one row with logo, login and menu; source uses a 63 px row plus the 1 px header border. Cookie consent stays at the viewport bottom. Language/calculator navigation is inside the mobile menu. The bottom cookie notice still overlaps part of the initial mobile login action, especially EN; this is a dismissible, pre-existing observation, not a failure of the rule protecting header/tab navigation.
- **12: pass for captured login states and reviewed presentation code.** No paid urgency, countdown, fear or upgrade overlay. The open navigation menu and cookie notice are not paid upgrade overlays. No login leave-notice lifecycle or email submission was exercised; calculator leave-notice behavior is outside this review.
- **14: pass for reviewed login claims.** `src/app/(auth)/login/page.tsx:84` and `:135` retain basic saddle/reach/handlebar values and now state saved rider measurements plus emailing the core values of the latest report. `convex/recommendations/access.ts:6` retains calculated core fit values while stripping full-plan details; `reportAccess` at `:35` permits email for the latest free report. `convex/profiles/mutations.ts` implements saved profile measurements. The previous universal free adjustment-sequence and complete-analysis promises are absent from all four expanded captures. No price claims are introduced. Google login remains feature-gated, so its absence in this offline build is not treated as a broken enabled feature.
- **15: visual portion passes for captured login states.** Text is readable; focus ring is visible on the initially focused email input; controls have clear spacing. Public mobile feedback now occupies its own row below the main content and retains its visible label/handler. Final numeric minimum-target and contrast checks depend on the running guard. Complete keyboard traversal, dark theme, verification-code/error/success, checked-newsletter, and authenticated public-menu states were not captured here and are not approved by inference.

The optional newsletter card still uses the existing whole-card selection affordance without an unchecked checkbox outline. It starts unchecked in code. This remains a discoverability observation, not a new release gate.

## Representative account-header observations — not blanket account approval

Also viewed `dashboard-nl-390.png`, `dashboard-en-390.png`, and `dashboard-nl-390-menu-open.png` at readable original detail. The top header is now a single compact row; profile rings appear in a separate strip below it. The NL menu's close action and account links are readable, with the remaining calculator links in a scrollable panel. No account content/rule-14 claims were audited in full by this login task.

**Account header composition does not satisfy the literal rule-5 wording:** `plans/usability/usability-advies-v2.md:169` specifies “Alle mobiele schermen: logo, Inloggen of avatar, menuknop van 44 × 44”; `plans/usability/README.md:22` repeats logo/Inloggen/avatar in the one-row requirement. The matching `canvas/project/m/Dashboard.dc.html:40` puts the avatar in that row. Actual dashboard header uses logo, NL/EN controls and menu; the avatar is in the main dashboard action row. `src/app/(dashboard)/DashboardLayoutClient.tsx:100` confirms that structure. Height is fixed, but this is a literal composition gap, not just a canvas color/style preference. Parent/account owner must resolve it or explicitly document an authorized exception; this review does not approve it.

**Account feedback screenshot limitation:** `dashboard-nl-390.png` shows “Geef feedback” across the lower part of the right-hand 59% profile ring and its “Betrouwbaar” caption; `dashboard-en-390.png` shows the corresponding overlap of the right-hand ring/“Reliable” caption. This is not sufficient evidence of a production regression: `tests/visual/account-batch1/entry.jsx:28` and `tests/visual/account-batch2/entry.jsx:21` instantiate `FeedbackFloatingButton` directly without `flowOnMobile`, while the actual `src/components/feedback/FeedbackPanelProvider.tsx:127` now passes that prop. The fixture therefore still selects the legacy floating layout despite the source fix. Account screenshots must be recaptured through an aligned fixture to prove mobile feedback placement; no account-flow failure or pass should be inferred from the stale adapter. Source/harness were not edited during this review.

## Inspected screenshot hashes

| File | SHA-256 |
| --- | --- |
| `login-nl-390.png` | `335ab14b399bf0d7d27fdbc06500aa2b78706652883b2f811e59e98f3f641fa0` |
| `login-nl-390-details-open.png` | `753ed43e8f27889af76767cd5ab08e9649aed89075a515429a6af4da5bd0bc47` |
| `login-nl-390-menu-open.png` | `60f8d382581cb17eab40cb925bfab949c5b0e137df4862eb84a8d92572c4a58c` |
| `login-en-390.png` | `035c15e9de30a09210d5988736d9bdca99194a11c3f7b99cbbe48c9e3c21cfc5` |
| `login-en-390-details-open.png` | `93dc2d53a0ac35e5b0149bfd1497f2ed3da6de5b4a262779d6543fd2925ef266` |
| `login-en-390-menu-open.png` | `d3bd9ee1d2d9861fb17fa800be06d6bbe1617cbcef963706564e4a80bb1a5c33` |
| `login-nl-1440.png` | `44e69ea3da411bace1a8108fd4aed5a1c696b46305338400c0e02440a501ed45` |
| `login-nl-1440-details-open.png` | `c0249438f6ba6a1fb40f314f7ef4f0bb959c868b20f21038378130385749aff0` |
| `login-en-1440.png` | `cd4a3a038764aad73ae4262e5deddb2c6a594c35056cef3d6a2dbbe3e8ecd507` |
| `login-en-1440-details-open.png` | `d8b4d0329dda168060e89c22b6ab0a29fb4d1a1fe1a12de37ed24cf70755ed98` |
| `dashboard-nl-390.png` | `09b8d21a088c3f56dfc474ff9b07cdcb95e627c589b3a11bbd7051397bab42b0` |
| `dashboard-en-390.png` | `08f0e4da386447547d2a90403f8e3ebe64db114cccf0738dbc51df4cf2918a08` |
| `dashboard-nl-390-menu-open.png` | `3a442ee1a3a10608320452154208ddd317dc6bf04f06166392021b33da4546b1` |
