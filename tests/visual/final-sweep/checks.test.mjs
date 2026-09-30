import assert from "node:assert/strict";
import { test } from "node:test";
import { findLanguageLeaks } from "./checks.mjs";
import { summarize } from "./report.mjs";

test("language leaks match words, not substrings or technical cycling vocabulary", () => {
  assert.deepEqual(findLanguageLeaks("Saved settingsful stack reach drop gravel cleat", "nl"), []);
  assert.deepEqual(findLanguageLeaks("Save / SIGN IN / 5 hrs/week", "nl"), ["Save", "Sign in", "hrs/week"]);
  assert.deepEqual(findLanguageLeaks("Opslaan. Inloggen! Instellingen", "en"), [
    "Opslaan", "Inloggen", "Instellingen",
  ]);
});

test("summary distinguishes failed, skipped and passed checks", () => {
  const summary = summarize([
    { route: "/example", checks: { status: { status: "pass" }, axe: { status: "skip" } } },
    { route: "/example", checks: { status: { status: "fail" }, axe: { status: "skip" } } },
  ]);
  assert.equal(summary.routes, 1);
  assert.equal(summary.cases, 2);
  assert.equal(summary.failingCases, 1);
  assert.deepEqual(summary.checks.status, { pass: 1, fail: 1, skip: 0 });
  assert.deepEqual(summary.checks.axe, { pass: 0, fail: 0, skip: 2 });
});
