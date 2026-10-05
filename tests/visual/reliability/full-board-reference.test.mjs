import assert from "node:assert/strict";
import { test } from "node:test";
import { collectBoardReferences } from "./full-board-reference.mjs";

test("executes all board defaults and interactive reference states without a canvas runtime", async () => {
  const boards = await collectBoardReferences();
  assert.equal(boards.length, 18);
  const account = boards.find(board => board.filename === "Account.dc.html");
  assert.equal(account.states.find(state => state.state === "three-consistent").values.sh, 787);
  assert.equal(account.states.find(state => state.state === "three-consistent").values.half, 18);
  assert.equal(account.states.find(state => state.state === "spread-over-5mm").values.showPaid, false);
  const paid = boards.find(board => board.filename === "Betaald.dc.html");
  assert.equal(paid.states[0].values.half, 13);
  assert.equal(paid.states.find(state => state.state === "below-window").values.sh, 782);
  assert.equal(paid.states.find(state => state.state === "above-window").values.sh, 792);
});
