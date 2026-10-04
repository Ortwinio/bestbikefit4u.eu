import { describe, expect, it } from "vitest";
import { en } from "./en";
import { nl, type EmailCopy } from "./nl";

function entries(value: unknown, prefix = ""): Array<[string, string]> {
  if (typeof value === "string") return [[prefix, value]];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) =>
    entries(item, prefix ? `${prefix}.${key}` : key)
  );
}

// Compile-time regression: a missing translation must be an error.
// @ts-expect-error Missing all required email copy keys.
const missingTranslation: EmailCopy = {};
void missingTranslation;

describe("email dictionaries", () => {
  it("has identical keys in both languages, including list positions", () => {
    expect(entries(nl).map(([key]) => key)).toEqual(entries(en).map(([key]) => key));
  });
  it("has matching interpolation placeholders and no empty translations", () => {
    const english = new Map(entries(en));
    for (const [key, value] of entries(nl)) {
      expect(value.trim(), key).not.toBe("");
      const translation = english.get(key)!;
      expect(translation.trim(), key).not.toBe("");
      expect(value.match(/\{\w+\}/g)?.sort() ?? [], key)
        .toEqual(translation.match(/\{\w+\}/g)?.sort() ?? []);
    }
  });
  it("preserves fixed subjects, preheaders and numeric labels", () => {
    expect(nl.loginCode.subject).toBe("{code} is je BikeFitBoost-inlogcode");
    expect(en.loginCode.subject).toBe("{code} is your BikeFitBoost login code");
    expect(nl.upgradeNudge.preheader).toBe("Jaarabonnement: €24,50 in je eerste jaar, daarna €19,50 per jaar.");
    expect(en.upgradeNudge.preheader).toBe("Annual subscription: €24.50 in your first year, then €19.50 per year.");
    expect(nl.fitReport.geometryHeading).toBe("Framegeometrie");
    expect(en.fitReport.geometryHeading).toBe("Frame geometry");
  });
});
