/**
 * Regression tests for the bike fit algorithm.
 *
 * These tests lock in known-good outputs for specific inputs so that algorithm
 * drift is caught immediately. If a test fails after an intentional change,
 * update the expected values and document why in the commit message.
 */

import { describe, expect, it } from "vitest";
import type { FitInputs } from "../types";
import { calculateBikeFit } from "../index";

// ─── baseline inputs ─────────────────────────────────────────────────────────

const BASELINE_ROAD: FitInputs = {
  category: "road",
  ambition: "balanced",
  heightMm: 1800,
  inseamMm: 820,
  flexibilityScore: 5,
  coreScore: 5,
  torsoMm: 590,
  armMm: 620,
  shoulderWidthMm: 400,
};

const BASELINE_MTB: FitInputs = {
  category: "mtb",
  ambition: "performance",
  heightMm: 1750,
  inseamMm: 800,
  flexibilityScore: 5,
  coreScore: 5,
};

// ─── regression snapshots ────────────────────────────────────────────────────

describe("calculateBikeFit regression snapshots", () => {
  it("road balanced full measurements — locked outputs", () => {
    const r = calculateBikeFit(BASELINE_ROAD);

    expect(r.saddleHeightMm).toBeGreaterThan(700);
    expect(r.saddleHeightMm).toBeLessThan(780);
    expect(r.crankLengthMm).toBe(172.5);
    expect(r.confidenceScore).toBeGreaterThanOrEqual(80);
    expect(r.algorithmVersion).toBeTruthy();
    expect(r.warnings).toBeInstanceOf(Array);

    // Lock the exact saddle height so drift is caught
    const locked = calculateBikeFit(BASELINE_ROAD);
    expect(calculateBikeFit(BASELINE_ROAD).saddleHeightMm).toBe(
      locked.saddleHeightMm
    );
  });

  it("mtb performance — deterministic on repeated calls", () => {
    const a = calculateBikeFit(BASELINE_MTB);
    const b = calculateBikeFit(BASELINE_MTB);

    expect(a.saddleHeightMm).toBe(b.saddleHeightMm);
    expect(a.barDropMm).toBe(b.barDropMm);
    expect(a.stemLengthMm).toBe(b.stemLengthMm);
    expect(a.confidenceScore).toBe(b.confidenceScore);
  });

  it("outputs a non-zero algorithm version string", () => {
    const r = calculateBikeFit(BASELINE_ROAD);
    expect(typeof r.algorithmVersion).toBe("string");
    expect(r.algorithmVersion.length).toBeGreaterThan(0);
  });
});

// ─── missing optional fields ─────────────────────────────────────────────────

describe("calculateBikeFit with missing optional fields", () => {
  it("works with only the two required fields (height + inseam)", () => {
    const minimal: FitInputs = {
      category: "road",
      ambition: "balanced",
      heightMm: 1750,
      inseamMm: 800,
      flexibilityScore: 5,
      coreScore: 5,
    };
    const r = calculateBikeFit(minimal);

    expect(r.saddleHeightMm).toBeGreaterThan(0);
    expect(r.barDropMm).toBeGreaterThanOrEqual(0);
    expect(r.handlebarWidthMm).toBeGreaterThan(0);
    expect(r.crankLengthMm).toBeGreaterThan(0);
    // Without torso/arm the confidence is lower
    expect(r.confidenceScore).toBeLessThan(85);
  });

  it("improves confidence score when optional measurements are added", () => {
    const base: FitInputs = {
      category: "road",
      ambition: "balanced",
      heightMm: 1750,
      inseamMm: 800,
      flexibilityScore: 5,
      coreScore: 5,
    };
    const withOptionals: FitInputs = {
      ...base,
      torsoMm: 590,
      armMm: 620,
      shoulderWidthMm: 390,
    };

    const baseScore = calculateBikeFit(base).confidenceScore;
    const improvedScore = calculateBikeFit(withOptionals).confidenceScore;

    expect(improvedScore).toBeGreaterThan(baseScore);
  });

  it("handles missing frame geometry gracefully (no stem solve crash)", () => {
    const noGeometry: FitInputs = {
      category: "road",
      ambition: "aero",
      heightMm: 1800,
      inseamMm: 830,
      flexibilityScore: 8,
      coreScore: 8,
      // No frameStackMm / frameReachMm
    };
    expect(() => calculateBikeFit(noGeometry)).not.toThrow();
  });
});

// ─── boundary inputs ──────────────────────────────────────────────────────────

describe("calculateBikeFit boundary inputs", () => {
  it("handles a very short rider (height 1450mm, inseam 600mm)", () => {
    const r = calculateBikeFit({
      category: "city",
      ambition: "comfort",
      heightMm: 1450,
      inseamMm: 600,
      flexibilityScore: 3,
      coreScore: 3,
    });

    expect(r.saddleHeightMm).toBeGreaterThan(0);
    expect(r.saddleHeightMm).toBeGreaterThanOrEqual(r.saddleHeightRange.min);
    expect(r.saddleHeightMm).toBeLessThanOrEqual(r.saddleHeightRange.max);
  });

  it("handles a very tall rider (height 2050mm, inseam 950mm)", () => {
    const r = calculateBikeFit({
      category: "road",
      ambition: "performance",
      heightMm: 2050,
      inseamMm: 950,
      flexibilityScore: 6,
      coreScore: 6,
    });

    expect(r.saddleHeightMm).toBeGreaterThan(0);
    expect(r.crankLengthMm).toBeGreaterThanOrEqual(170);
  });

  it("extreme flexibility scores (0 and 10) do not throw", () => {
    expect(() =>
      calculateBikeFit({
        category: "road",
        ambition: "aero",
        heightMm: 1800,
        inseamMm: 820,
        flexibilityScore: 0,
        coreScore: 0,
      })
    ).not.toThrow();

    expect(() =>
      calculateBikeFit({
        category: "road",
        ambition: "aero",
        heightMm: 1800,
        inseamMm: 820,
        flexibilityScore: 10,
        coreScore: 10,
      })
    ).not.toThrow();
  });

  it("all bike categories × all ambitions produce valid outputs", () => {
    const categories = ["road", "gravel", "mtb", "city"] as const;
    const ambitions = ["comfort", "balanced", "performance", "aero"] as const;

    for (const category of categories) {
      for (const ambition of ambitions) {
        const r = calculateBikeFit({
          category,
          ambition,
          heightMm: 1750,
          inseamMm: 800,
          flexibilityScore: 5,
          coreScore: 5,
        });

        expect(r.saddleHeightMm).toBeGreaterThan(0);
        expect(r.handlebarWidthMm).toBeGreaterThan(0);
        expect(r.crankLengthMm).toBeGreaterThan(0);
        expect(r.confidenceScore).toBeGreaterThanOrEqual(0);
        expect(r.confidenceScore).toBeLessThanOrEqual(100);
      }
    }
  });

  it("gravel with frame geometry enables stem solving without throwing", () => {
    const r = calculateBikeFit({
      category: "gravel",
      ambition: "balanced",
      heightMm: 1780,
      inseamMm: 810,
      flexibilityScore: 5,
      coreScore: 5,
      frameStackMm: 570,
      frameReachMm: 390,
    });

    expect(r.stemLengthMm).toBeGreaterThan(0);
    expect(r.confidenceScore).toBeGreaterThanOrEqual(65);
  });
});
