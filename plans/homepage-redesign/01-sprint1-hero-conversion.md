# Prompt 01 — Sprint 1: Top-Of-Funnel Cleanup

## Context

Read `plans/homepage-redesign/README.md` before starting.

Important repo-state notes:

- The header already renders `CampaignAnnouncementBar`.
- The hero already routes the primary CTA to the calculator.
- The homepage already contains a tertiary sign-in path.
- `BikeQuickCheckCard` already exists and should remain in the early funnel.

This sprint should clean up the top of the page without re-solving already-landed work.

## Task

Refactor the top funnel into clearer, reusable components and remove duplicated campaign messaging from the hero.

## Deliverables

### 1. Extract `HeroBlock`

Create a reusable hero component under `src/components/home/` and move the current inline hero implementation out of `src/app/(public)/page.tsx`.

The extracted hero should:

- keep the localized calculator-first primary CTA
- keep the tertiary sign-in path
- keep analytics wiring through `TrackedCtaLink`
- remove the inline campaign content card from the hero body
- preserve the current dark-media presentation or improve it within the existing design system

### 2. Add a dedicated proof strip

Create a `ProofBar`-style component under `src/components/home/` to replace the ad hoc trust chips inside the hero area.

The proof strip should communicate:

- method-backed guidance
- practical millimeter-based output
- transparent limitations

Keep it concise and directly tied to real product capabilities.

### 3. Reuse or extend `CampaignAnnouncementBar`

If campaign treatment changes are needed, update
`src/components/campaign/CampaignAnnouncementBar.tsx`.

Do not create a second announcement component in `layout/`.

### 4. Review logged-out header CTA behavior

Check `HeaderAuthActions.tsx` and `HeaderMobileMenu.tsx` and confirm the logged-out CTA order and labels still support the redesign.

Only make changes if they improve the calculator-first path without hiding login access.

## Integration

Update `src/app/(public)/page.tsx` so that:

1. the hero is rendered via the extracted component
2. the proof strip appears immediately below the hero
3. `BikeQuickCheckCard` stays immediately after the hero/proof area
4. the inline hero campaign card JSX is removed

## Constraints

- Reuse `CampaignCtaGroup` when campaign CTA pairs are needed.
- Preserve existing analytics patterns and event names unless a rename is explicitly documented.
- Keep sign-in present but visually tertiary.
- Do not introduce a second primary CTA inside the hero section.
- Prefer server components unless a client boundary is strictly required.

## Completion Checklist

- [x] The hero is extracted out of `page.tsx`.
- [x] The hero no longer contains the campaign info card.
- [x] The early funnel still contains a clear sign-in path for returning users.
- [x] `BikeQuickCheckCard` remains near the top of the page.
- [x] The top-of-page conversion path is clearer than before without duplicating campaign copy.

## Shipped Output

- `src/components/home/HeroBlock.tsx`
- `src/components/home/ProofBar.tsx`
- `src/components/layout/HeaderAuthActions.tsx`
- `src/components/layout/HeaderMobileMenu.tsx`
- `src/app/(public)/page.tsx`
