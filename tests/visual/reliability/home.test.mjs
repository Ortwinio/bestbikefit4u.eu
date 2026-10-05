import assert from "node:assert/strict";
import { test } from "node:test";
import { expectedHomeResult, homeCases } from "./home.mjs";

test("home expectations use the shared model rather than fixed 49 mm uncertainty", () => {
  assert.equal(homeCases.length, 4);
  const defaultResult = expectedHomeResult(175);
  assert.equal(defaultResult.adviceMm, 726);
  assert.equal(defaultResult.halfWidthMm, 45);
  const changed = expectedHomeResult(190);
  assert.equal(changed.adviceMm, 789);
  assert.equal(changed.halfWidthMm, 49);
  assert.equal(changed.lowerMm, 740);
  assert.equal(changed.upperMm, 840);
});
