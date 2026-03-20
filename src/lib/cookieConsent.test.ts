import { describe, expect, it } from "vitest";
import { parseCookieConsent } from "./cookieConsent";

describe("parseCookieConsent", () => {
  it("returns accepted for the accepted string", () => {
    expect(parseCookieConsent("accepted")).toBe("accepted");
  });

  it("returns essential for the essential string", () => {
    expect(parseCookieConsent("essential")).toBe("essential");
  });

  it("returns null for an unknown value", () => {
    expect(parseCookieConsent("yes")).toBeNull();
    expect(parseCookieConsent("1")).toBeNull();
    expect(parseCookieConsent("true")).toBeNull();
  });

  it("returns null for null", () => {
    expect(parseCookieConsent(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(parseCookieConsent(undefined)).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(parseCookieConsent("")).toBeNull();
  });
});
