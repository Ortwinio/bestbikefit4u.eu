# Plan: Comfort / Discomfort Card

## Goal

Add a dedicated **Comfort / Discomfort** card to the My Profile page that surfaces the user's pain and discomfort data as a visual comfort-level indicator — following the same pattern as the Flexibility and Core Stability cards.

## Background

The profile already stores pain/discomfort data via the Riding Style section (`hasPain`, `painAreas`, `painSeverity`). However this data is buried inside the Riding Style card and treated purely as metadata. Pain and discomfort directly influence bike fit recommendations (saddle height, reach, bar drop) and deserve a dedicated, prominent card — just like flexibility and core stability.

The card will:
- Derive a **1–5 comfort score** from the existing `hasPain` + `painSeverity` fields
- Show a visual bar (similar to `CoreStabilityBar`) coloured from danger → success
- List active pain areas as colour-coded chips
- Include an impact description and an "How to improve" link
- Allow inline editing (update `hasPain`, `painAreas`, `painSeverity`)

## Scoring Model

| Comfort score | Condition |
|---|---|
| 5 — Comfortable | `hasPain === "no"` |
| 4 — Mild discomfort | `hasPain === "yes"`, `painSeverity === 1` |
| 3 — Moderate discomfort | `hasPain === "yes"`, `painSeverity === 2` |
| 2 — Significant discomfort | `hasPain === "yes"`, `painSeverity === 3–4` |
| 1 — Severe discomfort | `hasPain === "yes"`, `painSeverity === 5` |

The score is **derived** — no new database field is required.

## Scope

### In scope
- `ComfortLevelBar` visual component (mirrors `CoreStabilityBar`)
- `ComfortCard` inline in `profile/page.tsx` (mirrors `FlexibilityCard` / `CoreStabilityCard`)
- Edit mode: `hasPain` toggle + `painAreas` multi-select chips + `painSeverity` slider (1–5), only when `hasPain === "yes"`
- Remove pain-related fields from `RidingStyleCard` (they move here)
- `updateComfort` mutation (or reuse `updateRiderProfile`)
- `/profile/improve/comfort` page with targeted advice per pain area
- i18n messages (EN + NL) for all new strings
- Grid layout adjustment to place the card alongside Flexibility and Core Stability

### Out of scope
- Changes to the recommendation engine (separate plan)
- Per-pain-area deep-dive pages
- Staleness invalidation (covered by existing `riderProfileUpdatedAt`)

## Approach

Follow the same implementation pattern used for Flexibility and Core Stability:

1. **Visual component** — `ComfortLevelBar.tsx` with colour-coded segmented bar + derived score
2. **Card** — inline `ComfortCard` function in `profile/page.tsx` (view + edit state)
3. **Improve page** — `/profile/improve/comfort/page.tsx` using `ProfileImproveGuideClient`
4. **i18n** — add `profile.comfort` and `profile.sections.comfort` keys (EN + NL)
5. **Layout** — move comfort card into the profile grid; remove pain fields from Riding Style edit form

## Acceptance Criteria

- [ ] Comfort score (1–5) derived correctly from `hasPain` + `painSeverity`
- [ ] `ComfortLevelBar` shows correct colour (danger/warning/success) per score
- [ ] Active pain areas shown as coloured chips in view state
- [ ] Impact description text explains relevance to bike fit
- [ ] Edit mode updates `hasPain`, `painAreas`, `painSeverity` via `updateRiderProfile`
- [ ] Pain fields removed from `RidingStyleCard` edit form (no duplication)
- [ ] "How to improve" link navigates to `/profile/improve/comfort`
- [ ] Improve page has targeted advice for at least 5 pain areas
- [ ] EN + NL translations complete
- [ ] No TypeScript errors introduced

---

## Progress

- [ ] Prompt 01 — Visual component + i18n
- [ ] Prompt 02 — ComfortCard + profile page integration
- [ ] Prompt 03 — Remove pain from RidingStyleCard
- [ ] Prompt 04 — Improve page
