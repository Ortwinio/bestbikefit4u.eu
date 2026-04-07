# Calculator Conversion Bridges

## Objective

Make calculators act as structured conversion bridges instead of isolated tools, using the tire-pressure pattern as the quality benchmark.

## Inputs

- [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/bike-fit/page.tsx)
- [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/frame-size/page.tsx)
- [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/saddle-height/page.tsx)
- [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/crank-length/page.tsx)
- [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/bandenspanning-calculator/page.tsx)
- [BikeQuickCheckCard.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/BikeQuickCheckCard.tsx)
- Output from Step 01

## Tasks

1. Audit all public calculators for current next-step patterns and CTA consistency.
2. Define one shared calculator conversion pattern:
   result summary, “continue free”, “see deeper output”, “sign in/create account”, “learn more”.
3. Apply the pattern across all public calculators with consistent visual structure and CTA priority.
4. Add short outcome framing after results so the user understands why creating an account is the next logical step.
5. Reduce isolated dead ends:
   every calculator should suggest the next best action inside the product journey.
6. Keep honest baseline language, but pair it with practical value language.
7. Ensure calculator pages stay responsive and readable in both themes.

## Deliverable

Consistent public calculator pages that generate value and then move users toward account creation or deeper product usage with low ambiguity.

## Completion Checklist

- [ ] Every calculator includes a deliberate next-step module.
- [ ] CTA hierarchy is consistent across calculators.
- [ ] Value-first language remains visible before signup prompts.
- [ ] “Baseline” disclaimers are balanced with practical outcome language.
- [ ] The tire-pressure quality level is matched elsewhere.
