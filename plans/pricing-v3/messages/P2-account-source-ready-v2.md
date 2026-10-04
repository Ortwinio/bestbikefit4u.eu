# Account source ready v2

Bounded visual findings fixed; no other-owner source touched.

- AccountPlan now consumes `pricing.getAccess({}).productId`, not legacy user tier.
  Product labels are localized in account/pricingAccess, independent of flag OFF/ON.
  Null/loading access is unknown; no inferred subscription from full-access rollback.
- ProfileAccessNotice has an optional inverse surface variant; DashboardProfileStrength
  opts in. Explanation uses `--bbf-op-donker`, upgrade link `--bbf-lime`; default
  light-surface treatment and accuracy pill unchanged.
- 67 focused tests pass across AccountPlan, ProfileAccessNotice, PricingAccountAccess,
  dashboard page and dashboard-message-locale integration. Focused ESLint passes.
- Account file manifest updated. No build, capture, commit or deploy.

EN first visual review is complete in `audit/P2-results-en-visual-review.md`:
24 full pages via 14 byte-identical representatives, all 12 original mobile viewports.
Same free-older mobile PDF overflow as NL, parent-owned fix. Email action appearance
is not a leak: source guards show a latest-only toast and return before opening.
Final EN acceptance remains HELD for rebuilt/rerendered source. Recheck all desktop
product states because correcting labels splits formerly byte-identical groups.

Source ready for coordinated rebuild; no remaining account implementation blocker.
