import { describe, expect, it } from "vitest";
import type { Id } from "../../../../../convex/_generated/dataModel";
import {
  buildGeometryRecordCreateArgs,
  createGeometryRecordDraft,
  getNextGeometryVersion,
} from "./geometry-record-utils";

describe("geometry record utils", () => {
  it("creates a draft from a live record", () => {
    expect(
      createGeometryRecordDraft({
        source: "admin_manual",
        sourceUrl: "https://example.com",
        changeReason: "Initial import",
        stack: 570,
        reach: null,
        seatTubeAngle: 73.5,
        headTubeAngle: 74,
        wheelbase: 1005,
        chainstay: 410,
        bbDrop: 72,
        effectiveTopTube: 555,
        standover: 785,
        forkRake: 45,
        headTubeLength: 145,
      })
    ).toEqual({
      source: "admin_manual",
      sourceUrl: "https://example.com",
      changeReason: "Initial import",
      stack: 570,
      reach: null,
      seatTubeAngle: 73.5,
      headTubeAngle: 74,
      wheelbase: 1005,
      chainstay: 410,
      bbDrop: 72,
      effectiveTopTube: 555,
      standover: 785,
      forkRake: 45,
      headTubeLength: 145,
    });
  });

  it("serializes a geometry draft for mutation input", () => {
    expect(
      buildGeometryRecordCreateArgs({
        brandId: "brand_1" as Id<"geometry_brands">,
        modelId: "model_1" as Id<"geometry_models">,
        sizeLabel: " 54 ",
        draft: {
          source: "manufacturer",
          sourceUrl: " https://example.com/spec ",
          changeReason: "  Geometry correction ",
          stack: 570,
          reach: null,
          seatTubeAngle: null,
          headTubeAngle: null,
          wheelbase: null,
          chainstay: null,
          bbDrop: null,
          effectiveTopTube: null,
          standover: null,
          forkRake: null,
          headTubeLength: null,
        },
      })
    ).toEqual({
      brandId: "brand_1",
      modelId: "model_1",
      sizeLabel: "54",
      source: "manufacturer",
      sourceUrl: "https://example.com/spec",
      changeReason: "Geometry correction",
      stack: 570,
      reach: undefined,
      seatTubeAngle: undefined,
      headTubeAngle: undefined,
      wheelbase: undefined,
      chainstay: undefined,
      bbDrop: undefined,
      effectiveTopTube: undefined,
      standover: undefined,
      forkRake: undefined,
      headTubeLength: undefined,
    });
  });

  it("computes the next version number from history", () => {
    expect(getNextGeometryVersion([{ version: 1 }, { version: 3 }, { version: 2 }])).toBe(4);
    expect(getNextGeometryVersion([])).toBe(1);
  });
});
