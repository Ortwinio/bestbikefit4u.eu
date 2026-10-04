import assert from "node:assert/strict";
import test from "node:test";
import { auditReferences } from "./C1-reference-audit.mjs";

test("retains live graph closure, protected paths and explicit dynamic seeds", () => {
  const files = new Map([
    ["src/read.mjs", "plans/live/entry.md\nunique-fixture.json"],
    ["plans/live/entry.md", "[nested](../nested/item.md)"],
    ["plans/nested/item.md", "[next](./deep/leaf.md)"],
    ["plans/nested/deep/leaf.md", ""],
    ["plans/fixtures/unique-fixture.json", "{}"],
    ["plans/dynamic/selected.json", "{}"],
    ["plans/riderprofile-baseline/baseline.json", "{}"],
    ["plans/README.md", ""],
    ["plans/migratie/README.md", "plans/migration-input/data.json"],
    ["plans/migration-input/data.json", "{}"],
    ["plans/cleanup/audit.md", "plans/cycle/left.md"],
    ["plans/cycle/left.md", "./right.md"],
    ["plans/cycle/right.md", "./left.md"],
  ]);
  const result = auditReferences({ files, tracked: [...files.keys(), "plans/missing/deleted.md"],
    manifest: { keep: [{ path: "plans/dynamic/selected.json", reason: "Dynamic test fixture" }], outputParents: ["plans/output"] } });
  const record = (path) => result.records.find((item) => item.path === path);
  for (const path of ["plans/live/entry.md", "plans/nested/item.md", "plans/nested/deep/leaf.md",
    "plans/fixtures/unique-fixture.json", "plans/dynamic/selected.json", "plans/README.md",
    "plans/riderprofile-baseline/baseline.json", "plans/migration-input/data.json"]) {
    assert.equal(record(path).decision, "keep", path);
  }
  assert.ok(record("plans/nested/item.md").referrers[0].methods.includes("relative-path"));
  assert.equal(record("plans/cycle/left.md").decision, "remove-candidate");
  assert.equal(record("plans/cycle/right.md").decision, "remove-candidate");
  assert.equal(record("plans/cycle/left.md").removedOnlyIncomingRefs, 1);
  assert.equal(record("plans/missing/deleted.md"), undefined);
  assert.equal(record("plans/migratie/README.md"), undefined);
  assert.equal(record("plans/cleanup/audit.md"), undefined);
});

test("does not infer dependencies from ambiguous basenames or output parents", () => {
  const files = new Map([["src/read.mjs", "data.json"], ["plans/one/data.json", "{}"],
    ["plans/two/data.json", "{}"], ["plans/output/old.json", "{}"]]);
  const result = auditReferences({ files, tracked: [...files.keys()], manifest: { keep: [], outputParents: ["plans/output"] } });
  assert.equal(result.keptCount, 0);
  assert.equal(result.outputParents[0].existingFiles, 1);
});

test("rejects missing or unsafe manual paths instead of silently dropping protection", () => {
  const files = new Map();
  assert.throws(() => auditReferences({ files, tracked: [], manifest: {
    keep: [{ path: "plans/ignored.json", reason: "Fixture" }], outputParents: [] } }), /missing or ignored/);
  assert.throws(() => auditReferences({ files, tracked: [], manifest: {
    keep: [], outputParents: ["../outside"] } }), /escapes repository/);
});
