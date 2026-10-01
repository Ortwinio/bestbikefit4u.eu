import { htmlText } from "../../../scripts/lib/html.mjs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DashboardFitRange } from "./DashboardFitRange";

describe("dashboard report range", () => {
  it.each([
    ["742 mm", 25],
    ["748 mm", 50],
    ["754 mm", 75],
    ["736 mm", 0],
    ["760 mm", 100],
    ["730 mm", 0],
    ["766 mm", 100],
  ])("positions target %s at %s percent of the padded track", (target, percent) => {
    const html = renderToStaticMarkup(<DashboardFitRange target={target} range="742 mm - 754 mm" />);
    expect(html).toContain(`data-left-pct="${percent}"`);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("border-border bg-muted");
    expect(html).toContain("left-1/4 top-1 h-2 w-1/2 rounded-full bg-accent");
    expect(htmlText(html)).toBe("");
  });
  it.each([null, "n/a", "740 mm - 740 mm", "754 mm - 742 mm", `${"9".repeat(309)} mm - 754 mm`])("omits missing or unusable range %s", (range) => {
    expect(renderToStaticMarkup(<DashboardFitRange target="748 mm" range={range} />)).toBe("");
  });
  it.each(["n/a", "Infinity"])("omits unusable target %s", (target) => {
    expect(renderToStaticMarkup(<DashboardFitRange target={target} range="742 mm - 754 mm" />)).toBe("");
  });
});
