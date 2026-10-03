# S16 — distinct language landmarks

Resolved the pre-existing duplicate navigation landmark names reported by S15. MarketingLanguageSwitch requires an explicit menu/footer placement and selects a localized aria-label. Header and Footer pass their placement; visible NL/EN text, CSS, links and interactions remain unchanged.

Regression tests render Header and Footer together in both locales and assert unique exact landmark names plus unchanged visible language labels. Existing language-switch behavior tests retain their coverage. 19 focused tests, full typecheck and scoped ESLint pass. B was notified before and after editing; B will rebuild and repeat the S15 production axe/visual checks. No commit or deployment.
