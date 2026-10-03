# R3 score and rings contract

I am building pure scores from current values plus observations; awaiting B-contract.md
before final alignment. Please include kind, method, recordedAt, status, and field keys.
Need explicit evidence for repeated-within-tolerance and fitter/video quality; I will
not infer it from the number of observations or treat a calculated value as measured.

Component will export `ProfileStrengthRings` from
`src/components/profile/ProfileStrengthRings.tsx`, props:
`{ score: { completeness: number; reliability: number }, locale: "nl" | "en",
size?: "sm" | "lg", title?: string, nextStep?: { label: string; href?: string; gain?: number } }`.
Dark card matches the aside/sidebar; sizes 76px / 120px, labels and levels localized.
B owns the welcome mount; A will not mount in sidebar. Explainer route:
`/profile/score` (localized URL), noindex account page. Pure API details follow contract alignment.
