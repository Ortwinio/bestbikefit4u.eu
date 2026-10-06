// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { pressureDisplayStyles, pressureText, renderPressureDisplay } from "./display";

describe("shared pressure presentation", () => {
  it.each(["nl", "en"] as const)("renders the same front/rear identity and supplied values in %s", locale => {
    const root = document.createElement("div");
    root.innerHTML = renderPressureDisplay({ frontBar: 5.2, rearBar: 5.6, frontPsi: 75, rearPsi: 81, locale });
    expect(root.querySelector('[data-component="PressureDisplay"]')).not.toBeNull();
    expect(root.querySelector(".pressure-wheel-front")?.textContent).toContain(locale === "nl" ? "5,2" : "5.2");
    expect(root.querySelector(".pressure-wheel-rear")?.textContent).toContain("81 psi");
    expect(root.textContent).not.toMatch(/Veilige marge|Safe range/);
    expect(pressureDisplayStyles).toContain("background:var(--bbf-lime)");
    expect(pressureDisplayStyles).toContain(".pressure-wheel-rear{background:var(--bbf-inkt)");
  });
  it("renders safety bounds only when actual valid limits are supplied", () => {
    const base = { frontBar: 5.2, rearBar: 5.6, locale: "nl" as const };
    expect(renderPressureDisplay({ ...base, safeRange: { minBar: 4.5, maxBar: 7 } }))
      .toContain("Veilige marge 4,5–7 bar");
    expect(renderPressureDisplay({ ...base, safeRange: { minBar: -1, maxBar: 7 } }))
      .not.toContain("Veilige marge");
    expect(renderPressureDisplay({ ...base, frontBar: Number.NaN })).toBe("");
  });
  it("formats mail output as text in bar and psi", () => {
    expect(pressureText(5.2, "nl")).toBe("5,2 bar · 75 psi");
    expect(pressureText(5.2, "en")).toBe("5.2 bar · 75 psi");
  });
});
