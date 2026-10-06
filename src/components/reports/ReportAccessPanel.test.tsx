// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ReportAccessPanel, ReportSafetyNote } from "./ReportAccessPanel";
import { getUsabilityPaidCopy } from "@/i18n/account/usabilityPaid";
import { reportAccessCopy } from "@/i18n/account/reportAccess";

afterEach(cleanup);

describe.each(["nl", "en"] as const)("report access invitation in %s", (locale) => {
  it("carries only the selected bike to single-fit checkout and keeps safety visible", () => {
    render(<><ReportAccessPanel locale={locale} bikeId="bike_owned" /><ReportSafetyNote locale={locale} /></>);
    const copy = reportAccessCopy[locale];
    expect(screen.getByRole("link", { name: getUsabilityPaidCopy(locale).singleAction }).getAttribute("href"))
      .toBe(`/${locale}/checkout?product=single&bikeId=bike_owned`);
    expect(screen.getByRole("link", { name: new RegExp(getUsabilityPaidCopy(locale).annual) }).getAttribute("href"))
      .toBe(`/${locale}/checkout?product=annual`);
    expect(screen.getByText(copy.safety)).toBeTruthy();
    expect(screen.getByText(getUsabilityPaidCopy(locale).boundaries.report.body)).toBeTruthy();
    expect(screen.queryByText(/Pro|\/ maand|€12[,.]50/)).toBeNull();
  });
});
