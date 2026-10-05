import assert from "node:assert/strict";
import { test } from "node:test";
import { isExpectedOfflineError } from "./full-runtime.mjs";
import { calculatorPath, publicCalculators, reuseTargets } from "./full-routes.mjs";

test("offline exclusion never hides hydration, local asset failures or unrelated CSP violations", () => {
  const origin = "https://127.0.0.1:3214";
  assert.equal(isExpectedOfflineError("Hydration failed", "", origin), false);
  assert.equal(isExpectedOfflineError("Failed to load resource: net::ERR_FAILED", `${origin}/asset.js`, origin), false);
  assert.equal(isExpectedOfflineError("Connecting to 'ws://127.0.0.1:9/api/1/sync' violates Content Security Policy", "", origin), true);
  assert.equal(isExpectedOfflineError("Connecting to 'https://example.test' violates Content Security Policy", "", origin), false);
});

test("all existing calculator routes are covered without inventing routes for advice metrics", () => {
  assert.equal(publicCalculators.length, 11);
  assert.equal(new Set(publicCalculators.map(calculator => calculator.key)).size, 11);
  assert(reuseTargets.every(key => publicCalculators.some(calculator => calculator.key === key)));
  const pressure = publicCalculators.find(calculator => calculator.key === "tire-pressure");
  assert.equal(calculatorPath(pressure, "nl"), "/nl/bandenspanning-calculator");
  assert.equal(calculatorPath(pressure, "en"), "/en/tire-pressure-calculator");
});
