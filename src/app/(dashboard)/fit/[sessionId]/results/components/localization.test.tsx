// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { getReportV2Copy } from "@/lib/reports/reportV2Copy";
import { mapReportV2Payload } from "@/lib/reports/reportV2Mapper";
import { fitResultsSource } from "../fixture.test-support";
import { RiderProfileCard } from "./RiderProfileCard";
import { BikeContextCard } from "./BikeContextCard";
import { getFitReportCopy, localizeFitValue } from "@/i18n/account/fitAudit";

const source = fitResultsSource as unknown as Parameters<typeof mapReportV2Payload>[0];

afterEach(cleanup);
describe("Dutch fit result enums", () => {
  it("adapts both Dutch core titles without changing frozen or English copy", () => {
    const copy = getFitReportCopy("nl");
    expect(copy.sections.coreStability).toBe("Rompstabiliteit");
    expect(copy.scoreMeta.coreStability.title).toBe("Rompstabiliteit");
    expect(copy.scoreMeta.coreStability.labels).toBe(getReportV2Copy("nl").scoreMeta.coreStability.labels);
    expect(copy.scoreMeta.coreStability.descriptions).toBe(getReportV2Copy("nl").scoreMeta.coreStability.descriptions);
    expect(getReportV2Copy("nl").scoreMeta.coreStability.title).toBe("Core stability");
    expect(getFitReportCopy("en")).toBe(getReportV2Copy("en"));
  });
  it.each(["nl", "en"] as const)("renders localized score titles in %s", (locale) => {
    const report = mapReportV2Payload(source);
    const { container } = render(<RiderProfileCard rider={{ ...report.rider, flexibilityScore: 3, coreStabilityScore: 4, comfortScore: 5 }} profile={report.profile} frameTargets={report.frameTargets} copy={getReportV2Copy(locale)} />);
    expect(container.textContent).toContain(locale === "nl" ? "Rompstabiliteit" : getReportV2Copy("en").sections.coreStability);
    expect(container.textContent).toContain(locale === "nl" ? "Flexibiliteit" : "Flexibility");
    expect(container.textContent).toContain(locale === "nl" ? "Comfort & ongemak" : getReportV2Copy("en").sections.comfort);
    if (locale === "nl") expect(container.textContent).not.toContain("Core stability");
  });
  it("translates mapped profile enums and flexibility without changing identifiers", () => {
    const report = mapReportV2Payload(source);
    const { container } = render(<RiderProfileCard rider={{ ...report.rider, flexibilityScore: 3, flexibilityLabel: "Average" }} profile={{ ...report.profile, bikeType: "Road", ridingStyle: "Racing", goal: "Aerodynamics" }} frameTargets={report.frameTargets} copy={getReportV2Copy("nl")} />);
    expect(container.textContent).toContain("Racefiets");
    expect(container.textContent).toContain("Wedstrijd");
    expect(container.textContent).toContain("Aerodynamica");
    expect(container.textContent).toContain("Gemiddeld");
    expect(container.textContent).not.toContain("Average");
    expect(container.textContent).toContain(report.profile.sessionId);
  });
  it("translates aerodynamics and casual riding in bike context", () => {
    const report = mapReportV2Payload(source);
    const { container } = render(<BikeContextCard bike={{ ...report.bike, goal: "aerodynamics", questionnaire: { ...report.bike.questionnaire, typeOfRiding: "casual" } }} copy={getReportV2Copy("nl")} />);
    expect(container.textContent).toContain("Aerodynamica");
    expect(container.textContent).toContain("Recreatief / conditie");
    expect(container.textContent).not.toContain("aerodynamics");
  });
  it("localizes pressure enums and preserves English values", () => {
    expect(localizeFitValue("Smooth asphalt", "nl")).toBe("Glad asfalt");
    expect(localizeFitValue("unknown_enum", "nl")).toBe("unknown_enum");
    expect(localizeFitValue("Smooth asphalt", "en")).toBe("Smooth asphalt");
  });
});
