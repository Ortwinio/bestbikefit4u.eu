# Build 7 U1 visual review

Reviewer: Codex U1 homepage agent. Build ID read from `.next/BUILD_ID`: `rFjJbzOipHKt5iD79GNZl`. Source images: `plans/usability/renders/guard/build7/`. Review performed directly with view_image; selected mobile states and pressure screens inspected at original resolution. No source changes, browser interaction, lifecycle approval, or invented evidence binding. Guard still running at initial review; report source/evidence hashes are not inferred from build 6.

## Homepage: four cases

| Case | Inspected states | Findings |
| --- | --- | --- |
| NL 390 | default, edited, reused, details-open, menu-open | Visible-layout pass. Single-row header and two route cards expose all 5+6 choices with separate start buttons. Default 175 cm is labelled voorbeeld; 726 ±45 mm. Edited 176 cm shows 730 ±45 mm. Reused 184 cm shows 764 ±47 mm and earlier-input attribution. No feedback overlap. Expanded report and practical guidance stay readable. |
| EN 390 | default, edited, reused, details-open, menu-open | Visible-layout pass. Same example/edit/reuse numbers and explicit attribution. Long labels wrap inside cards. Disclosure includes reversible-adjustment and professional-help guidance without fabricated testimonials. Menu says “My position” while home says “My posture”: nonblocking consistency issue. |
| NL 1440 | default, edited, reused, details-open | Visible-layout pass. Balanced two-column hero and route cards, visible primary starts, compact three-line explanation, expanded report within its column. Example/edit/reuse values match mobile. |
| EN 1440 | default, edited, reused, details-open | Visible-layout pass. Long English labels and expanded advice fit; free account and paid pricing remain distinct. Example/edit/reuse values match mobile. |

Main/m/Home intent remains two routes, all eleven calculators directly exposed, live saddle teaser and collapsed combined explanation; no invented testimonial section. Original board files are no longer present at the earlier canvas path in this worktree, so this is a fresh image review against the previously documented board intent, not a new board-script execution.

Rules 4 and applicable home rule 3: visible route grouping and provenance pass; link destinations and transfer remain guard interaction evidence, not screenshot proof. Rule 12: no paid upgrade overlay, urgency or fear in captured states; cookie banner is dismissible consent and temporarily covers part of the default hero, not an upgrade gate. Leave-notice once/session and account persistence are not approved by these images. Parent reports the build-6 eligibility-toggle bug fixed with six regression cases and 19 notice/analytics tests passing; that is separately attributed test evidence.

Rule 14: visible prices €13,50/€21,50 (NL), €13.50/€21.50 (EN), free-start language and practical qualified guidance pass. Widget numbers were visibly inspected, not approved solely from code. Formula correctness and paid fulfillment remain outside visual review. Rule 15: no observed layout clipping or mobile feedback occlusion. Exact targets, contrast and overflow remain automated measurements. Long Dutch footer compound words split awkwardly across lines (nonblocking readability polish).

## Additional B spot checks only

Inspected `tire-pressure-nl-390.png` and `tire-pressure-en-1440.png` at original resolution. Both show properly styled paired front/rear gauges, explicit example 75 kg/28 mm and 5.2/5.6 bar, route 1 of 6 and next Gearing/Verzet, separate free-account/paid explanation and manufacturer tyre/rim limit warnings. NL explicitly states uncertainty is unquantified, no 95% interval; no false safe band is shown. Defaults have the consent notice over part of the form/result. These are only two default-state spot checks: no approval of other B cases, edited states, formulas or actual safety limits.

## Login

All ten subsequently available login images inspected at original resolution: NL/EN 390 default, details-open, menu-open; NL/EN 1440 default and details-open. Form-first mobile layout, email field, send-code action, anonymous-calculator escape link and compact benefits disclosure are readable once consent is dismissed. Desktop has a balanced image/benefits and form split. Menus expose both route groups without clipped text. Default cookie notice temporarily overlaps the form action/legal area. No paid urgency or leave-data prompt is visible.

**Nonblocking discoverability polish, not a missing control:** the unchecked newsletter card has no separate checkbox outline. Source inspection confirms the whole card is a semantic checkbox: `src/app/(auth)/login/page.tsx:371` uses CheckboxGroup and Selectable mode=checkbox; `src/components/ui/Selectable.tsx:86` deliberately hides the trailing Check until checked. It is not an offscreen checkbox. Login tests at `src/app/(auth)/login/page.test.tsx:449` assert NL/EN unchecked/no inferred consent and exercise explicit checkbox selection with verification handoff. Those existing assertions support semantics; these screenshots do not show the selected state. No functional newsletter failure is claimed.

Expanded benefits assert free-account personalized targets and report-value email. Parent reports these are substantiated by existing recommendations/access and latest-core-email implementation, not new full-report claims. This image review verifies readable presentation, not actual email delivery, authentication or persistence. All four login layouts pass visually, with the noted unchecked-card discoverability polish; no unseen verification/error/authentication states are approved.

## Login image hashes

| Filename | SHA256 |
| --- | --- |
| `login-en-1440-details-open.png` | `d8b4d0329dda168060e89c22b6ab0a29fb4d1a1fe1a12de37ed24cf70755ed98` |
| `login-en-1440.png` | `cd4a3a038764aad73ae4262e5deddb2c6a594c35056cef3d6a2dbbe3e8ecd507` |
| `login-en-390-details-open.png` | `93dc2d53a0ac35e5b0149bfd1497f2ed3da6de5b4a262779d6543fd2925ef266` |
| `login-en-390-menu-open.png` | `d3bd9ee1d2d9861fb17fa800be06d6bbe1617cbcef963706564e4a80bb1a5c33` |
| `login-en-390.png` | `035c15e9de30a09210d5988736d9bdca99194a11c3f7b99cbbe48c9e3c21cfc5` |
| `login-nl-1440-details-open.png` | `c0249438f6ba6a1fb40f314f7ef4f0bb959c868b20f21038378130385749aff0` |
| `login-nl-1440.png` | `44e69ea3da411bace1a8108fd4aed5a1c696b46305338400c0e02440a501ed45` |
| `login-nl-390-details-open.png` | `74f91b0d86bae2c938ed11912c30880f7d1cf2defbe61745d7532b5ad29a43aa` |
| `login-nl-390-menu-open.png` | `60f8d382581cb17eab40cb925bfab949c5b0e137df4862eb84a8d92572c4a58c` |
| `login-nl-390.png` | `335ab14b399bf0d7d27fdbc06500aa2b78706652883b2f811e59e98f3f641fa0` |

## Exact inspected image hashes

| Filename | SHA256 |
| --- | --- |
| `home-en-1440-details-open.png` | `dc58c4843467f3dd103aaebee06cc95f52fe86320344ea3843bf11869d5c8d42` |
| `home-en-1440-edited.png` | `08ede29fc7ebdc0432700ccd623272a774e2f77f59de135844bc6412bc8110a7` |
| `home-en-1440-reused.png` | `60dab4e38fb82ed6373b319fb6cf2352d278288e865be8d410cb44345064a7e4` |
| `home-en-1440.png` | `40b003307f2638d6526b969a150fa431ae948610caede4846455be59dc28b7b3` |
| `home-en-390-details-open.png` | `e8927d0e45cd3c01a029641881dcd021f8c98f0bfcf2c0dfe2c65e79c366294f` |
| `home-en-390-edited.png` | `1e01b5c3570e43e0c318e52b2ae736d86dada1db069737bfc6219180b481e168` |
| `home-en-390-menu-open.png` | `88374b1bc60524a62bdd069fb84740094e8a1a0649debb4537b01ab82da217a2` |
| `home-en-390-reused.png` | `a73dd457c90c4d86a5b67f8e05b032f4134d0a4bef6c5b30f0ee15c38184f39d` |
| `home-en-390.png` | `ca819c2d78c01faf51587efe79d3fad84f97ca92995cdedbcedf1426cc3aefc4` |
| `home-nl-1440-details-open.png` | `f9d7be6807368dc2bb95a1dc942eaf9c2730eef46ab43c0563fda92da67b790d` |
| `home-nl-1440-edited.png` | `d1108da63d3b0f12c142c99795ec35cd5b5ba969061599b836cdd74769f0b2b4` |
| `home-nl-1440-reused.png` | `010749eae4265b3454594e6d4789b0e9f3bdbb381d6263db5d3f24ee8b845e31` |
| `home-nl-1440.png` | `66b581952bb425022d83ef98c2be02dc7db51db6e589a1896cdc97a0e3bc8dd5` |
| `home-nl-390-details-open.png` | `52171e9d484d0c602a064061f326a9a693863d5e88da0a0cd8de15bb8ded90dd` |
| `home-nl-390-edited.png` | `5883311e7d498a24702200c42a4dbffc19d0faaafcfa0e910fb292d70583047f` |
| `home-nl-390-menu-open.png` | `d13090c6222eaa09aecc9ead19706ffbca170cdcec51d3af1833222490aff2e3` |
| `home-nl-390-reused.png` | `9a1f2383be54d3cc1ae85d9b96d6fd1fe981f4d95d8c66a5fd3a44ea29ab2284` |
| `home-nl-390.png` | `51ae81c5d5aaf173834e8243a317bf71de3ce1135a3d8187be2d198c5b71d395` |
| `tire-pressure-en-1440.png` | `d02535d4ff62637757816130d4dee59dd2e360f36701e8aa628693556deaaa2e` |
| `tire-pressure-nl-390.png` | `d2bd9d4e5cd5cec249879051eff42b7b6e1d63319d70e7c619496836c8a79885` |
