# Homepage visual review — build 3

Reviewer: Codex U1 homepage agent. Reviewed actual saved screenshots using readable, unscaled crops of hero, routes, expanded report, and closing sections. Source evidence: `plans/usability/renders/guard/U1/report.json`. Temporary crops are outside the repository in `/private/tmp/u1-home-review/`.

Build ID: `nrNDRX3KXTT0C7uLLdRUZ`

Source fingerprint: `d7e7b76db5577e8e87369bf4e89b22dfb62ca88b7a298454bca21b64d0a888ba`

## Verdict

Not an unconditional manual approval. Rule 4's homepage layout is satisfactory in all four cases. Observed paid copy satisfies the requested price and no-invented-testimonial constraints; no upgrade urgency or upgrade modal appears in the captured states. Rule 15 still has a mobile legibility issue: the floating feedback button covers underlying hero text after editing/reuse. A screenshot cannot establish leave-notice once-per-session behavior, so that portion of rule 12 remains outside this visual review.

## Four cases

| Case | Findings |
| --- | --- |
| NL 390×844 | Header is one row. Both route cards and all 11 chips wrap without clipping. Default 175 cm is clearly grey and marked voorbeeld; edited 176 cm shows 730 ±45 mm with keyboard focus ring; reused 184 cm shows 764 ±47 mm and “Uit je eerdere invoer”. Report opens with intact useful guidance and current €13,50 / €21,50 prices. Mobile menu shows both full routes. Feedback button overlaps hero prose in reused state and the prose/CTA boundary in edited state. |
| EN 390×844 | Same working responsive route structure and example/edit/reuse transitions. Long English route chips and report headings wrap cleanly. Expanded report retains actual advice instead of fabricated quotes. Feedback button covers hero prose in reused state. Menu uses “My position” while homepage uses “My posture”: minor route-name inconsistency. |
| NL 1440×900 | Two-column hero and route cards are clear. Widget transitions match the mobile numerical values; reused provenance is visible. Both route start buttons align coherently. Expanded report text stays in its column; the separate open trust section is gone. Current paid prices appear in the calm closing block. No clipping in the reviewed regions. |
| EN 1440×900 | English hero, route chips, three-line fit-plan summary and expanded disclosure fit cleanly. Default/edited/reused numbers and example states are visually correct. Current €13.50 / €21.50 prices and free-start framing are visible. No clipping in reviewed regions. |

On both mobile defaults, the dismissible cookie banner covers the widget refinement button temporarily, but does not cover the header. This is a usability observation, not a claim that rule 5's specific header condition failed. Desktop defaults likewise show the cookie banner over the lower proof strip.

## Canvas comparison and limits

Compared with Main/m/Home: the English slogan, live widget, two ordered routes, 5+6 calculators, and prominent starts follow the boards. The compact fit-plan summary with closed report/guidance follows the requested collapse. Unsupported board rider counts, brand counts and testimonial quotations remain absent. All observed prices use the current single/annual amounts; screenshot inspection does not independently prove payment or every report entitlement.

Observed widget numbers were inspected in the actual default, edited and reused images, not approved from source alone: 175 cm → 726 ±45 mm; 176 cm → 730 ±45 mm; 184 cm → 764 ±47 mm. Range endpoints and refinement suggestions change visibly. This confirms sampled display behavior, not an independent scientific validation of the formula.

The guard reports zero small targets, contrast violations and overflow in these cases and interaction states. Those checks do not detect the feedback button's text occlusion. Fix that overlap and recapture mobile edited/reused states before signing rule 15. No source or harness files changed during this review.

## Exact evidence binding

| Case | Default screenshot SHA-256 | Full state-evidence hash |
| --- | --- | --- |
| NL 390 | `9a0176e33a682315d23a8365b5dee069777e98d58450d7c569af95ef475d2560` | `7c482d7ba15f096dc8f55281da4c060d4760835b7357fbed92cfab106f7a2dbb` |
| NL 1440 | `66b581952bb425022d83ef98c2be02dc7db51db6e589a1896cdc97a0e3bc8dd5` | `2f9d35d9f198d0790b8deef2ff2dcb2ca94b247e0d8239d5826bb87565975ee3` |
| EN 390 | `c4ecf627f190481f478b94469955e4b1c68de3c536f25725f56cbbb900ac1275` | `415e212b11a961b8fd02c88df38b73ba79448e9bd6d07beb38b540cb3be9ff82` |
| EN 1440 | `40b003307f2638d6526b969a150fa431ae948610caede4846455be59dc28b7b3` | `7865b2eca983355d75983589235a25a9716edb2e6bbf35681203903fb7b838c6` |

Reviewed image states per case: default, edited, reused, details-open; additionally menu-open for both 390 px cases. Full individual state hashes remain in the bound report. Concrete obstructed-state files: `home-nl-390-edited.png`, `home-nl-390-reused.png`, `home-en-390-reused.png`.
