# Plan: Move Rider Profile Questions to My Profile

## Goal

Split the bikefitting questionnaire so that the first 5 (logical) questions — which are **bike-agnostic** and **do not change between sessions** — become a permanent part of the rider's profile. These questions must be answered before starting a bikefitting and are automatically used in every future session without being asked again. If any of these answers change, existing recommendations are marked stale and a recalculation is needed.

## Background

Currently all questionnaire questions are asked fresh for every fit session. Questions 1–5 (by order) describe the rider, not the bike:

| # | questionId | Question text |
|---|------------|---------------|
| 1 | `experience_level` | What describes your cycling background? |
| 2 | `weekly_hours` | How many hours per week do you cycle? |
| 3 | `typical_ride_length` | What is your typical ride length? |
| 4 | `has_pain` | Do you experience discomfort during cycling? |
| 4a | `pain_areas` | *(conditional)* Where do you experience discomfort? |
| 4b | `knee_pain_timing` | *(conditional)* When does your knee pain occur? |
| 4c | `pain_severity` | *(conditional)* How severe is the pain? |
| 5 | `position_priority` | What's most important in your riding position? |

Questions 6–10 remain in the bikefitting questionnaire (they are session/bike-specific):

| # | questionId | Notes |
|---|------------|-------|
| 6 | `current_position_feeling` | Depends on the specific bike |
| 7 | `road_riding_type` | Conditional, bike-type specific |
| 8 | `mtb_terrain` | Conditional, bike-type specific |
| 9 | `injury_history` | Optional, rarely changes |
| 10 | `flexibility_confidence` | Optional |

## Scope

**In scope:**
- Add 8 new fields to the `profiles` schema
- Add a "Riding Style" wizard/section to My Profile page
- Gate fit session start on rider profile being complete
- Remove the 5 questions from the fit session questionnaire
- Update the recommendation engine to read these fields from the profile
- Add a `riderProfileUpdatedAt` timestamp to detect staleness
- Show a "Results may be outdated" warning on stale sessions in fit history
- Add a recalculation trigger for stale sessions

**Out of scope:**
- Migrating existing questionnaire responses to profile fields (existing sessions remain unchanged; only new sessions use the new flow)
- Admin tooling for bulk recalculation

## Approach

The work is split into 5 sequential prompts.

## Acceptance Criteria

- [ ] My Profile has a new "Riding Style" card with the 5 questions
- [ ] The card is required: fit session cannot be started until it is complete
- [ ] The fit session questionnaire no longer shows these 5 questions
- [ ] The recommendation engine reads rider profile fields, not questionnaire responses, for these inputs
- [ ] Changing any rider profile field updates `riderProfileUpdatedAt`
- [ ] Fit history cards for sessions created before the change (or after a profile update) show a stale warning with a recalculate option
- [ ] All i18n strings (EN + NL) are present

## Progress

- [ ] 01 — Profile schema & mutations
- [ ] 02 — My Profile UI: Riding Style card
- [ ] 03 — Fit session gate & questionnaire trimming
- [ ] 04 — Recommendation engine update
- [ ] 05 — Staleness detection & recalculation UI
