import { describe, expect, it } from "vitest";
import {
  ANNUAL_UPGRADE_COUPON_CENTS,
  CONSUMER_PRODUCTS,
  GIFT_VALUE_CENTS,
  PERSONAL_FIT_ADDON_CENTS,
  PERSONAL_FIT_STANDALONE_CENTS,
  UPGRADE_WINDOW_MONTHS,
  formatEuroCents,
} from "./pricing";

describe("pricing model v2", () => {
  it("charges €21,50 for the annual licence every year, without a renewal discount", () => {
    expect(CONSUMER_PRODUCTS.annual.firstChargeCents).toBe(2150);
    expect(CONSUMER_PRODUCTS.annual.renewalCents).toBe(2150);
  });

  it("sells a single fit for €13,50 as a one-off for one bike and three months", () => {
    const single = CONSUMER_PRODUCTS.single_fit;
    expect(single.firstChargeCents).toBe(1350);
    expect(single.renewalCents).toBeNull();
    expect(single.bikeLimit).toBe(1);
    expect(single.accessMonths).toBe(3);
  });

  it("upgrades a single fit to the annual licence for €9,50, then renews at €21,50", () => {
    expect(CONSUMER_PRODUCTS.annual_upgrade.firstChargeCents).toBe(950);
    expect(CONSUMER_PRODUCTS.annual_upgrade.renewalCents).toBe(2150);
    expect(ANNUAL_UPGRADE_COUPON_CENTS).toBe(1200);
  });

  it("prices the annual licence with a personal fit at €234,50 in year one", () => {
    expect(PERSONAL_FIT_ADDON_CENTS).toBe(21300);
    expect(CONSUMER_PRODUCTS.annual_personal_fit.firstChargeCents).toBe(23450);
    expect(CONSUMER_PRODUCTS.annual_personal_fit.renewalCents).toBe(2150);
    expect(CONSUMER_PRODUCTS.annual_personal_fit.includesPersonalFitAppointment).toBe(true);
  });

  it("sells a standalone personal fit appointment for €209,50 and allows upgrades for 6 months", () => {
    expect(PERSONAL_FIT_STANDALONE_CENTS).toBe(20950);
    expect(UPGRADE_WINDOW_MONTHS).toBe(6);
  });

  it("values a gift fit at the single fit price", () => {
    expect(GIFT_VALUE_CENTS).toBe(CONSUMER_PRODUCTS.single_fit.firstChargeCents);
  });

  it("formats prices per locale", () => {
    expect(formatEuroCents(2150, "nl")).toMatch(/21,50/);
    expect(formatEuroCents(23450, "en")).toMatch(/234\.50/);
  });
});
