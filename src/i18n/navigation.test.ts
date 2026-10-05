import { describe, expect, it } from "vitest";
import { isProtectedAppPath, withLocalePrefix } from "./navigation";

describe("navigation", () => {
  it("protects giving gifts without protecting the public redemption page", () => {
    for (const locale of ["nl", "en"]) {
      expect(isProtectedAppPath(`/${locale}/gifts`)).toBe(true);
      expect(isProtectedAppPath(`/${locale}/gift`)).toBe(false);
    }
  });
  it("treats saddle-selector as a protected app route", () => {
    expect(isProtectedAppPath("/en/saddle-selector")).toBe(true);
    expect(isProtectedAppPath("/nl/saddle-selector/history")).toBe(true);
  });

  it("adds locale prefixes consistently", () => {
    expect(withLocalePrefix("/saddle-selector", "en")).toBe("/en/saddle-selector");
    expect(withLocalePrefix("/dashboard", "nl")).toBe("/nl/dashboard");
  });
});
