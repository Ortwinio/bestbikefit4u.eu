import { describe, expect, it } from "vitest";
import {
  extractBikeTypeCandidate,
  extractBrandCandidate,
  extractModelCandidate,
  normalizeAdvertTitle,
} from "./normalize";

describe("normalizeAdvertTitle", () => {
  it("removes Marktplaats chrome and obvious title noise", () => {
    expect(
      normalizeAdvertTitle("Canyon Endurace CF 7 racefiets maat 56 | Marktplaats")
    ).toBe("Canyon Endurace CF 7 racefiets");
  });
});

describe("extractBrandCandidate", () => {
  it("returns high confidence when a known brand leads the title", () => {
    expect(extractBrandCandidate("Specialized Roubaix carbon racefiets")).toMatchObject({
      value: "Specialized",
      confidence: "high",
      needsReview: false,
    });
  });
});

describe("extractModelCandidate", () => {
  it("extracts a conservative model candidate from the post-brand title remainder", () => {
    const brand = extractBrandCandidate("Specialized Roubaix Expert racefiets");

    expect(extractModelCandidate("Specialized Roubaix Expert racefiets", brand)).toMatchObject({
      value: "Roubaix Expert",
      confidence: "medium",
      needsReview: true,
    });
  });
});

describe("extractBikeTypeCandidate", () => {
  it("maps Dutch bike-type keywords deterministically", () => {
    expect(extractBikeTypeCandidate("Cube Aerium tijdritfiets", "")).toMatchObject({
      value: "tt_triathlon",
      confidence: "high",
      needsReview: false,
    });
    expect(extractBikeTypeCandidate("Gazelle stadsfiets", "")).toMatchObject({
      value: "city",
      confidence: "high",
      needsReview: false,
    });
  });
});
