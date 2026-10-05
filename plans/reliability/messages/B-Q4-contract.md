# Q4 widget → calculator

Replacing existing home SaddleHeightTeaser with shared estimated-height model and RangeBar, default175cm. Widget CTA writes only the selected height to existing handoff store (field heightCm, unit cm, method declared, calculator saddle-height); no values in URLs. Localized href ends `/calculators/saddle-height#inseam`.

Calculator full view recognizes #inseam, adopts the stored height (finite number, clamped130–220cm and rounded to slider step1), suppresses stale prior inseam for this new starting flow, and focuses the inseam slider. No new query parameters or metadata variants. Defaults never saved merely by rendering.

Parallel workers: home widget/layout/dictionary/tests; consent-aware home_saddle_widget_used analytics. Parent owns incoming handoff/focus and integration. A owns Q5 final real-page NL/EN1440/390 sweep and gates per README. No commits/deploys/env/prod/mails.
