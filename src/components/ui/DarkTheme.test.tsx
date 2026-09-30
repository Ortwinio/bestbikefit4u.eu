/* @vitest-environment jsdom */
import { resolve } from "node:path";
import { readFileSync, readdirSync } from "node:fs";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Gauge } from "./Gauge";
import { ResultHero } from "./ResultHero";
import { Slider } from "./Slider";
import { OptionCard } from "./OptionCard";
import { SegmentedControl, SegmentedControlItem } from "./SegmentedControl";
import { InfoBox } from "./InfoBox";

const directory = resolve("src/components/ui");
afterEach(() => {
  cleanup();
  document.documentElement.classList.remove("dark");
});

describe("shared dark theme contracts", () => {
  it("rejects raw OKLCH channel tokens used as complete colors in shared controls", () => {
    const colorTokens = "foreground|background|card|border|primary|danger|muted-foreground|popover";
    const invalid = new RegExp(String.raw`(?:text|bg|border|outline|ring)-\[(?:color:)?var\(--(?:${colorTokens})\)\]`);
    const files = readdirSync(directory).filter((name) => name.endsWith(".tsx") && !name.includes(".test."));
    for (const file of files) {
      const source = readFileSync(resolve(directory, file), "utf8");
      expect(source, file).not.toMatch(invalid);
      // Destructive is a salmon surface; readable error copy uses destructive-text.
      expect(source, file).not.toMatch(/(?:^|[\s:])text-(?:destructive|danger)(?=[\s"/])/);
    }
    const globals = readFileSync(resolve("src/app/globals.css"), "utf8");
    expect(globals).not.toContain("2px var(--field-border-invalid)");
  });

  it("keeps gauge labels inherited on fixed lime panels without changing meter data", () => {
    document.documentElement.classList.add("dark");
    const { container } = render(
      <ResultHero label="Pressure result" value="4.2" unit="bar">
        <h3>Starting point</h3>
        <Gauge label="Comfort" value={74} unit="%" />
      </ResultHero>,
    );
    const panel = screen.getByRole("region", { name: "Pressure result" });
    expect(panel.className).toContain("text-[var(--bbf-inkt)]");
    expect(panel.className).toContain("[--gauge-accent:var(--bbf-petrol)]");
    expect(container.querySelectorAll(".text-muted-foreground, .text-foreground")).toHaveLength(0);
    const meter = screen.getByRole("meter", { name: "Comfort" });
    expect(meter.getAttribute("aria-valuenow")).toBe("74");
    expect(meter.getAttribute("aria-valuetext")).toBe("74 %");
    expect(meter.querySelectorAll("path")[1].getAttribute("stroke")).toBe("var(--gauge-accent)");
  });

  it("keeps interactive keyboard state and visible focus hooks in dark mode", () => {
    document.documentElement.classList.add("dark");
    const changed = vi.fn();
    const select = vi.fn();
    render(
      <>
        <Slider label="Inseam" value={84} min={60} max={100} onChange={changed} />
        <OptionCard label="Road" selected onClick={select} />
        <SegmentedControl aria-label="Goal" defaultValue="comfort" variant="strong">
          <SegmentedControlItem value="comfort">Comfort</SegmentedControlItem>
          <SegmentedControlItem value="performance">Performance</SegmentedControlItem>
        </SegmentedControl>
      </>,
    );
    const slider = screen.getByRole("slider", { name: "Inseam" });
    slider.focus();
    expect(document.activeElement).toBe(slider);
    expect(slider.closest("[data-slot=slider-thumb]")?.className).toContain("focus-within:focus-ring");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(changed).toHaveBeenCalledWith(85);
    const option = screen.getByRole("button", { name: "Road" });
    option.focus();
    expect(document.activeElement).toBe(option);
    expect(option.className).toContain("focus-visible:focus-ring");
    fireEvent.click(option);
    expect(select).toHaveBeenCalledOnce();
    const performance = screen.getByRole("radio", { name: "Performance" });
    fireEvent.click(performance);
    expect(performance.getAttribute("aria-checked")).toBe("true");
    expect(performance.className).toContain("focus-visible:focus-ring");
  });

  it("keeps status surfaces valid CSS color expressions in both themes", () => {
    const { container } = render(
      <div className="dark">
        <InfoBox variant="warning">Check the measurement</InfoBox>
        <InfoBox variant="danger">Measurement unavailable</InfoBox>
      </div>,
    );
    for (const message of ["Check the measurement", "Measurement unavailable"]) {
      const surface = screen.getByText(message).parentElement!;
      expect(surface.className).toContain("oklch(var(");
      expect(surface.className).not.toMatch(/in_oklch,var\(--/);
    }
    expect(container.querySelectorAll(".text-foreground")).toHaveLength(2);
  });
});
