// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ReportAccessPanel, ReportSafetyNote } from "./ReportAccessPanel";
import { reportAccessCopy } from "@/i18n/account/reportAccess";

afterEach(cleanup);

describe.each(["nl", "en"] as const)("report access invitation in %s", (locale) => {
  it("carries only the selected bike to single-fit checkout and keeps safety visible", () => {
    render(<><ReportAccessPanel locale={locale} bikeId="bike_owned" /><ReportSafetyNote locale={locale} /></>);
    const copy = reportAccessCopy[locale];
    expect(screen.getByRole("link", { name: copy.singleCta }).getAttribute("href"))
      .toBe(`/${locale}/checkout?product=single&bikeId=bike_owned`);
    expect(screen.getByRole("link", { name: copy.annualCta }).getAttribute("href"))
      .toBe(`/${locale}/checkout?product=annual`);
    expect(screen.getByText(copy.safety)).toBeTruthy();
    expect(screen.getByText(copy.unlockBody)).toBeTruthy();
    expect(screen.queryByText(/Pro|\/ maand|€12[,.]50/)).toBeNull();
  });
});
