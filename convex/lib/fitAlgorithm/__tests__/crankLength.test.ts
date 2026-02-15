import { describe, expect, it } from "vitest";
import { calculateCrankLength } from "../calculations";

describe("calculateCrankLength", () => {
  it("matches crank length table bands from spec", () => {
    expect(calculateCrankLength(720, "road")).toBe(165);
    expect(calculateCrankLength(780, "road")).toBe(170);
    expect(calculateCrankLength(850, "road")).toBe(172.5);
    expect(calculateCrankLength(900, "road")).toBe(175);
    expect(calculateCrankLength(960, "road")).toBe(177.5);
  });

  it("applies mtb short-crank adjustment when inseam >= 820 and crank >= 175", () => {
    expect(calculateCrankLength(900, "mtb")).toBe(172.5);
    expect(calculateCrankLength(960, "mtb")).toBe(175);
  });

  it("does not adjust mtb crank when base crank is below 175", () => {
    expect(calculateCrankLength(850, "mtb")).toBe(172.5);
  });
});
