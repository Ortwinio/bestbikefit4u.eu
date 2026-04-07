# Merge Readiness Checklist

Lead closeout gate for the public acquisition and activation UX redesign.

This checklist assumes the current remaining work is acceptance cleanup, not major feature build-out.

## Gate A: Homepage Acceptance Fixes (Codex B)

Reference:
- `handoff-homepage-acceptance-fixes.md`

Required before merge:
- [ ] Hero trust-strip wording in `src/app/(public)/page.tsx` matches the approved homepage copy pass
- [ ] Homepage dictionary copy in `src/i18n/messages/en.ts` matches approved EN wording
- [ ] Homepage dictionary copy in `src/i18n/messages/nl.ts` matches approved NL wording
- [ ] EN/NL semantic parity confirmed for hero, recommendation card, and final CTA band
- [ ] Homepage tests assert accepted copy, not only routing/structure
- [ ] Homepage tests pass

## Gate B: Calculator + FAQ Acceptance Fixes (Codex D)

Reference:
- `handoff-calculator-faq-acceptance-fixes.md`

Required before merge:
- [ ] `src/app/(public)/calculators/saddle-height/page.tsx` matches the calculator CTA hierarchy contract
- [ ] Calculator page tests exist for bike-fit, frame-size, saddle-height, crank-length, and tire-pressure
- [ ] Calculator CTA rendering tests pass for all touched calculator pages
- [ ] FAQ CTA tracking intent matches implementation
- [ ] FAQ/contact closeout note exists in this plan folder
- [ ] FAQ/contact tests pass

## Gate C: Auth + Pricing Regression Check (Lead)

Required before merge:
- [ ] `src/app/(auth)/login/page.tsx` still preserves auth mechanics and sourceTag behavior
- [ ] `src/app/(public)/pricing/page.tsx` still preserves proof/confidence framing and CTA destinations
- [ ] Auth/pricing targeted tests still pass after all parallel lane integrations
- [ ] Security-sensitive note for localhost dev login remains captured in closeout

## Gate D: Final Validation

Required before merge:
- [ ] Public funnel tests are complete for homepage, auth, pricing, calculators, FAQ, and contact
- [ ] Route review completed for all touched public/auth surfaces
- [ ] Mobile review completed for homepage, login, pricing, calculators, FAQ, contact
- [ ] Desktop review completed for homepage, login, pricing, calculators, FAQ, contact
- [ ] Light theme review completed
- [ ] Dark theme review completed
- [ ] System theme behavior reviewed
- [ ] Analytics sanity check completed for touched CTA paths and tracked page views
- [ ] No unsupported commercial claims introduced
- [ ] No touched website/auth surface regressed to non-approved UI patterns

## Gate E: Closeout Artifact

Required before merge:
- [ ] One final Lead closeout note is saved in this plan folder
- [ ] Closeout note lists files changed by lane
- [ ] Closeout note lists tests run
- [ ] Closeout note lists residual risks
- [ ] Closeout note lists any deferred follow-ups
- [ ] Closeout note states merge recommendation: ready / not ready

## Merge Decision Rule

Merge only if:
- Gate A is complete
- Gate B is complete
- Gate C is complete
- Gate D is complete
- Gate E is complete

If any gate remains open, the board should stay in acceptance review rather than closeout.
