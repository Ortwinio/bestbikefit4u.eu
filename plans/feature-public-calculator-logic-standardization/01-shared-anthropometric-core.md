# Step 1: Shared Anthropometric Core

## Objective

Define one shared public rider-baseline model for all fit-related calculators, then map every current calculator to it.

## Tasks

1. Define the baseline input schema:
   - height
   - inseam
   - bike category
   - riding goal
   - flexibility
   - core stability
2. Audit which of these inputs each current calculator already uses.
3. Decide which baseline fields are:
   - always required
   - hidden but available
   - optional refinements
   - derived or estimated only when explicitly allowed
4. Map each calculator to the shared core:
   - bike fit
   - saddle height
   - frame size
   - crank length
5. Document how tire pressure relates to the shared product language without forcing it into the same anthropometric contract.

## Output

Create `output-01-anthropometric-core.md`.

## Success Criteria

- There is one clear public baseline model for fit calculators.
- Each calculator’s relationship to that model is explicit.
- The plan avoids creating separate ad hoc input models for each tool.
