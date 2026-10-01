import { describe, expect, it } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { stripLocalePrefix } from "@/i18n/navigation";
import { accountNavigation, accountNavigationGroups, activeAccountPath } from "./account-navigation";

describe("account navigation", () => {
  it.each(["en", "nl"] as const)("keeps the same unique destinations with %s labels", (locale) => {
    const messages = getDashboardMessages(locale);
    const navigation = accountNavigation(messages);
    expect(navigation.map(({ href }) => href)).toEqual([
      "/dashboard", "/profile", "/bikes", "/bikes/new", "/fit-history", "/fit",
      "/settings", "/feedback",
    ]);
    expect(new Set(navigation.map(({ href }) => href)).size).toBe(navigation.length);
    expect(navigation[0].label).toBe(messages.nav.dashboard);
    expect(navigation[1].label).toBe(messages.nav.profile);
    expect(navigation.every(({ label, icon }) => Boolean(label) && Boolean(icon))).toBe(true);
  });

  it.each(["nl", "en"] as const)("groups every calculator once in %s", (locale) => {
    const groups = accountNavigationGroups(getDashboardMessages(locale), locale);
    const tools = groups[1];
    expect(tools.label).toBe("Calculators");
    expect(tools.items.map(({ href }) => href)).toEqual([
      "/tools/bike-fit", "/tools/saddle-height", "/tools/frame-size", "/tools/crank-length",
      "/pressure-calculator", "/gearing", "/saddle-selector", "/tools/power-speed",
      "/tools/climb-planner", "/tools/ftp-wkg", "/tools/fuel-hydration",
    ]);
    expect(tools.items.map(({ label }) => label)).toEqual(locale === "nl" ? [
      "Bikefit", "Zadelhoogte", "Framemaat", "Cranklengte", "Bandenspanning", "Verzet",
      "Zadelbreedte", "Vermogen en snelheid", "Klimplanner", "FTP en W/kg", "Voeding en drinken",
    ] : [
      "Bike fit", "Saddle height", "Frame size", "Crank length", "Tire pressure", "Gearing",
      "Saddle width", "Power and speed", "Climb planner", "FTP and W/kg", "Fuel and hydration",
    ]);
    const paths = groups.flatMap((group) => group.items.map(({ href }) => href));
    expect(new Set(paths).size).toBe(paths.length);
    for (const { href } of tools.items) {
      expect(activeAccountPath(href, paths)).toBe(href);
      expect(activeAccountPath(`${href}/details`, ["/tools", ...paths])).toBe(href);
      expect(activeAccountPath(`${href}-other`, paths)).toBeUndefined();
    }
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
