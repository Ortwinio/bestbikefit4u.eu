import assert from "node:assert/strict";
import test from "node:test";
import { runPool } from "./pool.mjs";

test("bounded workers process each stable index once and preserve result order", async () => {
  let active = 0;
  let maximum = 0;
  const seen = [];
  const items = Array.from({ length: 12 }, (_, index) => index);
  const results = await runPool(items, 4, async (item, index) => {
    active += 1;
    maximum = Math.max(maximum, active);
    seen.push(index);
    assert.equal(item, index);
    await new Promise(resolve => setTimeout(resolve, (12 - index) % 3));
    active -= 1;
    return item * 2;
  });
  assert.equal(maximum, 4);
  assert.equal(active, 0);
  assert.deepEqual(seen.sort((first, second) => first - second), items);
  assert.deepEqual(results, items.map(item => item * 2));
});

test("empty input does not invoke workers and invalid limits reject", async () => {
  assert.deepEqual(await runPool([], 4, () => assert.fail("Unexpected worker")), []);
  for (const limit of [0, -1, 1.5, NaN, Infinity, "4"]) {
    await assert.rejects(runPool([], limit, () => {}), /positive integer/);
  }
});

test("first failure stops new jobs but waits for started workers to drain", async () => {
  const firstError = new Error("first failure");
  const started = [];
  const finished = [];
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  let settled = false;
  const task = runPool([0, 1, 2, 3, 4], 3, async (_item, index) => {
    started.push(index);
    if (index === 0) throw firstError;
    await pending;
    finished.push(index);
    if (index === 2) throw new Error("later failure");
  });
  const assertion = assert.rejects(task, error => error === firstError).then(() => { settled = true; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(settled, false);
  assert.deepEqual(started, [0, 1, 2]);
  release();
  await assertion;
  assert.deepEqual(finished, [1, 2]);
});
