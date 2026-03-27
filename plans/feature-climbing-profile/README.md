# Feature: Climbing Profile

## Goal

Add a climbing importance question to the questionnaire and use the answer to:
1. Improve the fit algorithm's saddle height, setback, reach, and bar drop outputs
2. Generate a secondary "climbing profile" fit recommendation for riders who climb regularly

## Background

Climbing changes how the rider's body interacts with the bike:
- **Hip angle** — steep gradients tighten the hip angle; an open position maintains power output
- **Muscle recruitment** — glutes and hamstrings dominate; saddle height and setback are critical
- **Weight distribution** — the rider shifts forward on climbs; an overly aggressive position causes power loss and instability
- **Cadence and torque** — lower cadence at higher torque increases joint load on knees and hips

The current algorithm has no climbing-specific modifiers. All riders on the same bike category receive the same positional logic regardless of how much climbing they do.

## Scope

### In scope
- New questionnaire question: "How important is climbing in your riding?"
- Fit algorithm: climbing modifiers applied to saddle height (+2–4 mm), setback (fine-tune), reach (−5–15 mm), and bar drop (+10–25 mm) for Regular and Climbing-focused riders
- Secondary climbing fit profile generated alongside the main profile when climbing level is `regular` or `climbing_focused`
- Results page: tabbed or sectioned display for main vs. climbing profile when a climbing profile exists
- `FitInputs` extended with optional `climbingLevel` field
- Questionnaire type updated to accept the new response value

### Out of scope
- Storing multiple named profiles per fit session (the climbing profile is a derived output, not a user-managed object)
- Climbing-specific frame size recommendations
- Changes to the `bikeProfiles` table (which stores user-saved setups, not session outputs)

## Approach

### New question
Added to `convex/questionnaire/questions.ts` in the `position` category with `baseOrder: 85` (after `current_position_feeling`, before bike-specific questions). Response type: `single_choice`. Not required.

Four options:
| Value | Label |
|---|---|
| `rarely` | Rarely climb |
| `occasional` | Occasional climbs |
| `regular` | Regular climbing |
| `climbing_focused` | Climbing-focused |

### Algorithm modifiers (applied on top of base fit)

| Climbing level | Saddle height | Setback | Bar drop | Reach |
|---|---|---|---|---|
| `rarely` | No change | No change | No change | No change |
| `occasional` | +1 mm | No change | −5 mm (less drop) | No change |
| `regular` | +2–4 mm | Fine-tune (+2 mm) | −10 mm | −5 mm |
| `climbing_focused` | +3–5 mm | +3 mm | −15 to −25 mm | −10–15 mm |

Adjustments are additive on top of the base `FitOutputs`. All values are still clamped to the safety bands in `calculateSaddleHeight` and `calculateBarDrop`.

### Secondary climbing profile
When `climbingLevel` is `regular` or `climbing_focused`, the engine runs a second calculation pass with:
- `ambition` shifted one step toward `comfort` (e.g. `performance` → `balanced`, `balanced` → `comfort`)
- Climbing modifiers applied (saddle, setback, reach, drop)
- The result is returned as `climbingProfile: FitOutputs` alongside the main `profile: FitOutputs` in the session result

### Data model
No schema changes required. The climbing profile is returned as part of the existing session result document or as an additional field. The `climbingLevel` is stored as a questionnaire response (existing `questionnaireResponses` table).

### Results page
When `climbingProfile` is present in the session result, the results page shows two tabs:
- **Your fit** — main profile
- **Climbing fit** — climbing-optimised profile

Each tab shows the full set of recommendations using the existing results components.

## Acceptance criteria

- [ ] "How important is climbing in your riding?" appears in the questionnaire for all bike types
- [ ] Selecting `regular` or `climbing_focused` produces noticeably different saddle height, reach, and drop values vs. `rarely` with identical other inputs
- [ ] A climbing profile tab appears in results when climbing level is `regular` or `climbing_focused`
- [ ] No climbing profile tab appears when climbing level is `rarely` or `occasional`
- [ ] All algorithm output values remain within safety clamps
- [ ] Existing unit tests continue to pass
- [ ] Question is optional; skipping it does not break the algorithm

## Progress

- [ ] 01 — Add climbing question to questionnaire
- [ ] 02 — Extend FitInputs and add climbing modifiers to algorithm
- [ ] 03 — Generate secondary climbing profile in the engine
- [ ] 04 — Display climbing profile tab in results
