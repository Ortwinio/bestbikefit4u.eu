import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ToolsTabBar } from "./ToolsTabBar";

describe("ToolsTabBar", () => {
  it("renders eight real calculator links in board order and marks only the current page", () => {
    const html = renderToStaticMarkup(<ToolsTabBar activeTool="saddle-height" />);
    expect(html).toContain('aria-label="Fietstools"');
    expect(html.match(/<a /g)).toHaveLength(8);
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html.match(/<a [^>]*aria-current="page"[^>]*>/)?.[0]).toContain('href="/nl/calculators/saddle-height"');
    expect(html).toContain('href="/nl/bandenspanning-calculator"');
    expect(html).toContain('href="/nl/calculators/power-speed"');
    const labels = [...html.matchAll(/<a [^>]+>(.*?)<\/a>/g)].map((match) => match[1]);
    expect(labels).toEqual(["Bike fit", "Zadelhoogte", "Framemaat", "Bandenspanning", "Cranklengte", "Zadelbreedte", "Verzet", "Meer"]);
    expect(html).toContain("overflow-x-auto");
    expect(html).not.toContain('role="tab"');
  });

  it("localizes English links and names and supports the More active state", () => {
    const html = renderToStaticMarkup(<ToolsTabBar activeTool="more" locale="en" />);
    expect(html).toContain('aria-label="Cycling tools"');
    expect(html).toContain('href="/en/tire-pressure-calculator"');
    expect(html).toContain("Saddle height");
    expect(html.match(/<a [^>]*aria-current="page"[^>]*>/)?.[0]).toContain('href="/en/calculators/power-speed"');
  });
});
