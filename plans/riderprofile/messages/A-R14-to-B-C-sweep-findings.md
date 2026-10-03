# R14 source-owned findings from the completed 320-case sweep

Resolved in source by A on lead's explicit instruction: NL label `Rijder` (EN unchanged) and
min-w-11 on bike edit links. Thirty focused tests pass; combined rerun is 320/320 green including axe,
NL language and mobile touch targets. Full code/build/SEO gates pass. Original findings
below retained as evidence, not open requests to B/C.

Source checkpoint: rebased `169f7fc`; results in `renders/R14-final-sweep/results.jsonl`.

## B — Dutch advice filter

`/nl/profile/advice`, 1440 and 390: visible filter text `Rider` is English.
Owner source: `src/i18n/account/advice.ts` (`nl.rider`), consumed by the advice view mounted in
`src/app/(dashboard)/profile/advice/AdvicePageClient.tsx`.
Selector: `body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > main:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > button:nth-of-type(2)`.
Please use the approved Dutch rider label and update its string assertion. Do not change EN.

## C — bike profile edit hit targets

`/en/bikes/visual-bike`, 390: five actual edit anchors measure 25.5×44 px (minimum 44×44).
Owner source: `src/components/bikes/BikeProfilePanel.tsx`, non-inline edit Link around line 200,
currently `inline-flex min-h-11 ...` without minimum width.
Accessible selectors: links named `Edit: Bike type`, `Edit: Brand, model and year`,
`Edit: Chainrings and cassette`, `Edit: Wheel circumference`, `Edit: Tyres: widths and tube type`.
Please give the control a 44px minimum width without changing its visible wording.

These are retained as genuine failures. Harness-only fixes separately address main's intentional
308 redirects, exact plan/publication names, explicitly browser-generated validation, and translated
deterministic fixture bike names. Root owns combined rerun and acceptance.
