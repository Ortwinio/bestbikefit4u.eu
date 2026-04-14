// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ComfortLevelBar, getComfortMeta } from "./ComfortLevelBar";
import { deriveComfortScore } from "@/lib/validations/profile";

afterEach(() => {
  cleanup();
});

describe("deriveComfortScore", () => {
  it("returns 5 when no pain is reported", () => {
    expect(deriveComfortScore("no", undefined)).toBe(5);
    expect(deriveComfortScore(undefined, undefined)).toBe(5);
  });

  it("maps pain severity to the expected derived comfort score", () => {
    expect(deriveComfortScore("yes", 1)).toBe(4);
    expect(deriveComfortScore("yes", 2)).toBe(3);
    expect(deriveComfortScore("yes", 3)).toBe(2);
    expect(deriveComfortScore("yes", 4)).toBe(2);
    expect(deriveComfortScore("yes", 5)).toBe(1);
  });
});

describe("getComfortMeta", () => {
  it("clamps out-of-range scores to the valid 1-5 band", () => {
    expect(getComfortMeta(0).score).toBe(1);
    expect(getComfortMeta(6).score).toBe(5);
  });
});

describe("ComfortLevelBar", () => {
  it("renders the comfort label, badge, and description for the selected score", () => {
    render(<ComfortLevelBar score={4} />);

    expect(screen.getByText("Mild discomfort")).toBeTruthy();
    expect(screen.getByText("4/5")).toBeTruthy();
    expect(screen.getByText("Occasional minor discomfort, manageable")).toBeTruthy();
  });
});
