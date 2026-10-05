# S2 gift visual verification

Command (run from the pricing worktree):

```sh
node /Users/ortwinverreck/Developer/bikefitboost-pricing/tests/visual/pricing-gifts/capture.mjs
npx vitest run src/components/gifts/Gifts.test.tsx 'src/app/(public)/gift/page.test.tsx'
npx eslint 'src/components/gifts/*' 'src/app/(dashboard)/gifts/page.tsx' 'src/app/(public)/gift/*.tsx' src/i18n/account/gifts.ts tests/visual/pricing-gifts/capture.mjs tests/visual/pricing-gifts/entry.jsx
```

- 28 screenshots: NL/EN × 1440/390 × give, exhausted credits, no eligible annual plan, valid recipient, expires within five days, owned-bike redemption, expired gift.
- Final run: zero axe violations, zero horizontal overflow, zero visible controls smaller than 44 px, zero browser runtime errors.
- 35 interaction/privacy/translation/account-lifecycle tests pass; scoped ESLint passes.
- Screenshots: `plans/pricing-stripe/renders/S2-gift-*.png`.
- Machine-readable results: `plans/pricing-stripe/audit/S2-gift-visual.json`.
- Visually inspected mobile Dutch give, mobile Dutch expiring, desktop English redemption, and mobile English expired: readable wrapping, no clipping, consistent brand surfaces and controls.

The initial accessibility run exposed a missing accessible name on the shared textarea rendering and contrast loss on disabled field helper text. GiftGive now supplies an explicit textarea accessible name and keeps unavailable fields read-only. Send availability remains enforced by the button and backend. Subsequent captures pass all checks.

Scope: isolated production GiftGive/GiftRedeem components, real compiled app CSS and local fonts, fixture props confined to tests. Every browser request outside the local fixture origin is blocked. This is component visual coverage, not live Convex, authentication, full page-shell, email-delivery, or Stripe verification. Chromium and screenshot writes required sandbox escalation. No external network or production actions were used.
