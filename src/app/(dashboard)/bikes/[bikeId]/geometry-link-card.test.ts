import { describe, expect, it } from "vitest";
import { buildGeometryCardItems, getGeometryCardCopy } from "./GeometryLinkCard";

describe("bike detail geometry link card helpers", () => {
  it("builds linked reference items with source wording and no fit claim", () => {
    const copy = getGeometryCardCopy("en");
    const items = buildGeometryCardItems("en", {
      recordId: "record_1",
      brandName: "Canyon",
      modelName: "Endurace CF",
      modelYearLabel: "2024",
      sizeLabel: "M",
      stack: 580,
      reach: 395,
      seatTubeAngle: 73.5,
      headTubeAngle: 72.8,
      source: "manufacturer",
      sourceUrl: "https://example.com/geometry",
      status: "active",
      version: 2,
      supersededByRecordId: null,
    });

    expect(copy.linkedTitle).toBe("Linked geometry record");
    expect(copy.linkedDescription).toContain("reference geometry record");
    expect(copy.linkedDescription.toLowerCase()).not.toContain("fit recommendation");
    expect(items.find((item) => item.label === "Source")?.value).toBe("Manufacturer");
    expect(items.find((item) => item.label === "Stack")?.value).toBe("580");
  });

  it("returns the explicit unlinked-state copy", () => {
    const copy = getGeometryCardCopy("en");

    expect(copy.unlinkedTitle).toBe("No linked geometry record");
    expect(copy.unlinkedDescription).toContain("geometry-library match");
  });
});
