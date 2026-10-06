import { describe, expect, it } from "vitest";
import { renderFitReport } from "./index";

describe("report mail pressure text", () => {
  it.each(["nl", "en"] as const)("prints actual pressure in both units, without a gauge (%s)", locale => {
    const mail = renderFitReport({ actionUrl: "https://bikefitboost.com/fit",
      tirePressure: { frontBar: 5.2, rearBar: 5.6, frontPsi: 75, rearPsi: 81 } }, locale);
    const expected = locale === "nl" ? "5,2 bar · 75 psi" : "5.2 bar · 75 psi";
    expect(mail.html).toContain(expected);
    expect(mail.text).toContain(expected);
    expect(mail.html).not.toContain("pressure-wheel");
    expect(mail.html).not.toMatch(/display:\s*(?:flex|grid)/);
  });
  it("does not invent pressure when the report has no saved calculation", () => {
    expect(renderFitReport({ actionUrl: "https://bikefitboost.com/fit" }, "nl").text).not.toContain("bar ·");
  });
});
