import { fitPageDetails } from "./fitPageDetails";
import { describe, expect, it } from "vitest";
import { saddleWidthMessages } from "./saddleWidth";
import { frameSizeMessages } from "./frameSize";

describe("Dutch calculator choices", () => {
  it("translates saddle families and riding labels while keeping English unchanged", () => {
    expect(saddleWidthMessages.nl.families.short_nose_performance).toBe("Sportief / korte neus");
    expect(saddleWidthMessages.nl.families.endurance_allroad).toBe("Lange ritten / gemengd terrein");
    expect(saddleWidthMessages.nl.rides.endurance_road).toBe("Lange ritten");
    expect(saddleWidthMessages.nl.rides.indoor_only).toBe("Alleen binnen");
    expect(saddleWidthMessages.en.rides.indoor_only).toBe("Indoor only");
  });
  it("describes Dutch road frame choices without an English endurance label", () => {
    expect(frameSizeMessages.nl.categories.road.description).toBe("Wegfiets, lange ritten");
    expect(frameSizeMessages.en.categories.road.description).toBe("Road, endurance");
  });
});

it("uses Dutch core stability terminology in fit metadata and structured data", () => {
  expect(fitPageDetails.nl.saddleDescription).toContain("je lengte");
  expect(fitPageDetails.nl.saddleDescription).toContain("gemeten binnenbeen");
  expect(fitPageDetails.nl.saddleDescription).not.toContain("rompstabiliteit");
  expect(fitPageDetails.nl.saddleSchemaName).toBe("BikeFitBoost Zadelhoogte calculator");
  expect(fitPageDetails.nl.bikeCoreStep).toBe("Vul je lenigheid en rompstabiliteit in.");
  expect(fitPageDetails.en.saddleSchemaName).toBe("BikeFitBoost Saddle Height Calculator");
});
