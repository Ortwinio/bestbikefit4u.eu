import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ConfiguratorLayout } from "./ConfiguratorLayout";

describe("ConfiguratorLayout", () => {
  it("places navigation above the question heading and inputs before results", () => {
    const html = renderToStaticMarkup(
      <ConfiguratorLayout eyebrow="Zadelhoogte" title="Hoe hoog moet je zadel?" description="Vind je startpunt." navigation={<nav aria-label="Tools">Navigatie</nav>} inputs={<label>Je binnenbeenlengte</label>} results={<p>Je startpunt</p>} />
    );
    expect(html.match(/<h1 /g)).toHaveLength(1);
    expect(html).toContain("Hoe hoog moet je zadel?</h1>");
    expect(html).toContain("Vind je startpunt.");
    expect(html.indexOf("Navigatie")).toBeLessThan(html.indexOf("Zadelhoogte"));
    expect(html.indexOf("Je binnenbeenlengte")).toBeLessThan(html.indexOf("Je startpunt"));
    expect(html).not.toContain('data-slot="configurator-sticky-result"');
  });

  it("renders the optional sticky mobile result without creating a second main landmark", () => {
    const html = renderToStaticMarkup(
      <ConfiguratorLayout eyebrow="Zadelhoogte" title="Hoe hoog moet je zadel?" inputs="Invoer" results="Resultaat" stickyResult={<a href="#resultaat">Bekijk je resultaat</a>} />
    );
    expect(html).toContain('data-slot="configurator-sticky-result"');
    expect(html).toContain('href="#resultaat"');
    expect(html).toContain("fixed inset-x-0 bottom-0");
    expect(html).toContain("xl:hidden");
    expect(html).not.toContain("<main");
  });
});
