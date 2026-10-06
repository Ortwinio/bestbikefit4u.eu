import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("public pressure mobile spacing", () => {
  it("changes only vertical spacing inside the public pressure template below 640px", () => {
    const css = readFileSync(new URL("./ReliabilityCalculatorTemplate.module.css", import.meta.url), "utf8");
    const mobile = css.slice(css.indexOf("@media (max-width: 639px)"));
    expect(mobile).toContain("@media (max-width: 639px)");
    const rules = [...mobile.matchAll(/(\.calculator[^{}]+)\{([^{}]+)\}/g)];
    expect(rules).toHaveLength(9);
    const spacing = new Set(["padding-block", "margin-bottom", "margin-top", "gap", "margin-block-start", "margin-block-end"]);
    for (const [, selector, declarations] of rules) {
      expect(selector.trim()).toMatch(/^\.calculator\[data-reliability-calculator="tire-pressure"\]/);
      for (const declaration of declarations.split(";").map(value => value.trim()).filter(Boolean)) {
        const [property, value] = declaration.split(":").map(part => part.trim());
        expect(spacing.has(property)).toBe(true);
        expect(value).toMatch(/^(?:0|(?:8|12|16)px)$/);
      }
    }
  });
});
