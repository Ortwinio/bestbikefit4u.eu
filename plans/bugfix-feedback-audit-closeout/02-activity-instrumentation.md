# Step 02 — Activity Instrumentation

## Goal

Implement the richer feedback activity trail using the contract from Step 01.

## Tasks

1. Extend the activity tracker with the approved event vocabulary.
2. Instrument only the agreed high-signal flows.
3. Ensure activity remains bounded in size and legible in admin.
4. Update any summary-generation logic if needed.
5. Add targeted tests for:
   - event capture
   - bounded trail behavior
   - summary generation

## Constraints

- do not create generic analytics infrastructure here
- do not over-capture low-value UI events
- do not break the existing feedback payload contract

## Done When

- the trail contains meaningful in-page actions for key flows
- the admin view gains practical context without noise
