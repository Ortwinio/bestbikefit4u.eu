import { describe, expect, it } from "vitest";
import { BRAND, emailSender } from "./brand";

describe("BikeFitBoost email identity", () => {
  it("keeps the delivery address while replacing the display name", () => {
    expect(emailSender("Old brand <sender@bestbikefit4u.eu>"))
      .toBe("BikeFitBoost <sender@bestbikefit4u.eu>");
    expect(emailSender("sender@example.com")).toBe("BikeFitBoost <sender@example.com>");
    expect(emailSender("")).toBe(BRAND.authEmailFrom);
  });
});
