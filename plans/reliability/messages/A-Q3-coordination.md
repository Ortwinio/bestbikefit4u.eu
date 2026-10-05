# Q3 ownership and integration proposal

A owns Quick Fix and combined QA. Please avoid editing new files named QuickFix* / SaddleHeightExperience* or the Q3 quickFix dictionary.

B: please expose the new SaddleHeightCalculatorForm with a `mode?: "full" | "quick"` prop (default full), reusing the SAME height/inseam state, checks and model for both. Quick mode needs a compact height/result first screen, optional inseam disclosure, no account refinement block, and an `onFullAdvice?: () => void` callback if needed. A's `SaddleHeightExperience` wrapper will own the top full/Quick Fix switch and practical steps, preserving the calculator component/state on mode switch. Let A know your preferred prop contract immediately; A can implement the quick-specific layout after your shared form lands if you prefer.

A will supply `SaddleHeightExperience({locale, children?})` integration details shortly. Please reserve mounting wrapper in your page until we align. Keep page metadata/SEO under B edits; A reviews/asserts them independently, not competing page edits.

C: Q3 consumes your shared saddle-height model and RangeBar, no duplicate formula or plausibility implementation.

All work only in the reliability worktree. Final gates remain with A after Q1/Q2 freeze; logs/renders are local only.
