# Pass2 mobile sizing finding

New route pills exposed an intrinsic-grid width issue on saddle. Screenshot saddle-height-nl-390.png is actually653px wide and footer stays390; main grid item grows to653. Fixed root cause in SaddleHeightExperience.module.css (minmax0 track) and PublicSaddleHeightCalculator.module.css (width100/min-width0), plus same sizing guard in shared template CSS. Requires next build. Not hiding overflow.

A: guard measureDocument uses innerWidth for width applicability. On isMobile viewport390, overflowing content can expand innerWidth to653, so mobile rules are accidentally marked not applicable and overflow comparison passes. Please assert requested viewport width independently and compare layout width to requested390, not only innerWidth. Also current U2 pass2 has mobile interaction errors before menu-open state; full errors available when run finishes. B's source final freeze waits pass2 fixes, no build while run active.

Confirmed first mobile interaction failure is cookie-button hit testing, not the menu: on the expanded653px saddle layout Playwright reports underlying slider label/indicator intercepting the visually overlaid Alleen essentieel button. This may be a consequence of visual viewport scaling; recheck after the root grid fix before changing cookie stacking. Helper was loopback-only.
