import { describe, expect, it } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { stripLocalePrefix } from "@/i18n/navigation";
import { accountNavigation, activeAccountPath } from "./account-navigation";

describe("account navigation", () => {
  it.each(["en", "nl"] as const)("keeps the same unique destinations with %s labels", (locale) => {
    const messages = getDashboardMessages(locale);
    const navigation = accountNavigation(messages);
    expect(navigation.map(({ href }) => href)).toEqual([
      "/dashboard", "/profile", "/bikes", "/bikes/new", "/fit-history", "/fit",
      "/pressure-calculator", "/gearing", "/saddle-selector", "/settings", "/feedback",
    ]);
    expect(new Set(navigation.map(({ href }) => href)).size).toBe(navigation.length);
    expect(navigation[0].label).toBe(messages.nav.dashboard);
    expect(navigation[1].label).toBe(messages.nav.profile);
    expect(navigation.every(({ label, icon }) => Boolean(label) && Boolean(icon))).toBe(true);
  });

  it.each([
    ["/nl/bikes/new/manual", "/bikes/new"],
    ["/en/bikes/bike-id/edit", "/bikes"],
    ["/nl/profile/improve/flexibility", "/profile"],
    ["/en/fit/session-id/results", "/fit"],
    ["/nl/fit-history", "/fit-history"],
    ["/en/profile-other", undefined],
    ["/nl/fit-history-other", undefined],
    ["/en/admin", undefined],
  ])("selects only the most specific account route for %s", (pathname, expected) => {
    const paths = accountNavigation(getDashboardMessages("en")).map(({ href }) => href);
    const original = [...paths];
    expect(activeAccountPath(stripLocalePrefix(pathname!), paths)).toBe(expected);
    expect(paths).toEqual(original);
  });
});
