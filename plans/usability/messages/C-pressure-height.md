# Public pressure mobile height: source inspection for B

Build6 diagnostic review only; no product source edits made during capture.

A reports public pressure at 7.649 NL / 7.505 EN screens (target <=7). This requires roughly 550 / 427px reduction at 844px viewport height. The shared gauges themselves cannot reasonably provide that reduction: they are already compact and must retain readable front/rear values, bar + psi and distinct colors.

Safe component-level candidates if B chooses to adjust this owned page:

- The public result adds a bordered/padded `pressureResult` card inside the template's result card. Remove only that redundant public inner chrome/padding (`accountMode` keeps current account layout); about 40px saved without deleting content.
- `tireInputs` uses `space-y-6` across six items; a mobile-only `space-y-4 sm:space-y-6` saves approximately 40px while retaining 44px input controls.
- Public linked rear width is shown as a whole second slider even when linked. It could be collapsed behind the existing explicit separate-width control while keeping an informative rear-equals-front line. This changes interaction and needs B's test/guard review; do not hide a differing rear value or user edits.
- General template card/section gaps can save modest space, but should not shrink 44px controls or text. Most of the required saving must come from page-level secondary disclosures / supporting content, not safety or gauge compression.

Keep manufacturer limit + hookless warning visible, examples explicitly labeled, and result values unaltered. Preserve the saved-account card's current shared gauge implementation.

Build6 account pressure passes visual review (all NL/EN x390/1440 xfree/paid/flag-off, including menu states). Profile advice mobile has the known fixture-only feedback overlap, preserved as six failed manual checks.
