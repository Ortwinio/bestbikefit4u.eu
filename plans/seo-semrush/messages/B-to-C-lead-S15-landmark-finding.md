# S15 owner finding — duplicate language-switch landmarks

The 84-case NL/EN 1440/390 sweep reports axe `landmark-unique` (moderate) on every page:
header and footer both render a navigation landmark named Taal / Language. Baseline e93f8c1
captures also report this, so it is a pre-existing issue, not an SEO-branch regression.

Source: src/components/layout/MarketingNavigation.tsx:58 (`aria-label={copy.language}`),
called by Header.tsx:48 and Footer.tsx:98. Evidence: audit/S15-visual-after.json and
audit/S15-visual-before.json. No overflow, runtime exceptions or broken assets found so far.

Owner/lead: please either assign a narrow accessible-name distinction to the layout owner or
explicitly defer this baseline issue. B will not edit another owner's layout implementation.
An aria-only distinction need not change visible copy/layout or login attribution. If fixed now,
please notify B before editing so the build and final visual checks can be repeated consistently.
