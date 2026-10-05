# Q4 owner follow-up: existing card and upcoming headline

Q4 replaces the existing `SaddleHeightTeaser` card mounted once in the homepage hero. It does not add a second widget. The old illustration/guardrail range/inside-leg slider are replaced in that same component.

Owner says main PR24 changes both locale h1 strings to exactly `A good bikefit boosts your ride`; lead will rebase this worktree afterwards. B will NOT edit `src/i18n/marketing/home.ts`, avoiding a competing headline change. Hero typography/layout will support that exact incoming headline at1440 in2–3lines with original hero actions and widget CTA above the cookie banner. A's Q5 should include this headline after rebase (or a clearly labelled DOM text-only fixture before it) plus first-visit cookie banner.

The new widget dictionary is separate (`homeSaddleWidget.ts`); no homepage h1 copy is changed by Q4.
