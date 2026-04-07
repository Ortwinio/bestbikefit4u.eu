# Handoff: Calculator + FAQ Acceptance Fixes

This is a minimal acceptance-fix checklist for Codex D based on the current calculator and FAQ/contact lane state.

## Scope

- `src/app/(public)/calculators/bike-fit/page.tsx`
- `src/app/(public)/calculators/frame-size/page.tsx`
- `src/app/(public)/calculators/saddle-height/page.tsx`
- `src/app/(public)/calculators/crank-length/page.tsx`
- `src/app/(public)/bandenspanning-calculator/page.tsx`
- `src/app/(public)/faq/page.tsx`
- `src/app/(public)/contact/page.tsx`
- minimal directly related page tests and closeout artifact only

## Acceptance Fixes

### 1. Repair the saddle-height CTA contract

File:
- `src/app/(public)/calculators/saddle-height/page.tsx`

Current gap:
- The lane task says calculators were standardized with a consistent CTA hierarchy.
- `saddle-height` currently uses bike-fit as primary and login as secondary, with no pricing CTA.

Required target:
- primary CTA: account/save/refine path
- secondary CTA: pricing
- optional tertiary CTA: bike-fit calculator
- EN/NL wording should match the calculator lane contract already used on other calculators

### 2. Add the missing calculator page tests

Required files:
- `src/app/(public)/calculators/bike-fit/page.test.tsx`
- `src/app/(public)/calculators/frame-size/page.test.tsx`
- `src/app/(public)/calculators/saddle-height/page.test.tsx`
- `src/app/(public)/bandenspanning-calculator/page.test.tsx`

Required assertions:
- next-step module renders
- primary CTA destination is correct
- pricing CTA destination is correct
- tertiary CTA, if present, is correct
- key EN/NL copy block renders on at least one locale-sensitive case

### 3. Normalize FAQ CTA tracking intent

File:
- `src/app/(public)/faq/page.tsx`

Current gap:
- task notes imply TrackedCtaLink is used throughout
- the contact CTA currently uses plain `Link`

Required:
- if contact CTA is intended as tracked funnel navigation, switch it to `TrackedCtaLink`
- otherwise keep implementation as-is but do not over-claim tracking coverage in task notes or closeout

### 4. Save the missing closeout note

Create a short closeout note in:
- `plans/feature-commercial-saas-ux-upgrade/`

Must include:
- files changed in calculator + FAQ/contact lane
- tests run
- route review summary
- residual risks
- theme/mobile/desktop review status

### 5. Re-run owned validation and report exact results

Minimum:
- calculator page tests
- FAQ/contact page tests
- any touched shared public primitive tests if modified

## Done When

- `saddle-height` matches the calculator CTA contract
- calculator next-step rendering is covered beyond crank-length
- FAQ CTA tracking intent matches implementation
- a closeout note exists in the plan folder
- validation output is included in the lane report
