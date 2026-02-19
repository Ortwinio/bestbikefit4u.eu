import { describe, expect, it } from "vitest";
import { buildLocaleSwitchHref } from "@/i18n/switchHref";

describe("dashboard locale switch integration", () => {
  it("keeps dashboard root path while switching locale", () => {
    const href = buildLocaleSwitchHref({
      pathname: "/en/dashboard",
      queryString: "",
      locale: "nl",
    });

    expect(href).toBe("/nl/dashboard");
  });

  it("keeps fit questionnaire dynamic route and query params", () => {
    const href = buildLocaleSwitchHref({
      pathname: "/nl/fit/session_123/questionnaire",
      queryString: "source=resume&step=8",
      locale: "en",
    });

    expect(href).toBe("/en/fit/session_123/questionnaire?source=resume&step=8");
  });

  it("keeps fit results route when switching from unprefixed route", () => {
    const href = buildLocaleSwitchHref({
      pathname: "/fit/session_456/results",
      queryString: "from=email",
      locale: "nl",
    });

    expect(href).toBe("/nl/fit/session_456/results?from=email");
  });

  it("keeps nested bikes edit route and query params", () => {
    const href = buildLocaleSwitchHref({
      pathname: "/en/bikes/bk_789/edit",
      queryString: "tab=geometry",
      locale: "nl",
    });

    expect(href).toBe("/nl/bikes/bk_789/edit?tab=geometry");
  });
});
