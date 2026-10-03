import { test } from "node:test";
import assert from "node:assert/strict";
import { validOptionalLastmod } from "./sitemap-lastmod.mjs";

test("unknown modification date may be absent", () => {
  assert.equal(validOptionalLastmod(undefined), true);
});
test("accepts actual dates and W3C date-time offsets", () => {
  for (const value of ["2026-10-03", "2024-02-29", "2026-10-03T00:30:00+02:00", "2026-10-03T12:00:00Z"]) {
    assert.equal(validOptionalLastmod(value), true, value);
  }
});
test("rejects empty, invented fallback and impossible calendar dates", () => {
  for (const value of ["", "today", "2026-02-30", "2025-02-29", "2026-15-02", "2026-10-03T24:99:00Z"]) {
    assert.equal(validOptionalLastmod(value), false, value);
  }
});
