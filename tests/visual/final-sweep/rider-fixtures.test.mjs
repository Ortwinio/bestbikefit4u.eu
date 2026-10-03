import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readRiderFixture, extendRiderRuntime } from "./rider-fixtures.mjs";

const fixture = { profile: { _id: "profile", userId: "owner", heightCm: 180, inseamCm: 84, weightKg: 75 },
  bike: { _id: "bike", bikeType: "road" } };
test("explicit provenance matches current values without filling missing measurements", () => {
  const { value } = readRiderFixture("profiles/queries:getMyProvenance", {}, fixture);
  assert.equal(value.profile.armLengthCm, undefined);
  assert.deepEqual(value.observations.map(row => [row.field, row.value]), [["heightCm", 180], ["inseamCm", 84], ["weightKg", 75]]);
  assert.ok(value.observations.every(row => row.status === "current" && row.recordedAt > 0));
});
test("prompts follow the real contract and do not require fake mount mutation success", () => {
  const { value } = readRiderFixture("profiles/queries:nextPrompts", {}, fixture);
  assert.equal(value.questions[0].value, null);
  assert.equal(value.questions[0].status, "pending");
  assert.equal(value.questions[0].completenessGain, 8);
  assert.equal(typeof value.cardId, "string");
});
test("advice fixture is explicitly empty, not fabricated live outcomes", () => {
  const { value } = readRiderFixture("advice/queries:listAdviceGroups", {}, fixture);
  assert.equal(value.length, 7);
  assert.ok(value.every(group => group.items.length === 0 && group.improvements.length === 0));
});
test("newsletter fixture is explicitly opted out", () => {
  assert.deepEqual(readRiderFixture("emails/preferences:get", {}, fixture).value,
    { service: true, marketing: false, newsletter: false });
});
test("calculator chain carries real contract keys and rejects unknown bike selections", () => {
  const { value } = readRiderFixture("calculatorChain/queries:getContext", { bikeId: "bike" }, fixture);
  assert.equal(value.bikes[0]._id, "bike");
  assert.equal(value.activeWheelset, null);
  assert.equal(value.activeTireSetup, null);
  assert.deepEqual(value.advice, []);
  assert.throws(() => readRiderFixture("calculatorChain/queries:getContext", { bikeId: "foreign" }, fixture));
});
test("skip/loading/empty remain meaningful and unknown queries are never swallowed", () => {
  assert.equal(readRiderFixture("profiles/queries:getMyProvenance", "skip", fixture).value, undefined);
  assert.equal(readRiderFixture("profiles/queries:getMyProvenance", {}, { ...fixture, fixture: "loading" }).value, undefined);
  assert.equal(readRiderFixture("profiles/queries:getMyProvenance", {}, { ...fixture, fixture: "empty" }).value.profile, null);
  assert.deepEqual(readRiderFixture("unknown:query", {}, fixture), { handled: false });
});
test("all four existing runtimes retain strict unknown-query checks after extension", async () => {
  for (const file of ["../account-batch1/runtime.jsx", "../account-batch2/runtime.jsx", "../account-batch4/runtime.jsx",
    "./account-fixture-bikes-runtime.jsx"]) {
    const output = extendRiderRuntime(await readFile(new URL(file, import.meta.url), "utf8"), "./rider-fixtures.mjs");
    assert.ok(output.includes("if (!(name in values)) {"));
    assert.ok(output.includes("__visualUnknownQueries"));
    assert.ok(output.includes("readRiderFixture(name, args, { profile, bike, fixture })"));
    assert.ok(!output.includes('name: "Endurance racefiets"'));
  }
});
test("bike detail fixture computes real score and declares unknown adjustment room", async () => {
  const runtime = await readFile(new URL("./account-fixture-bikes-runtime.jsx", import.meta.url), "utf8");
  assert.ok(runtime.includes("profileScore: scoreBike({ bike }, 1790985600000)"));
  assert.ok(runtime.includes('adjustmentRoom: { status: "unknown", reason: "seatpost_extension_unknown" }'));
  assert.ok(runtime.includes("bikeObservations: []"));
});
