import { describe, expect, it } from "vitest";
import {
  runBikeFitCalculation,
  runCrankLengthCalculation,
  runFrameSizeCalculation,
  runSaddleHeightCalculation,
} from "./fitAdapters";

describe("fitAdapters", () => {
  it("runs bike-fit and frame-size calculations from cm-based public inputs", () => {
    const result = runBikeFitCalculation({
      heightCm: 178,
      inseamCm: 84.5,
      category: "road",
      ridingGoal: "balanced",
      flexibility: 3,
      coreStability: 3,
      inseamSource: "measured",
    });

    expect(result.fitResult.saddleHeightMm).toBeGreaterThan(700);
    expect(result.fitResult.reachRange.min).toBeLessThan(result.fitResult.reachRange.max);
    expect(result.quickEstimate.estimatedFrameSize).toMatch(/54|56/);
  });

  it("runs saddle-height calculation from the shared refined baseline shape", () => {
    const result = runSaddleHeightCalculation({
      inseamCm: 84.5,
      category: "road",
      ridingGoal: "balanced",
      flexibility: 3,
      coreStability: 3,
      inseamSource: "measured",
    });

    expect(result.height).toBeGreaterThan(700);
    expect(result.range.min).toBeLessThan(result.height);
    expect(result.range.max).toBeGreaterThan(result.height);
  });

  it("runs frame-size and crank-length calculations from public inputs", () => {
    const frameSize = runFrameSizeCalculation({
      heightCm: 178,
      inseamCm: 84.5,
      category: "road",
      inseamSource: "measured",
    });
    const crankLength = runCrankLengthCalculation({
      inseamCm: 84.5,
      category: "road",
      inseamSource: "measured",
    });

    expect(frameSize.estimatedSaddleHeight).toBeGreaterThan(700);
    expect(frameSize.estimatedFrameSize).toMatch(/54|56/);
    expect(crankLength).toBeGreaterThanOrEqual(170);
  });
});
