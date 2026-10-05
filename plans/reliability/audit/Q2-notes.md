# Q2 — public saddle-height calculator

Implemented against `messages/C-model-contract.md` and Main board. Public UI has height and optional measured inseam cards, DM Mono advice/uncertainty, C's continuous RangeBar, exactly one computed next step, a narrowing chip, range explanation, plausibility confirmation/override, and conditional free-account refinement. NL/EN copy lives in calculator dictionaries. All CSS-module colours use tokens.

The account calculator is extracted unchanged into `AccountSaddleHeightCalculatorForm.tsx`; the existing import remains a dispatcher, selected by initialValues/onValuesChange. Account calculations and original CSS are unchanged. Public controls for bike category, goal, flexibility/core, measured/estimated selection, current-saddle comparison and fixed guardrail band are gone.

## Behavior and handoff

- Height-only 190 cm: 789 mm ±49, 740–840. Entered 89 cm inseam: 786 mm ±23, 765–810. Next widths come from C's model, never literals.
- Yellow unconfirmed warning stays broad/dashed per written rule (not the board script's narrower yellow state); confirmation narrows it. Large warning initially uses height; override uses inseam but remains broad/dashed, with remeasurement as next step and no refinement CTA. Changes reset confirmations/overrides.
- The initial 190 cm height is visibly an example and never persisted on render. Inseam starts absent despite the slider's reference position. CTA explicitly carries the displayed height and accepted inseam via existing session handoff, with no measurements in its URL.
- Only actually measured cross-calculator inseam is prefetched; estimated/declared entries are not silently upgraded. Suspicious inseam is withheld until confirmation, removed on remeasure, and not saved as measured on a large-warning override. Existing account callbacks are isolated from public storage.
- Quick/full modes retain one public component and its state. Quick mode is compact, has an optional inseam disclosure and no refinement panel. A owns the wrapper, practical instructions and final integration sweep.
- Exposed optional payload-free onInseamAdded callback for A's wrapper analytics hook. Fires only on actual accepted measurement interaction, never hydration/prefill or mode switching.
- SEO canonical/hreflang and calculator/FAQ/HowTo JSON-LD retained. Page copy/SEO answer now describe uncertainty rather than a safe band, with visible high/low-saddle safety and measurement-guide links.

## Validation

- Focused Vitest: 9 files, 196 tests passed (saddle form/page/handoff/wrapper, reliability model, RangeBar, handoff store, SEO fit answers).
- TypeScript: `tsc --noEmit --incremental false --project .../tsconfig.json` passed. Initial incremental run encountered sandbox EPERM writing tsconfig.tsbuildinfo; cache-free validation avoids modifying that artifact.
- Full `npm run lint` passed, including 254 contrast checks, CSS token guard, tooltips, runtime boundaries, brand/pricing and image guards.
- Scoped diff whitespace check passed.
- A owns final combined build, all-suite gates, local SEO/domain crawl and NL/EN1440/390 axe/visual capture. These are not claimed complete by Q2. Wrapper gutter/compact first-screen review sent in messages/B-to-A-visual-check.md.

No commits, deployments, production access, environment changes or mails. No logs/renders added by Q2. File manifest: files-Q2.txt.
