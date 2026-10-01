import test from "node:test";
import assert from "node:assert/strict";
import { safeInteractionLabel, safeMainFlowLabel } from "./nl-interactions.mjs";

test("Dutch audit skips destructive and purchase actions in either language", () => {
  for (const label of ["Delete bike", "Verwijder fiets", "Nu betalen", "Checkout", "Uitloggen"]) {
    assert.equal(safeInteractionLabel(label), false, label);
  }
  for (const label of ["Open menu", "Type fiets", "Volgende", "Bereken", "Aanmelden"]) {
    assert.equal(safeInteractionLabel(label), true, label);
  }
});

test("Main-flow sampling admits feedback and wizard buttons without admitting saves", () => {
  for (const label of ["Feedback", "Volgende stap", "Next", "Bereken", "Calculate", "Bekijk voorbeeld", "Retry"]) {
    assert.equal(safeMainFlowLabel(label), true, label);
  }
  for (const label of ["Save", "Opslaan", "Delete example", "Voorbeeld importeren", "Feedback versturen"]) {
    assert.equal(safeMainFlowLabel(label), false, label);
  }
});
