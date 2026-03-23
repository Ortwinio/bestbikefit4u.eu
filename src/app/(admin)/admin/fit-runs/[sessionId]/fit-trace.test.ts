import { describe, expect, it } from "vitest";
import { collectFitTraceArtifacts, formatTraceValue } from "./fit-trace";

describe("fit trace helpers", () => {
  it("collects only renderable session trace artifacts", () => {
    const artifacts = collectFitTraceArtifacts({
      session: {
        fitOutputs: { saddleHeightMm: 742, reachMm: 391 },
        warnings: ["Low confidence"],
        outputValues: [],
      } as never,
      user: null,
      bike: null,
      profile: null,
      engineVersion: null,
    });

    expect(artifacts.map((artifact) => artifact.key)).toEqual(["fitOutputs", "warnings"]);
  });

  it("formats nested trace payloads as readable JSON", () => {
    expect(formatTraceValue({ warning: "Manual review", confidence: 0.54 })).toContain(
      '"warning": "Manual review"'
    );
    expect(formatTraceValue(["one", "two"])).toContain('"one"');
  });
});
