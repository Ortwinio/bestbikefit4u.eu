import { describe, expect, it } from "vitest";
import { AUTHORSHIP, getAuthorUrl, getGuideUpdatedDate } from "./authorship";

describe("confirmed authorship configuration", () => {
  it("has one confirmed name and no unverified profiles", () => {
    expect(AUTHORSHIP.name).toBe("Ortwin Verreck");
    expect(AUTHORSHIP.sameAs).toEqual({ person: [], organization: [] });
    expect(getAuthorUrl("nl")).toBe("https://www.bikefitboost.com/nl/authors/ortwin-verreck");
    expect(getAuthorUrl("en")).toBe("https://www.bikefitboost.com/en/authors/ortwin-verreck");
  });
  it("normalizes the actual recorded day without supplying a fallback", () => {
    expect(getGuideUpdatedDate("2026-10-01")).toBe("2026-10-01");
    expect(getGuideUpdatedDate(Date.parse("2026-09-29T23:45:00Z"))).toBe("2026-09-29");
    for (const value of [undefined, null, "", "2026-02-30", "unknown", 0, -1, NaN, Infinity]) {
      expect(getGuideUpdatedDate(value)).toBeUndefined();
    }
  });
});
