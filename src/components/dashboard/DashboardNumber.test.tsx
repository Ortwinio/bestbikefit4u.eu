import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DashboardNumber } from "./DashboardNumber";

describe("dashboard numeric typography", () => {
  it.each(["733 mm", "727-739 mm", "88%", "4,2 bar", "61 psi"])("keeps %s with a small muted unit", (value) => {
    const html = renderToStaticMarkup(<DashboardNumber value={value} />);
    expect(html).toContain(`data-dashboard-value="${value}"`);
    expect(html).toContain('class="font-mono"');
    expect(html).toContain('class="ml-1 text-xs text-muted-foreground"');
  });
  it("keeps score rows together in mono", () => {
    const html = renderToStaticMarkup(<DashboardNumber value="3/5" />);
    expect(html).toContain('class="font-mono">3/5');
  });
});
