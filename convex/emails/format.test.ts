import { describe, expect, it } from "vitest";
import { formatDate, formatNumber, formatPrice } from "./format";

const date = Date.UTC(2026, 1, 15, 23, 30);

describe("email locale formatting", () => {
  it("formats measurement decimals and thousands for each locale", () => {
    expect(formatNumber(172.5, "nl")).toBe("172,5");
    expect(formatNumber(172.5, "en")).toBe("172.5");
    expect(formatNumber(1200, "nl")).toBe("1.200");
    expect(formatNumber(1200, "en")).toBe("1,200");
    expect(formatNumber(754, "nl")).toBe("754");
  });
  it("formats the specification's date consistently in UTC", () => {
    expect(formatDate(date, "nl")).toBe("15-02-2026");
    expect(formatDate(date, "en")).toBe("15 Feb 2026");
    expect(formatDate(Date.UTC(2026, 1, 5), "nl")).toBe("05-02-2026");
    expect(formatDate(Date.UTC(2026, 1, 5), "en")).toBe("5 Feb 2026");
  });
  it("uses the literal monthly price and locale-specific decimal separator", () => {
    expect(formatPrice(9, "nl")).toBe("€9 per maand");
    expect(formatPrice(9, "en")).toBe("€9 per month");
    expect(formatPrice(9.5, "nl")).toBe("€9,5 per maand");
    expect(formatPrice(9.5, "en")).toBe("€9.5 per month");
  });
});
