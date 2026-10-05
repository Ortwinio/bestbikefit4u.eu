// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DashboardReliabilityReport, type DashboardReliabilityRow } from "./DashboardReliabilityReport";
import { getReliabilityDashboardCopy } from "@/i18n/account/reliabilityDashboard";

const rows: DashboardReliabilityRow[] = [
  { key: "saddleHeight", value: 787, halfWidth: 23, low: 765, high: 810, min: 725.75, max: 848.25, basis: "Inseam 1×" },
  { key: "saddleSetback", value: 51, halfWidth: 15, low: 35, high: 65, min: 32.25, max: 69.75, basis: "Femur" },
  { key: "handlebarDrop", value: 97, halfWidth: 20, low: 75, high: 115, min: 59.5, max: 134.5, basis: "Flexibility" },
  { key: "handlebarReach", value: 569, halfWidth: 15, low: 555, high: 585, min: 537.75, max: 600.25, basis: "Torso + arm" },
];

afterEach(cleanup);

describe.each(["nl", "en"] as const)("dashboard reliability rows (%s)", locale => {
  const copy = getReliabilityDashboardCopy(locale);

  it("keeps A–D order and backend values, widths, basis and accessible ranges", () => {
    const { container } = render(<DashboardReliabilityReport rows={[...rows].reverse()} greatestGain={null} locale={locale} />);
    const rendered = [...container.querySelectorAll("[data-reliability-row]")];
    expect(rendered.map(row => row.getAttribute("data-reliability-row"))).toEqual(rows.map(row => row.key));
    expect(screen.getAllByRole("img")).toHaveLength(4);
    rows.forEach((row, index) => {
      expect(rendered[index].textContent).toContain(`± ${row.halfWidth} mm`);
      expect(rendered[index].textContent).toContain(`${copy.basedOn}: ${row.basis}`);
      const description = locale === "nl"
        ? `${copy.parameters[row.key]} ${row.value} mm, bereik ${row.low} tot ${row.high} mm`
        : `${copy.parameters[row.key]} ${row.value} mm, range ${row.low} to ${row.high} mm`;
      expect(within(rendered[index] as HTMLElement).getByRole("img", { name: description })).toBeTruthy();
    });
  });

  it("shows exactly one localized greatest-gain link", () => {
    render(<DashboardReliabilityReport rows={rows} locale={locale}
      greatestGain={{ text: "Inseam → ± 18 mm", href: "/profile" }} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0].textContent).toContain(`${copy.greatestGain}: Inseam → ± 18 mm`);
    expect(links[0].getAttribute("href")).toBe(`/${locale}/profile`);
    expect(links[0].className).toContain("focus-visible:outline");
  });

  it("keeps unverified ranges dashed and respects reduced motion", () => {
    const { container } = render(<DashboardReliabilityReport rows={[{ ...rows[0], dashed: true }]}
      locale={locale} greatestGain={null} />);
    const zone = container.querySelector("[data-range-zone]");
    expect(zone?.className).toContain("border-dashed");
    expect(zone?.className).toContain("motion-reduce:transition-none");
  });

  it.each([NaN, Infinity])("does not invent an interval for corrupt value %s", value => {
    render(<DashboardReliabilityReport rows={[{ ...rows[0], value }]} locale={locale} greatestGain={null} />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText(copy.unavailable)).toBeTruthy();
  });

  it("does not invent rows, a basis or a next step for missing data", () => {
    render(<DashboardReliabilityReport rows={[{ ...rows[0], basis: "" }]} locale={locale} greatestGain={null} />);
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.getByText(`${copy.basedOn}: ${copy.missing}`)).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
