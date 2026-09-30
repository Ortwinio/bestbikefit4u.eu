import { describe, expect, it } from "vitest";
import { accountFeedbackPlacement } from "./account-feedback-placement";

describe("account feedback launcher clearance", () => {
  it.each(["/nl/dashboard", "/en/profile/improve/flexibility", "/nl/bikes/new", "/en/gearing", "/nl/shoe-cleat-fit", "/en/app"])("clears mobile tabs on %s without moving desktop placement", (path) => {
    expect(accountFeedbackPlacement(path)).toContain("92px+env(safe-area-inset-bottom)");
    expect(accountFeedbackPlacement(path)).toContain("md:bottom-6 lg:bottom-8");
  });
  it.each(["/en", "/nl/login", "/en/calculators/bike-fit", "/en/profile-other"])("preserves public placement on %s", (path) => {
    expect(accountFeedbackPlacement(path)).toBeUndefined();
  });
});
