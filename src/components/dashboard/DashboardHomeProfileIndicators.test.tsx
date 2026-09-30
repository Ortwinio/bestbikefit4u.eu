import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getReportV2Copy } from "@/lib/reports/reportV2Copy";
import { mapReportV2Payload } from "@/lib/reports/reportV2Mapper";
import { fitResultsSource } from "@/app/(dashboard)/fit/[sessionId]/results/fixture.test-support";
import { DashboardHomeProfileIndicators } from "./DashboardHomeProfileIndicators";

describe.each(["nl", "en"] as const)("dashboard report scores in %s", (locale) => {
  it.each([1, 2, 3, 5])("matches the PDF comfort score for severity %s", (painSeverity) => {
    const source = { ...fitResultsSource, profile: { ...fitResultsSource.profile, painSeverity } };
    const report = mapReportV2Payload(source as unknown as Parameters<typeof mapReportV2Payload>[0]);
    const score = report.rider.comfortScore as 1 | 2 | 3 | 4 | 5;
    const html = renderToStaticMarkup(<DashboardHomeProfileIndicators
      profile={{ ...source.profile, flexibilityScore: "good" }} locale={locale}
      messages={getDashboardMessages(locale)} />);
    expect(html).toContain(getReportV2Copy(locale).scoreMeta.comfort.labels[score]);
    expect(html).toContain(`aria-valuenow="${score}"`);
  });
});
