# Q4 — homepage saddle starting widget

## Implementation

Reworked the existing `SaddleHeightTeaser` hero card; no second widget added. Height slider replaces inseam input and the previous guardrail-band calculation. Shared reliability model and compact RangeBar supply the actual result, uncertainty and projected next-step width. Default175cm yields726±45mm,680–770;190cm yields789±49mm,740–840. No hardcoded49mm uncertainty.

The one card retains its place in the desktop hero. Mobile DOM order is headline, widget, existing hero description/actions. Removed the large decorative bike drawing; widget SSR markup is complete, with no delayed client-only replacement or new dependency. Direct Slider/RangeBar imports reuse existing primitives; the analytics dependencies already exist on the homepage. Copy is NL/EN in `homeSaddleWidget.ts`.

Primary `Verfijn je zadelhoogte` / `Refine your saddle height` CTA writes the selected height only to the existing handoff store, then navigates to the localized public calculator with `#inseam`. No measurements in the URL, analytics or logs. Slider edits do not write handoff data. CTA explicitly confirms even the displayed default.

Landing opens the existing full-advice view, clamps finite incoming height130–220cm and rounds to step1. Prior inseam is not silently applied to this new height-only start. The inseam control receives keyboard focus once; later edits do not steal focus. Ordinary calculator/account visits remain unchanged. Missing storage produces the existing clearly labelled example, never a fabricated carried measurement. SSR hydration and actual widget→store→calculator flow are tested.

`home_saddle_widget_used` uses existing marketing events: consent required, only NL/EN homepages, per-page dedupe, payload contains event/source/locale/path only. Backend rejects extra optional data or off-scope paths. All analytics tests are mocked; no real events were sent.

## Owner headline follow-up

`src/i18n/marketing/home.ts` is untouched. This branch still has its pre-PR24 headline; lead will rebase the owner-approved exact English h1 `A good bikefit boosts your ride` for both locales. Typography is prepared for that text: desktop72px maximum rather than92px,590px maximum heading width, wider first column and tighter hero gaps/padding. Original primary/report CTA labels and destinations are unchanged. Mobile heading remains compact to keep the existing widget high on the page.

## Validation

- Final focused integrated suite:167 tests across15 files passed, including all11 homepage-to-calculator handoff tests.
- Full lint passed, including contrast254/254, CSS token guard, tooltips and brand checks.
- Frontend cache-free TypeScript and standalone Convex TypeScript passed after widget/analytics integration.
- Diff whitespace check passed.
- Reviewed a local static fixture of actual homepage/cookie components with the upcoming headline substituted in the DOM, a96px reserved header, and local brand fonts: NL/EN at1440×900 and1440×1000. H1 occupies2lines; both hero CTAs and widget CTA finish at or above562px, before banner top730/830px. Ignored proof: renders/Q4-headline-metrics.json and Q4-headline-*.png. This is typography/layout evidence, not a hydrated-production or RangeBar correctness check (jsdom fixture serialization omits some calc/clamp styles).
- A owns Q5 final build, full-suite gates and real-page NL/EN1440/390 sweep. Requested explicit first-visit cookie-banner check for the incoming long h1 and2–3line desktop layout. Those combined gates are not claimed complete here.

Source manifest: `files-Q4.txt`. Q5-owned harness files and evidence are intentionally excluded. No commits, deployments, production/environment changes or mails. Logs/renders remain ignored review evidence only.
