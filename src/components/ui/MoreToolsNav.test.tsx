import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MoreToolsNav, type MoreTool } from "./MoreToolsNav";

describe("MoreToolsNav", () => {
  it.each<MoreTool>(["power-speed", "climb-planner", "ftp-wkg", "fuel-hydration"])("links to all four tools and marks %s active", (activeTool) => {
    const html = renderToStaticMarkup(<MoreToolsNav activeTool={activeTool} />);
    expect(html).toContain('aria-label="Meer fietstools"');
    expect(html.match(/<a /g)).toHaveLength(4);
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html.match(/<a [^>]*aria-current="page"[^>]*>/)?.[0]).toContain(`href="/nl/calculators/${activeTool}"`);
    const labels = [...html.matchAll(/<a [^>]+>(.*?)<\/a>/g)].map((match) => match[1]);
    expect(labels).toEqual(["Vermogen ↔ snelheid", "Klimplanner", "FTP / W/kg", "Voeding &amp; drinken"]);
    expect(html).toContain("overflow-x-auto");
  });

  it("supports English routes and navigation labels", () => {
    const html = renderToStaticMarkup(<MoreToolsNav activeTool="ftp-wkg" locale="en" />);
    expect(html).toContain('aria-label="More cycling tools"');
    expect(html).toContain('href="/en/calculators/fuel-hydration"');
    expect(html).toContain("Fuel &amp; hydration");
  });
});
