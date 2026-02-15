import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Input } from "@/components/ui";
import { Tooltip, getNextTooltipOpenState } from "./Tooltip";

describe("tooltip rendering and a11y wiring", () => {
  it("renders a trigger and descriptive text association", () => {
    const html = renderToStaticMarkup(
      <Tooltip
        content="Helpful guidance for this field."
        label="More help"
        descriptionId="tooltip-desc-test"
      />
    );

    expect(html).toContain('aria-label="More help"');
    expect(html).toContain('aria-describedby="tooltip-desc-test"');
    expect(html).toContain("Helpful guidance for this field.");
  });

  it("associates input aria-describedby with tooltip description", () => {
    const html = renderToStaticMarkup(
      <Input
        label="Email"
        tooltip="Use your account email address."
        tooltipLabel="Email help"
      />
    );

    expect(html).toContain('aria-label="Email help"');
    expect(html).toContain("Use your account email address.");

    const describedByMatches = [...html.matchAll(/aria-describedby="([^"]+)"/g)];
    expect(describedByMatches.length).toBeGreaterThanOrEqual(2);

    const triggerDescribedBy = describedByMatches[0][1];
    const inputDescribedBy = describedByMatches[1][1];
    expect(inputDescribedBy.split(" ")).toContain(triggerDescribedBy);
  });
});

describe("tooltip interaction logic", () => {
  it("opens on focus and closes on escape", () => {
    const opened = getNextTooltipOpenState(false, "focus");
    expect(opened).toBe(true);

    const closed = getNextTooltipOpenState(opened, "escape");
    expect(closed).toBe(false);
  });
});
