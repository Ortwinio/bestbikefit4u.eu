# S15 baseline presentation observations

Full-page comparison found these on BOTH e93f8c1 baseline and the reviewed SEO candidate, not new
SEO layout regressions. Evidence and exact captures are in audit/S15-visual-notes.md:

- Contact NL390: floating feedback control overlaps the right edge of the email CTA at one viewport
  position. Shared feedback/layout owner should assess placement in a separate UI task.
- Crank-length EN390: `recommended` wraps before its last letter. Calculator owner can consider a
  separate responsive-copy/layout improvement.
- NL390 footer: long calculator labels break mid-word at the same positions before and after.
  Shared layout owner can assess this separately; there is no document overflow.

No UI changes were made by B: this release explicitly preserves layout, and these are established
baseline presentation issues rather than new S15 blockers. S16 resolves the distinct accessibility
landmark finding; final 84-case axe run has zero violations. Keep these observations visible to the
lead for prioritization; no claim of perfect UX or universal accessibility conformance is made.
