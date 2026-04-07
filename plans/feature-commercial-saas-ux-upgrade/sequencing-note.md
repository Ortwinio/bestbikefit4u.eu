# Sequencing Note — Commercial SaaS UX Upgrade

**Date:** 2026-04-07
**From:** Orchestrator (Codex A)

## Completed

1. **UX Contract** — `ux-contract.md` written. Defines CTA hierarchy, proof modules, disclaimer rules, page-level requirements, and reuse direction. All workers should reference this before editing.

## Ready for execution (handoffs written)

2. **Homepage structure** — `handoff-homepage-structure.md`
   - Owned by: Codex B (homepage/i18n scope)
   - Depends on: UX contract (done)
   - Files touched: `src/app/(public)/page.tsx`, `src/i18n/messages/en.ts`, `src/i18n/messages/nl.ts`

3. **Homepage EN/NL copy** — `handoff-homepage-copy.md`
   - Owned by: Codex B
   - Depends on: Homepage structure (must apply first)
   - Files touched: same as above

4. **Auth page implementation** — `handoff-auth-reframe.md`
   - Can start once UX contract is done (no dependency on homepage)
   - Files touched: `src/app/(auth)/login/page.tsx`
   - No file overlap with homepage

5. **Pricing implementation** — `handoff-pricing-upgrade.md`
   - Can start once UX contract is done (no dependency on homepage)
   - Files touched: `src/app/(public)/pricing/page.tsx`, `src/config/commercial.ts`
   - No file overlap with homepage or auth

## Not yet handed off

6. **Calculator conversion bridges** (plan step 05)
7. **Icon audit and implementation** (plan step 06)
8. **Theme token implementation** (plan step 07)
9. **FAQ/contact conversion pass** (plan step 08)
10. **EN/NL copy passes** for auth, pricing, calculator, FAQ/contact
11. **Unit tests** for auth, theme, calculator/FAQ/contact
12. **Final QA and closeout** (orchestrator deliverable)

## Conflict zones

| File | Owner | Risk |
|------|-------|------|
| `src/app/(public)/page.tsx` | Codex B (homepage) | Do not edit until homepage tasks are done |
| `src/i18n/messages/en.ts` | Codex B (homepage first), then sequentially for other pages | Multiple tasks touch this; apply in sequence |
| `src/i18n/messages/nl.ts` | Same as above | Same risk |
| `src/config/commercial.ts` | Pricing worker | Only pricing touches this |
| `src/app/(auth)/login/page.tsx` | Auth worker | No overlap |
| `src/app/(public)/pricing/page.tsx` | Pricing worker | No overlap |

## Orchestrator remaining deliverables

- [ ] Handoffs for steps 05-08
- [ ] Integration review after each step completes
- [ ] Final QA closeout artifact
