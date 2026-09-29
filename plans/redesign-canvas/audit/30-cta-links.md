# Sfora #30 — Account CTA routes

- Owner: Codex B. Ready for Claude review; no commit.
- Both destination fixes already exist: compare-fit points to localized `/bikes` and shoe-cleat-fit to localized `/fit`.
  Both target route files exist. No destination rewrite was necessary.
- Added compare-fit regression coverage for NL and EN, using the real page and shared Button.
  The test exposed an anchor announced as a button; set `nativeButton={false}` and `role="link"` on that CTA.
- Existing shoe-cleat-fit tests verify the localized fit route in both languages.
- Validation: two test files / four tests pass; scoped ESLint passes.
- This follow-up changes only the comparison CTA props and adds its test. Pre-existing concurrent page changes
  belong to their owner and are not part of this patch. Lead should review that one-line hunk separately.

Files:
- `src/app/(dashboard)/bikes/compare-fit/page.tsx` (CTA props only)
- `src/app/(dashboard)/bikes/compare-fit/page.test.tsx`
