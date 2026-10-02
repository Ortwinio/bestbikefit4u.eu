import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE } from "../../src/i18n/config";
import { loginEmailLocale, resolveEmailLocale } from "./locale";

describe("resolveEmailLocale", () => {
  it.each(["nl", "en"] as const)("prefers saved %s over the request", (locale) => {
    expect(resolveEmailLocale({ locale }, locale === "nl" ? "en" : "nl")).toBe(locale);
  });

  it.each([undefined, null, {}])("uses the explicit request for user %s", (user) => {
    expect(resolveEmailLocale(user, "nl")).toBe("nl");
    expect(resolveEmailLocale(user, "en")).toBe("en");
  });

  it.each([undefined, null, "", "de", "NL", "nl-NL", "rider@example.nl", " nl ", 1, {}, ["nl"]])(
    "uses the site default for an unsupported request %s",
    (requestLocale) => {
      expect(resolveEmailLocale(undefined, requestLocale)).toBe(DEFAULT_LOCALE);
    }
  );

  it("reads a changed user preference on every call", () => {
    const user: { locale: "nl" | "en" } = { locale: "en" };
    expect(resolveEmailLocale(user, "en")).toBe("en");
    user.locale = "nl";
    expect(resolveEmailLocale(user, "en")).toBe("nl");
  });
});

describe("loginEmailLocale", () => {
  it.each([
    ["https://example.com/nl/login?code=123", "nl"],
    ["https://example.com/en", "en"],
    ["/nl", "nl"],
    ["/en/login", "en"],
    ["https://example.com/auth?redirectTo=%2Fnl%2Fdashboard", "nl"],
    ["https://example.com/auth?redirectTo=https%3A%2F%2Fexample.com%2Fnl%2Fdashboard", "nl"],
    ["/auth?redirectTo=%2Fen%2Fdashboard", "en"],
    ["/en/login?redirectTo=%2Fnl%2Fdashboard", "en"],
    ["/nl/login?redirectTo=%2Fen%2Fdashboard", "nl"],
  ])("parses explicit paths in %s", (url, locale) => {
    expect(loginEmailLocale(url)).toBe(locale);
  });

  it.each([
    "",
    "http://[invalid",
    "nl/dashboard",
    "javascript:/nl/dashboard",
    "https://nl.example.com/auth",
    "https://example.nl/auth",
    "/login?locale=nl",
    "/login?email=rider%40example.nl",
    "/login?next=%2Fnl%2Fdashboard",
    "/login#/nl/dashboard",
    "/other/nl/dashboard",
    "/nlish/login",
    "/nl-NL/login",
    "/NL/login",
    "/auth?redirectTo=%2Fother%2Fnl%2Fdashboard",
    "/auth?redirectTo=https%3A%2F%2Fnl.example.com%2Fdashboard",
    "/auth?redirectTo=%2Fdashboard%3Flocale%3Dnl",
    "/auth?redirectTo=%2Fdashboard%23%2Fnl",
    "/auth?redirectTo=nl%2Fdashboard",
    "/auth?redirectTo=javascript%3A%2Fnl%2Fdashboard",
    "/auth?redirectTo=http%3A%2F%2F%5Binvalid",
  ])("does not infer a language from %s", (url) => {
    expect(loginEmailLocale(url)).toBe(DEFAULT_LOCALE);
  });
});
