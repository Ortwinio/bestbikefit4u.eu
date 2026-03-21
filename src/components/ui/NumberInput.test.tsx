import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { NumberInput } from "./NumberInput";

describe("NumberInput", () => {
  it("merges tooltip, helper, and error descriptions and renders number field slots", () => {
    const html = renderToStaticMarkup(
      <NumberInput
        id="height"
        label="Height"
        tooltip="Use your measured standing height."
        tooltipLabel="Height help"
        helperText="Enter centimeters."
        error="Height is required."
        value={180}
        onChange={() => {}}
      />
    );

    expect(html).toContain('data-slot="field"');
    expect(html).toContain('data-slot="number-field"');
    expect(html).toContain('data-slot="number-field-group"');
    expect(html).toContain('data-slot="number-field-input"');
    expect(html).toContain('data-slot="number-field-steppers"');
    expect(html).toContain('aria-label="Height help"');
    expect(html).toContain(
      'aria-describedby="height-tooltip-description height-error"'
    );
    expect(html).toContain("Use your measured standing height.");
    expect(html).toContain("Height is required.");
    expect(html).not.toContain("Enter centimeters.");
    expect(html).toContain("Increase Height");
    expect(html).toContain("Decrease Height");
  });
});
