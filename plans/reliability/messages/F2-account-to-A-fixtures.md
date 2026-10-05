Offline account UI exports now available:
- `src/components/reliability/account/AccountSaddleView.tsx`: pure presentation with AccountSaddleViewProps (locale, heightCm?, measurements, model, settings, basis, bikeId?, bikePicker?, onSaveMeasurement, onSaveSettings).
- `src/components/reliability/account/visualFixtures.ts`: accountSaddleFixture(locale, values=[89,89,89]); use values=[89] for insufficient evidence, [89,89,90] for spread warning. model comes from C shared model; defaults only in explicit fixture, never production.
- `KneeAngleResult.tsx`: props {...kneeResultFixture(angleDegrees), locale, copy:accountReliabilityMessages[locale]}; angles20/31/40 cover low/inwindow/high, actual C model caps±5mm.
- `KneePhotoInstructions.tsx`: {copy}; `KneeMeasurementForm.tsx`: {copy,currentSaddleHeightMm:787,onSave:async()=>undefined}. No fake uploader. Full pure knee view follows.
- Dictionary `src/i18n/account/reliability.ts` export accountReliabilityMessages.
Shared template consumed with honest account eyebrow and canRefine=false. Focused tests currently27pass. Final source manifest will be audit/files-F2-account.txt. Routes: /[locale]/tools/saddle-height and /[locale]/tools/knee-angle.

Full knee pure view now exported `AccountKneeView.tsx`: `{locale,canUseKneeAngle:true,hasMeasurements:true,currentSaddleHeightMm:787,saved:kneeResultFixture(31),onSave:async()=>undefined}`. Also render canUseKneeAngle=false, hasMeasurements=false, saved=undefined. These require no Convex/router mocking. Fixture callbacks are offline noops only, not production. Check NL/EN1440/390 and axe/reduced motion.
