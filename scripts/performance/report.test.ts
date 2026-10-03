import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
// Node CLI modules deliberately remain executable without a TypeScript build.
import { median, summarize, markdown } from "./report.mjs";
const url = "http://localhost/en";
const report = (lcp: number, cls = 0.01, tbt = 10) => ({ requestedUrl: url, audits: {
  "largest-contentful-paint": { numericValue: lcp }, "cumulative-layout-shift": { numericValue: cls },
  "total-blocking-time": { numericValue: tbt }, "http-status-code": { score: 1 },
} });
describe("mobile performance baseline", () => {
  it("configures six distinct templates and three mobile samples", () => {
    const config = JSON.parse(readFileSync("lighthouserc.json", "utf8")).ci;
    expect(config.collect.url).toHaveLength(6);
    expect(new Set(config.collect.url).size).toBe(6);
    expect(config.collect.numberOfRuns).toBe(3);
    expect(config.collect.settings.formFactor).toBe("mobile");
    expect(config.collect.settings.throttlingMethod).toBe("simulate");
    expect(config.assert.assertions["largest-contentful-paint"][1].maxNumericValue).toBeLessThan(2500);
  });
  it("keeps individual results and uses medians rather than best runs", () => {
    const [result] = summarize([report(800), report(2800), report(3000)], [url]);
    expect(result.metrics["largest-contentful-paint"].values).toEqual([800, 2800, 3000]);
    expect(result.metrics["largest-contentful-paint"].median).toBe(2800);
    expect(result.pass).toBe(false);
    expect(markdown([result], "before")).toContain("PERF-before-1");
  });
  it("fails unavailable, missing and exactly-at-budget metrics", () => {
    expect(summarize([], [url])[0].pass).toBe(false);
    expect(summarize([report(1000)], [url])[0].pass).toBe(false);
    expect(summarize([report(2500), report(2500), report(2500)], [url])[0].pass).toBe(false);
    expect(summarize([report(1000, 0.1), report(1000, 0.1), report(1000, 0.1)], [url])[0].pass).toBe(false);
    expect(summarize([report(1000, 0, 200), report(1000, 0, 200), report(1000, 0, 200)], [url])[0].pass).toBe(false);
  });
  it("does not classify Lighthouse navigation failures as fast pages", () => {
    const failed = { ...report(0), runtimeError: { code: "NO_FCP" } };
    const [result] = summarize([failed, failed, failed], [url]);
    expect(result.validRuns).toBe(0);
    expect(result.pass).toBe(false);
    expect(result.errors).toHaveLength(3);
  });
  it("calculates even and odd medians without mutating inputs", () => {
    const values = [3, 1, 2];
    expect(median(values)).toBe(2); expect(values).toEqual([3, 1, 2]);
    expect(median([2, 4])).toBe(3); expect(median([])).toBeNull();
  });
});
