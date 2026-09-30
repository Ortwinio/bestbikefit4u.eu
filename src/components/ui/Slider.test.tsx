import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Slider } from "./Slider";

describe("Slider", () => {
  it.each([
    { value: 2105, valueLabel: "2.105", unit: "mm", expected: "2.105 mm" },
    { value: 8.5, valueLabel: "8,5", unit: "kg", expected: "8,5 kg" },
    { value: 8.5, valueLabel: "8,5 kg", expected: "8,5 kg" },
    { value: 2105, expected: "2105" },
    { value: 8.5, expected: "8.5" },
  ])("renders deterministic hidden output $expected", ({ value, valueLabel, unit, expected }) => {
    const html = renderToStaticMarkup(
      <Slider label="Waarde" value={value} valueLabel={valueLabel} unit={unit} onChange={() => {}} />,
    );
    expect(html.match(/<output\b[^>]*>(.*?)<\/output>/)?.[1]).toBe(expected);
    expect(html).toContain(`aria-valuetext="${valueLabel ?? value}${unit ? ` ${unit}` : ""}"`);
  });

  it("renders Prototyper-style slots with label, value, and helper wiring", () => {
    const html = renderToStaticMarkup(
      <Slider
        id="comfort"
        label="Comfort"
        tooltip="Move toward comfort for longer rides."
        tooltipLabel="Comfort help"
        helperText="Higher is softer."
        error="Comfort must be set."
        value={42}
        onChange={() => {}}
        valueLabel="42%"
      />,
    );

    expect(html).toContain('data-slot="slider"');
    expect(html.match(/id="comfort-label"/g)).toHaveLength(1);
    expect(html).toContain('data-slot="slider-control"');
    expect(html).toContain('data-slot="slider-track"');
    expect(html).toContain('data-slot="slider-indicator"');
    expect(html).toContain('data-slot="slider-thumb"');
    expect(html).toContain('data-slot="slider-value"');
    expect(html).toContain('aria-label="Comfort help"');
    expect(html).toContain(
      'aria-describedby="comfort-value comfort-tooltip-description comfort-error"',
    );
    expect(html).toContain("Move toward comfort for longer rides.");
    expect(html).toContain("Comfort must be set.");
    expect(html).not.toContain("Higher is softer.");
    expect(html).toContain("42%");
  });
});
