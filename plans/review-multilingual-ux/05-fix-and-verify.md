# Step 05 — Fix and Verify

## Objective

Fix all P0 and P1 findings from Steps 01–04. Document P2 items for backlog.

## Priority Matrix

| Priority | i18n | UX |
|----------|------|-----|
| P0 | Missing NL key on active route, broken locale switch | Flow-blocking UX gap (user cannot complete task) |
| P1 | Hardcoded string visible to NL users, wrong `<html lang>` | Significant friction, missing empty/error state |
| P2 | Missing hreflang, untranslated auth page | Polish improvements, mobile layout tweaks |

## Fix Protocol

For P0/P1 i18n fixes:
1. Add missing translation key to NL dictionary
2. Replace hardcoded string with dictionary lookup
3. Run `npm run test:i18n` to confirm key parity
4. Run `npm run build` to confirm no regressions

For P0/P1 UX fixes:
1. Fix the component or page
2. Verify fix in both EN and NL, both mobile and desktop
3. Note any new strings introduced — add to both EN and NL dictionaries

## Final Verification

After all fixes:
- [ ] Re-run `npm run test:i18n`
- [ ] Run `npm run build`
- [ ] Re-check dashboard language switch QA checklist (Step 03) for any items that were failing
- [ ] Spot-check NL route: zero visible hardcoded English strings

## Output

Document in `output-05-fix-and-verify.md`:
- P0/P1 fixes applied (file | change | test confirmation)
- P2 backlog list
- Final pass/fail on acceptance criteria from README
- Mark plan as COMPLETE in README when all criteria met
