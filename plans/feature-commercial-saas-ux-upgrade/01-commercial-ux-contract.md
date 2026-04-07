# Commercial UX Contract

## Objective

Define the commercial SaaS UX contract that all later steps should follow so page-level changes stay coherent and conversion-driven.

## Inputs

- [README.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-commercial-saas-ux-upgrade/README.md)
- [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/page.tsx)
- [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/pricing/page.tsx)
- [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(auth)/login/page.tsx)
- [PublicPrimitives.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/PublicPrimitives.tsx)
- [PublicCtaBand.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/PublicCtaBand.tsx)

## Tasks

1. Audit the current public conversion journey from homepage to calculator to login to pricing.
2. Write down the target CTA hierarchy:
   `primary = start with value`, `secondary = understand plans/proof`, `tertiary = sign in`.
3. Define required proof modules for high-intent pages:
   testimonial, sample output, methodology trust strip, support reassurance, outcome framing.
4. Define the disclaimer rule:
   keep honesty, but pair every caveat with a practical “what this is useful for” statement.
5. Define page-level conversion requirements for homepage, pricing, login, calculators, FAQ, and contact.
6. Record the component and styling primitives that should be reused or extended rather than duplicated.
7. Save the audit result as a short output note in this plan folder for later steps to reference.

## Deliverable

A written contract artifact that specifies funnel rules, CTA hierarchy, proof modules, disclaimer guidelines, and reuse boundaries for the public experience.

## Completion Checklist

- [ ] Current funnel friction points are explicitly listed.
- [ ] CTA hierarchy is defined once for all public pages.
- [ ] Required trust/proof modules are documented.
- [ ] Disclaimer language rule is documented.
- [ ] Shared component reuse direction is clear.
