import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Selectable } from "./Selectable";

describe("Selectable", () => {
  it("renders the button contract with selection metadata", () => {
    const html = renderToStaticMarkup(
      <Selectable
        label="Road"
        description="Fast and efficient"
        badge={<span>Popular</span>}
        selected
      >
        Best for paved routes.
      </Selectable>
    );

    expect(html).toContain('data-slot="selectable"');
    expect(html).toContain('data-slot="selectable-content"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("Road");
    expect(html).toContain("Popular");
    expect(html).toContain("Best for paved routes.");
  });

  it("renders a radio-backed selectable when mode is radio", () => {
    const html = renderToStaticMarkup(
      <Selectable
        mode="radio"
        value="road"
        label="Road"
        description="Single choice"
      />
    );

    expect(html).toContain('data-slot="selectable"');
    expect(html).toContain("Road");
    expect(html).toContain("Single choice");
    expect(html).toContain('value="road"');
  });

  it("renders a checkbox-backed selectable when mode is checkbox", () => {
    const html = renderToStaticMarkup(
      <Selectable
        mode="checkbox"
        value={12}
        label="Twelve-speed"
        description="Multiple selections allowed"
      />
    );

    expect(html).toContain('data-slot="selectable"');
    expect(html).toContain("Twelve-speed");
    expect(html).toContain("Multiple selections allowed");
    expect(html).toContain('value="12"');
  });
});
