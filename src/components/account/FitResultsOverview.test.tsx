import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FitResultsOverview } from "./FitResultsOverview";
import { FitResultsValue, formatFitResultsNumber } from "./FitResultsValue";
import { getReportV2Copy } from "@/lib/reports/reportV2Copy";
import { mapReportV2Payload } from "@/lib/reports/reportV2Mapper";
import { fitResultsSource } from "@/app/(dashboard)/fit/[sessionId]/results/fixture.test-support";

describe("fit results presentation", () => {
  function render(paid: boolean, current = true) {
    const report = mapReportV2Payload({
      ...fitResultsSource,
      bike: { ...fitResultsSource.bike, currentSetup: current ? fitResultsSource.bike.currentSetup : undefined },
    } as never);
    return renderToStaticMarkup(<FitResultsOverview locale="nl" copy={getReportV2Copy("nl")} report={report} fit={fitResultsSource.recommendation.calculatedFit} profileLabel="Hoofdprofiel" hasPaidAccess={paid} />);
  }
  it("shows actual targets and current saddle only with paid access", () => {
    const html = render(true);
    expect(html).toContain("748 mm");
    expect(html).toContain("data-current-saddle");
    expect(html).toContain("Nu naast je doel");
  });
  it("never invents a current position or delta for missing setup", () => {
    const html = render(true, false);
    expect(html).not.toContain("data-current-saddle");
    expect(html).toContain("Niet bekend");
  });
  it("keeps current comparisons behind the existing paid gate", () => {
    const html = render(false);
    expect(html).not.toContain("data-current-saddle");
    expect(html).not.toContain("Nu naast je doel");
    expect(html).toContain("748 mm");
  });
  it("labels paid ranges only when actual uncertainty evidence is available", () => {
    const report = mapReportV2Payload(fitResultsSource as never);
    const renderRange = () => renderToStaticMarkup(<FitResultsOverview locale="nl" copy={getReportV2Copy("nl")}
      report={report} fit={fitResultsSource.recommendation.calculatedFit} profileLabel="Hoofdprofiel"
      hasPaidAccess showAccessLabel />);
    expect(renderRange()).toContain('data-presentation="range-chip"');
    report.detailedFit.forEach(row => { row.reliability95 = null; });
    expect(renderRange()).not.toContain('data-presentation="range-chip"');
  });
  it("formats decimals by locale without changing precision", () => {
    expect(formatFitResultsNumber(172.5, "nl")).toBe("172,5");
    expect(formatFitResultsNumber(172.5, "en")).toBe("172.5");
    expect(formatFitResultsNumber(0, "nl")).toBe("0");
    expect(formatFitResultsNumber(-2.25, "nl")).toBe("-2,25");
    const html = renderToStaticMarkup(<FitResultsValue value="172.5 mm" locale="nl" />);
    expect(html).toContain('class="font-mono">172,5');
    expect(html).toContain("<span> mm</span>");
  });
});
