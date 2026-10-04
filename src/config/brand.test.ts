import { describe, expect, it } from "vitest";
import { BRAND } from "./brand";
import { BRAND as backendBrand } from "../../convex/lib/brand";

describe("migrated contact identity", () => {
  it("keeps frontend and backend sender and support addresses aligned", () => {
    expect(BRAND.authEmailFrom).toBe("BikeFitBoost <noreply@notifications.bikefitboost.com>");
    expect(BRAND.supportEmail).toBe("support@bikefitboost.com");
    expect(BRAND.authEmailFrom).toBe(backendBrand.authEmailFrom);
    expect(BRAND.supportEmail).toBe(backendBrand.supportEmail);
  });
});
