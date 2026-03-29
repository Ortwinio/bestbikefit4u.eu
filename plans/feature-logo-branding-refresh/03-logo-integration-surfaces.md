# Step 03 — Logo Integration Surfaces

## Objective

Replace text-only or inconsistent branding with real logo components on the highest-value app surfaces.

## Tasks

1. Add a reusable brand logo component or small logo system wrapper.
2. Update:
   - `src/components/layout/Header.tsx`
   - `src/components/layout/HeaderMobileMenu.tsx`
   - `src/app/(dashboard)/layout.tsx`
   - other high-visibility auth/dashboard surfaces as needed
3. Ensure the correct logo variant is chosen based on surface contrast:
   - light logo on light surfaces
   - dark logo on dark surfaces
   - compact mark where full horizontal logo is too wide
4. Preserve responsive layout behavior and avoid crowding navigation.

## Deliverable

Define:

- target files
- component ownership
- responsive behavior rules
- fallback rules for constrained spaces

## Acceptance For This Step

- main public navigation shows the brand visually
- dashboard branding is consistent with public branding
- mobile layouts remain readable and balanced
