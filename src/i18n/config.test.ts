import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  normalizeLocale,
  resolveLocaleFromAcceptLanguage,
  resolvePreferredLocale,
} from "./config";

describe("i18n config helpers", () => {
  it("normalizes supported locale values", () => {
    expect(normalizeLocale("EN")).toBe("en");
    expect(normalizeLocale("nl-NL")).toBe("nl");
  });

  it("returns null for unsupported locale values", () => {
    expect(normalizeLocale("de")).toBeNull();
    expect(normalizeLocale("")).toBeNull();
    expect(normalizeLocale(undefined)).toBeNull();
  });

  it("resolves locale from accept-language with quality weights", () => {
    expect(
      resolveLocaleFromAcceptLanguage("en-US;q=0.8, nl-NL;q=0.9")
    ).toBe("nl");
  });

  it("ignores q=0 entries in accept-language", () => {
    expect(
      resolveLocaleFromAcceptLanguage("nl-NL;q=0, en-US;q=0.7")
    ).toBe("en");
  });

  it("falls back to default locale when accept-language has no supported values", () => {
    expect(resolveLocaleFromAcceptLanguage("de-DE, fr-FR;q=0.9")).toBe(
      DEFAULT_LOCALE
    );
  });

  it("prioritizes cookie locale over accept-language", () => {
    expect(
      resolvePreferredLocale({
        cookieLocale: "en",
        acceptLanguageHeader: "nl-NL,nl;q=0.9",
      })
    ).toBe("en");
  });

  it("falls back to accept-language when cookie locale is invalid", () => {
    expect(
      resolvePreferredLocale({
        cookieLocale: "de",
        acceptLanguageHeader: "nl-NL,nl;q=0.9",
      })
    ).toBe("nl");
  });
});
