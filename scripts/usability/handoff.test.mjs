import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { verifyEditedHandoff } from "./handoff.mjs";

function fakePage({ source = "saddle-height", destination = "frame-size", field = "heightCm", value = 191, tamper = false, missing = false, native = false } = {}) {
  let url = `http://127.0.0.1:3000/en/calculators/${source}`;
  const target = `/en/calculators/${destination}`;
  const entries = missing ? [] : [{ field, value, unit: field === "heightCm" ? "cm" : field === "weightKg" ? "kg" : "min", method: "declared", calculator: source, touchedAt: 1000 }];
  const calls = [];
  const evaluate = async (callback, argument) => vm.runInNewContext(`(${callback.toString()})(argument)`, {
    argument, sessionStorage: { getItem: () => JSON.stringify({ version: 1, entries }) },
    document: { querySelector: selector => {
      if (native) assert.match(selector, /input\[type="range"\]/);
      return { getAttribute: () => native ? null : String(entries.at(-1)?.value), value: String(entries.at(-1)?.value) };
    } },
  });
  const node = selector => ({
    count: async () => 1, first() { return this; }, nth() { return this; }, waitFor: async () => {}, focus: async () => {},
    locator: child => {
      if (native) assert.match(child, /input\[type="range"\]/);
      return node(`${selector} ${child}`);
    },
    inputValue: async () => String(entries.at(-1)?.value),
    getAttribute: async name => native && name.startsWith("aria-value") ? null
      : name === "href" ? target : ["aria-valuemax", "max"].includes(name) ? "150" : String(entries.at(-1)?.value),
    innerText: async () => `${entries.at(-1)?.value} ${entries.at(-1)?.unit}`,
    press: async () => {
      calls.push("edit");
      const selected = selector.includes("gradientPercent") ? "gradientPercent" : "weightKg";
      entries.push({ field: selected, value: selected === "weightKg" ? 81 : 10.5,
        unit: selected === "weightKg" ? "kg" : "%", method: "declared", calculator: source, touchedAt: 1001 });
    },
    click: async () => { calls.push("click"); url = new URL(target, url).href; if (tamper) entries[0].calculator = destination; },
    selector,
  });
  return { calls, target, page: { url: () => url, evaluate, locator: node, getByRole: node,
    waitForFunction: async (callback, argument) => { assert.equal(Boolean(await evaluate(callback, argument)), true); },
    waitForURL: async expected => assert.equal(url, expected),
  } };
}

test("real edited height is applied after following the actual next link", async () => {
  const { page, target, calls } = fakePage();
  const result = await verifyEditedHandoff(page, { calculator: "saddle-height" }, { calculator: "frame-size" }, "en", target);
  assert.equal(result.passed, true);
  assert.equal(result.mode, "applied-input");
  assert.equal(result.displayed, 191);
  assert.deepEqual(calls, ["click"]);
});

test("retained-only edge is explicit and detects provenance replacement", async () => {
  for (const tamper of [false, true]) {
    const { page, target } = fakePage({ source: "bike-fit", destination: "tire-pressure", tamper });
    const result = await verifyEditedHandoff(page, { id: "bike-fit" }, { id: "tire-pressure" }, "en", target);
    assert.equal(result.mode, "retained-only");
    assert.equal(result.passed, !tamper);
  }
});

test("shared weight is genuinely edited on the power-to-FTP edge", async () => {
  const { page, target, calls } = fakePage({ source: "power-speed", destination: "ftp-wkg", field: "powerWatts", value: 225 });
  const result = await verifyEditedHandoff(page, { calculator: "power-speed" }, { calculator: "ftp-wkg" }, "en", () => target);
  assert.equal(result.field, "weightKg");
  assert.equal(result.passed, true);
  assert.deepEqual(calls, ["edit", "click"]);
});

test("missing user input fails without inventing or seeding values", async () => {
  const { page, target, calls } = fakePage({ missing: true });
  await assert.rejects(verifyEditedHandoff(page, { id: "saddle-height" }, { id: "frame-size" }, "en", target), /Missing actual user-edited/);
  assert.deepEqual(calls, []);
});

test("external next destinations are rejected before clicking", async () => {
  const { page, calls } = fakePage();
  await assert.rejects(verifyEditedHandoff(page, { id: "saddle-height" }, { id: "frame-size" }, "en", "https://example.com/next"), /Cross-origin/);
  assert.deepEqual(calls, []);
});

test("all eleven route edges have explicit applied or retained coverage", async () => {
  const edges = [
    ["saddle-height", "frame-size", "heightCm", "applied-input"],
    ["frame-size", "crank-length", "heightCm", "applied-input"],
    ["crank-length", "saddle-width", "heightCm", "applied-input"],
    ["saddle-width", "bike-fit", "heightCm", "applied-input"],
    ["bike-fit", "tire-pressure", "heightCm", "retained-only"],
    ["tire-pressure", "gearing", "weightKg", "applied-input"],
    ["gearing", "climb-planner", "innerChainringTeeth", "applied-input"],
    ["climb-planner", "power-speed", "distanceKm", "applied-input"],
    ["power-speed", "ftp-wkg", "powerWatts", "applied-input"],
    ["ftp-wkg", "fuel-hydration", "twentyMinuteWatts", "retained-only"],
    ["fuel-hydration", "saddle-height", "durationMinutes", "retained-only"],
  ];
  for (const [source, destination, field, mode] of edges) {
    const { page, target } = fakePage({ source, destination, field });
    const result = await verifyEditedHandoff(page, { calculator: source }, { calculator: destination }, "en", target);
    assert.equal(result.passed, true, `${source} → ${destination}`);
    assert.equal(result.mode, mode);
  }
});

test("native range inputs without explicit role or aria values transfer height and shared weight", async () => {
  for (const options of [
    { native: true },
    { native: true, source: "power-speed", destination: "ftp-wkg", field: "powerWatts", value: 225 },
  ]) {
    const { page, target } = fakePage(options);
    const result = await verifyEditedHandoff(page, { id: options.source ?? "saddle-height" },
      { id: options.destination ?? "frame-size" }, "en", target);
    assert.equal(result.passed, true);
    assert.equal(result.mode, "applied-input");
  }
});
