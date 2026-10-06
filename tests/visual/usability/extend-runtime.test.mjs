import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { extendRiderRuntime } from "../final-sweep/rider-fixtures.mjs";
import { extendUsabilityAccountRuntime } from "./extend-runtime.mjs";
const root = "/Users/ortwinverreck/Developer/bikefitboost-usability";
for (const [batch, path] of Object.entries({ profile: "account-batch1/runtime.jsx", fit: "account-batch2/runtime.jsx",
  tools: "account-batch4/runtime.jsx", bikes: "final-sweep/account-fixture-bikes-runtime.jsx" })) {
  test(`extends actual ${batch} runtime before rider fallback and retains unknown checks`, async () => {
    const source = await readFile(`${root}/tests/visual/${path}`, "utf8");
    const output = extendUsabilityAccountRuntime(extendRiderRuntime(source,
      `${root}/tests/visual/final-sweep/rider-fixtures.mjs`), { root, batch });
    assert.ok(output.indexOf("const usabilityResult") < output.indexOf("const riderResult"));
    assert.ok(output.includes('if (!(name in values)) {'));
    assert.ok(output.includes("fixturePaidEnforced() !== (mode !=="));
    assert.ok(output.includes("dataset.usabilityAccess"));
  });
}
test("rejects implicit root or missing rider adapter", () => {
  assert.throws(() => extendUsabilityAccountRuntime("", { root: ".", batch: "fit" }), /absolute/);
  assert.throws(() => extendUsabilityAccountRuntime("", { root, batch: "fit" }), /after extendRiderRuntime/);
});
