import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { runEngineV1SeedMock, isEngineV2ShadowEnabledMock } = vi.hoisted(() => ({
  runEngineV1SeedMock: vi.fn(),
  isEngineV2ShadowEnabledMock: vi.fn(),
}));

vi.mock("../seedEngine", async () => {
  const actual = await vi.importActual<typeof import("../seedEngine")>(
    "../seedEngine"
  );
  return {
    ...actual,
    runEngineV1Seed: runEngineV1SeedMock,
  };
});

vi.mock("../shadowMode", () => ({
  isEngineV2ShadowEnabled: isEngineV2ShadowEnabledMock,
  buildShadowDeltas: vi.fn(),
}));

import { generateFromData } from "../actions";

describe("recommendations actions advisory notes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isEngineV2ShadowEnabledMock.mockReturnValue(false);
    runEngineV1SeedMock.mockReturnValue({
      fitInputs: {
        category: "road",
        ambition: "balanced",
        heightMm: 1800,
        inseamMm: 830,
        flexibilityScore: 7,
        coreScore: 4,
        torsoMm: 590,
        armMm: 640,
      },
      fitOutputs: {
        saddleHeightMm: 725,
        saddleSetbackMm: 55,
        barDropMm: 70,
        saddleToBarReachMm: 500,
        stemLengthMm: 100,
        stemAngleDeg: -6,
        crankLengthMm: 172.5,
        handlebarWidthMm: 420,
        cleatOffsetMm: 8,
        confidenceScore: 88,
        saddleHeightRange: { min: 720, max: 730 },
        barDropRange: { min: 65, max: 75 },
        reachRange: { min: 490, max: 510 },
        spacerStackMm: 10,
        warnings: [],
        frameStackTargetMm: 560,
        frameReachTargetMm: 390,
      },
      calculatedFit: {
        recommendedStackMm: 560,
        recommendedReachMm: 390,
        effectiveTopTubeMm: 550,
        saddleHeightMm: 725,
        saddleSetbackMm: 55,
        saddleHeightRange: { min: 720, max: 730 },
        handlebarDropMm: 70,
        handlebarReachMm: 500,
        stemLengthMm: 100,
        stemAngleRecommendation: "-6°",
        crankLengthMm: 172.5,
        handlebarWidthMm: 420,
      },
      comparisonSnapshot: {
        saddleHeightMm: 725,
        saddleSetbackMm: 55,
        barDropMm: 70,
        saddleToBarReachMm: 500,
        stemLengthMm: 100,
        crankLengthMm: 172.5,
        handlebarWidthMm: 420,
        confidenceScore: 88,
      },
      recommendationItems: [],
      confidenceScore: 88,
      algorithmVersion: "v-test",
    });
  });

  it("prepends advisory notes to generated fit notes", async () => {
    const runMutation = vi.fn(async () => undefined);
    const handler = (generateFromData as unknown as { _handler: TestHandler })._handler;

    await handler(
      {
        runMutation,
        scheduler: { runAfter: vi.fn() },
      },
      {
        sessionId: "session_1",
        userId: "user_1",
        heightCm: 180,
        inseamCm: 83,
        flexibilityScore: "good",
        coreStabilityScore: 4,
        bikeCategory: "road",
        ambition: "balanced",
        baselineEngineVersion: "v2",
        advisoryNotes: ["Imported bike suggests a performance bias."],
      }
    );

    expect(runMutation).toHaveBeenCalledTimes(1);
    const storedArgs = (runMutation.mock.calls[0] as unknown as [
      unknown,
      { fitNotes: string[] }
    ])[1];
    expect(storedArgs.fitNotes[0]).toBe(
      "Imported bike suggests a performance bias."
    );
    expect(storedArgs.fitNotes.some((note) => note.includes("Saddle height of"))).toBe(
      true
    );
  });

  it("passes the active baseline engine version into shadow comparisons", async () => {
    isEngineV2ShadowEnabledMock.mockReturnValue(true);
    const runMutation = vi.fn(async () => undefined);
    const schedulerRunAfter = vi.fn(async () => undefined);
    const handler = (generateFromData as unknown as { _handler: TestHandler })._handler;

    await handler(
      {
        runMutation,
        scheduler: { runAfter: schedulerRunAfter },
      },
      {
        sessionId: "session_1",
        userId: "user_1",
        heightCm: 180,
        inseamCm: 83,
        flexibilityScore: "good",
        coreStabilityScore: 4,
        bikeCategory: "road",
        ambition: "balanced",
        baselineEngineVersion: "v1",
      }
    );

    expect(schedulerRunAfter).toHaveBeenCalledTimes(1);
    const scheduledArgs = (schedulerRunAfter.mock.calls[0] as unknown as [
      number,
      unknown,
      { baselineEngineVersion: string }
    ])[2];
    expect(scheduledArgs.baselineEngineVersion).toBe("v1");
  });
});
