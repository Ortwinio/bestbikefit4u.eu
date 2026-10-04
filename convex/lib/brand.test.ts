import { describe, expect, it } from "vitest";
import { BRAND, emailSender } from "./brand";

describe("BikeFitBoost email identity", () => {
  it("uses the migrated sender and support addresses by default", () => {
    expect(emailSender(" ")).toBe("BikeFitBoost <noreply@notifications.bikefitboost.com>");
    expect(BRAND.supportEmail).toBe("support@bikefitboost.com");
  });

  it("keeps the delivery address while replacing the display name", () => {
    expect(emailSender("Old brand <sender@example.org>"))
      .toBe("BikeFitBoost <sender@example.org>");
    expect(emailSender("sender@example.com")).toBe("BikeFitBoost <sender@example.com>");
    expect(emailSender("")).toBe(BRAND.authEmailFrom);
  });
});
