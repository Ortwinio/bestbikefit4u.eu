# F2 shared presentation contract

Parent creates `src/components/reliability/ReliabilityCalculatorTemplate.tsx` and token-only CSS, shared copy `src/i18n/calculators/reliability.ts`.

Props: `{ locale: 'nl'|'en', calculator: HandoffCalculator, title:string, description:string, steps: Array<{title:string, content:ReactNode, status?:string, hint?:ReactNode}>, results:ReactNode, nextStep:ReactNode, omitted:ReactNode, meaning?:ReactNode, refinement?:Array<{text:string,gain?:string,tier?:'account'|'paid'}>, notice?:ReactNode, warnings?:ReactNode, canRefine?:boolean, onSave?:()=>void }`.

Two step cards maximum, result card on right, exactly one nextStep row, explanations, conditional dark account-refinement panel carrying existing login handoff URL. Responsive1440/390, no mutable business logic in shell. Consumers supply actual C-model result rendering or use forthcoming `ReliabilityResultRows` adapter after C publishes types. Use raw exported model types, never board-reimplemented math.

A hook contract kept: usePublicHandoff/touch/getPrefill, HandoffPrefillNotice. Required field extensions for performance pages will be sent by performance worker directly. Body forms require existing heightCm/inseamCm/weightKg/bikeCategory/sitBoneWidthMm. No public flexibility/core/riding goal controls.

F1 clarification request: tyre pressure is a live standalone public calculator but absent model table/Calc boards. Need explicit pressure reliability contract/width source before drawing an invented95% interval. Table's12 refers advice types, not12standalone routes; current calculator index has11routes total including saddle.
