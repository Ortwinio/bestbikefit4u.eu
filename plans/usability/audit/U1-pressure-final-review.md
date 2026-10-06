# Final pressure visual review

Build `4TmZn4gBoKfwaJvyfde7X`; source `a659cfbeacc91f88b59a4b2bf7d56ff0e28cdbfc5359db46c5c264f52836d17f`. Evidence directory: `plans/usability/renders/guard/final/`. Read-only application/harness review; no duplicate B approval is implied.

## Actual viewed matrix

Opened all 22 pressure screenshots using the image tool: `tire-pressure-{nl,en}-{390,1440}.png`, and each matching `-edited`, `-reused`, `-details-open`, `-next-calculator`; additionally both 390 `-menu-open` captures. Mobile expanded captures are very tall; the full image establishes overall layout but is not sufficient for exhaustive fine-print review without crops.

## Findings

- Mobile pressure spacing is readable: labels and selected choices remain separated, no overlap between gauges, units or next-step actions. Shared public header remains one row; cookie consent is dismissible and does not cover header/navigation. Mobile feedback follows the footer.
- Defaults visibly mark 75 kg and 28 mm as examples, with 5.2/5.6 bar. Edited captures show76 kg and5.3/5.7 bar. Reused captures identify80 kg,9 kg bike and28 mm tyres as earlier inputs, show5.6/6.0 bar, and suppress the repeated free-account reason.
- Next-calculator captures visibly arrive at Gearing / Verzet, step2 of6, with76 kg retained and attributed. The saved rule3 evidence independently records matching declared field/value/unit/source/timestamp, correct destination and reason suppression on revisit.
- Warning, short answer and limitations remain outside disclosures in all pressure page states: check both tyre/rim limits and obey the lower maximum, especially hookless; weight distribution is assumed; this calculation does not know rim limit or casing. The uncertainty statement explicitly says it is unquantified and no95% interval is available.
- Each locale/width report has five closed disclosures with `inServerHtml:true`. Expanded images reveal formula/example, FAQ, related links and limitations. This supports retained SSR content, not a claim of unchanged source hashes versus an older build.
- Initial and interaction metrics show no undersized targets or horizontal overflow; initial contrast inventories are empty. These are measured report findings, not inferred pixel dimensions.

## Desktop readability failure

Do not approve rule15 for either desktop pressure case as currently captured. `tire-pressure-nl-1440-edited.png` shows the fixed “Geef feedback” button obscuring the suffix of “Je huidige berekening”. `tire-pressure-en-1440-edited.png` similarly obscures the end of “Your current calculation”. This is actual text occlusion, not merely card-edge proximity. No action is hidden in that crop, but the underlying text is not fully readable.

Readable diagnostic crops were made and actually viewed at `/private/tmp/pressure-nl-feedback-crop.png` and `/private/tmp/pressure-en-feedback-crop.png`, each extracted from x1080,y1330,width360,height160. They are supplementary crops of the named final artifacts, not replacement captures. Parent was notified before any manual approval.

## Source substantiation and limits

`src/components/features/pressure/PressureCalculatorForm.tsx` uses `usePublicHandoff("tire-pressure")`, validates supplied values, computes via `calculateBasicPressure`, and renders the shared `PressureDisplay`. Its prefill checks cover weight, bike weight, tyre widths, surface, category and rim type; real input changes remain distinct from prefill. `src/lib/handoff/usePublicHandoff.ts` records value/unit/method/calculator/timestamp and distinguishes session/profile sources.

`src/components/calculators/LeaveDataNotice.tsx` suppresses untouched/authenticated/excluded-route prompts, records session display before opening, and clears displayed mode when eligibility ends. Its test file includes the six touch/desktop route/auth/data eligibility-transition regressions, asserting no redisplay and preserved handoff data. This is source/test inspection, not a new test execution or completed authentication/email flow.

No approval of unseen dark/error/authenticated states, actual account persistence, email delivery, or engineering accuracy follows from this visual review. Finalizer JSON must retain the desktop failure unless fresh evidence resolves it.

## Captured artifact bindings

Hashes below are the final report bindings for the explicitly viewed images.

| File | SHA-256 |
| --- | --- |
| tire-pressure-nl-390.png | `a0a734f557c0ee03272233e2583d2247560bcb52ef2f24617dc960a3b3f04346` |
| tire-pressure-nl-390-menu-open.png | `acb8d634dc967b886dbd99e13f223c0248c491ef284a4d3884328cfe492d0cf6` |
| tire-pressure-nl-390-details-open.png | `6eabd239c2b18c21a4196dd093d1c5062ec4a040fbf082f876752fff1b9b6d21` |
| tire-pressure-nl-390-edited.png | `b3dd0b14eb520dc414b10ffe8b8ec9d9147a8ad431faa7f883d402356045a5e0` |
| tire-pressure-nl-390-next-calculator.png | `0c96c876f814814c1d981ab0a0eb875fbc20ad4ae37715a55683033f6b0df2f2` |
| tire-pressure-nl-390-reused.png | `eb4f4efd6597815a4890168e057383db99df43d7739b976189e720c42643601a` |
| tire-pressure-nl-1440.png | `576b6d9117cf1789036cdcf10f9d6d6313ecd929774e65dfb37b34e8e6a00ddc` |
| tire-pressure-nl-1440-details-open.png | `40355d61a6423c222bc7b03671e734ebaf712a29857e53c771f1cf76550a924c` |
| tire-pressure-nl-1440-edited.png | `76c08786ea07f6fabb14404550b93ae140c78b9f4a7ff3be0464d14ef12bede1` |
| tire-pressure-nl-1440-next-calculator.png | `347fde8287f0f087961eba3734db80c94a0668263a813e7fcaf85abd1c28cfee` |
| tire-pressure-nl-1440-reused.png | `77566ad3dc8229ddfaad806928ee1a67dd60a0ed945c4d5482f25ce6e2ce13b0` |
| tire-pressure-en-390.png | `70f6c76d9a34866f2c0303e5093f896c7739cca4d67c383bfcaaffcf5a2e580e` |
| tire-pressure-en-390-menu-open.png | `16ca4d66cc64a1463c16ea96d37deb0650991dc6045286daaf8ced398e1e1f7d` |
| tire-pressure-en-390-details-open.png | `52339a10ae913b8e85846bdccad096fcb5b0cfaeeb95ebe01ada18927e55a0d0` |
| tire-pressure-en-390-edited.png | `592b12c1c8da98ede3b0ec272a46e656083c088c250d2b25304d6d7c02f8cc11` |
| tire-pressure-en-390-next-calculator.png | `b0a1955cfdc7228daede858e019f332939f931ffb391eaff28a9ad061490678a` |
| tire-pressure-en-390-reused.png | `372ee82624991ba77de6216bafe852f21d7d0b3a26e04541ddbd09986582662c` |
| tire-pressure-en-1440.png | `d02535d4ff62637757816130d4dee59dd2e360f36701e8aa628693556deaaa2e` |
| tire-pressure-en-1440-details-open.png | `927ea2fe9ff0efe7ea5f4ccfef05d7da895d020cc3fd1a38c67e7324c6c7ee47` |
| tire-pressure-en-1440-edited.png | `72b153bcf253e0e078fb630cb1ba7c7c789ae617b5864292e86562fc877ec77a` |
| tire-pressure-en-1440-next-calculator.png | `a595ca0871010d176cbcbbda47fcc44ba874ae170bf6ebc789b3ee43d62eb1d2` |
| tire-pressure-en-1440-reused.png | `d73d4181159db0a5a42611b75ca924335fdd2d1275abc5457ad3b969c55950c9` |
