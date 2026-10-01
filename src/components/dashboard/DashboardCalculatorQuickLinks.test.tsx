/* @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { accountCalculatorNavigation } from "@/components/account/account-navigation";
import { DashboardCalculatorQuickLinks } from "./DashboardCalculatorQuickLinks";

afterEach(cleanup);

describe("dashboard calculator quick links", () => {
  it.each(["nl", "en"] as const)("renders every calculator once with %s labels and paths", (locale) => {
    render(<DashboardCalculatorQuickLinks locale={locale} />);
    const navigation = screen.getByRole("navigation", { name: "Calculators" });
    const links = within(navigation).getAllByRole("link");
    expect(links).toHaveLength(11);
    expect(new Set(links.map((link) => link.getAttribute("href"))).size).toBe(11);
    for (const tool of accountCalculatorNavigation(locale)) {
      const link = within(navigation).getByRole("link", { name: tool.label });
      expect(link.getAttribute("href")).toBe(`/${locale}${tool.href}`);
      expect(link.className).toContain("min-h-11");
      expect(link.className).toContain("hover:text-accent-foreground");
    }
  });
});
