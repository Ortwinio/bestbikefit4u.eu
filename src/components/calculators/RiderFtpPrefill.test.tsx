/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { getRiderFtp, RiderFtpPrefill } from "./RiderFtpPrefill";

afterEach(cleanup);
describe("profile FTP attribution", () => {
  it.each([undefined, null, {}, { ftpWatts: NaN }, { ftpWatts: 79 }, { ftpWatts: 501 }])(
    "does not manufacture profile FTP from missing/unsupported data: %j", (profile) => {
      expect(getRiderFtp(profile)).toBeNull();
    },
  );
  it.each(["nl", "en"] as const)("formats a real recorded date in %s", (locale) => {
    const measuredAt = Date.UTC(2026, 8, 15);
    render(<RiderFtpPrefill ftp={{ watts: 245, measuredAt }} locale={locale} />);
    const date = screen.getByText(new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(measuredAt));
    expect(date.getAttribute("datetime")).toBe("2026-09-15T00:00:00.000Z");
  });
  it.each([undefined, NaN, Infinity])("reports unknown date without inventing a measurement date (%s)", (measuredAt) => {
    render(<RiderFtpPrefill ftp={{ watts: 245, measuredAt }} locale="en" />);
    expect(screen.getByText(/Date unknown/)).toBeTruthy();
    expect(document.querySelector("time")).toBeNull();
  });
});
