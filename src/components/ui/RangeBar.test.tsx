import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RangeBar, type RangeBarProps } from "./RangeBar";

const props = { value: 780, low: 750, high: 810 };
const render = (overrides: Partial<RangeBarProps> = {}) =>
  renderToStaticMarkup(<RangeBar {...props} {...overrides} />);

function elementStyle(html: string, attribute: string) {
  return html.match(new RegExp(`<div ${attribute}=""[^>]*style="([^"]+)"`))?.[1];
}

describe("RangeBar", () => {
  it("uses advice ±60, keeping the marker central as the uncertainty changes", () => {
    const wide = render();
    const narrow = render({ low: 765, high: 795 });
    expect(elementStyle(wide, "data-range-zone")).toBe("left:25%;width:50%");
    expect(elementStyle(narrow, "data-range-zone")).toBe("left:37.5%;width:25%");
    expect(elementStyle(wide, "data-range-marker")).toBe(elementStyle(narrow, "data-range-marker"));
    expect(wide).toContain("padding-left:max(0px, calc(25% - 1.5ch))");
    expect(wide).toContain("padding-right:max(0px, calc(25% - 1.5ch))");
    expect(elementStyle(wide, "data-range-marker")).toContain("calc(50% - 2.5px)");
  });

  it("supports explicit scales and clamps the interval and marker to the track", () => {
    const html = render({ min: 0, max: 100, low: -20, high: 120, value: 150 });
    expect(elementStyle(html, "data-range-zone")).toBe("left:0%;width:100%");
    expect(elementStyle(html, "data-range-marker")).toContain("calc(100% - 2.5px)");
    expect(html).toContain("bereik -20 tot 120 mm");
    expect(elementStyle(render({ min: 0, max: 100, value: -5 }), "data-range-marker"))
      .toContain("calc(0% - 2.5px)");
  });

  it.each([
    { value: NaN }, { low: Infinity }, { high: -Infinity }, { min: NaN }, { max: Infinity },
    { min: -1e308, max: 1e308 },
    { min: 4, max: 4 }, { min: 5, max: 4 }, { low: 820, high: 810 },
  ])("suppresses invalid geometry rather than presenting a fabricated result: %j", (overrides) => {
    expect(render(overrides)).toBe("");
  });

  it("announces one complete localized description, with custom labels and units supported", () => {
    expect(render()).toContain('role="img" aria-label="Zadelhoogte 780 mm, bereik 750 tot 810 mm"');
    expect(render({ locale: "en" }))
      .toContain('aria-label="Saddle height 780 mm, range 750 to 810 mm"');
    expect(render({ label: "Reach", unit: "cm", value: 78.5, low: 75.5, high: 81.5 }))
      .toContain('aria-label="Reach 78,5 cm, bereik 75,5 tot 81,5 cm"');
    expect(render({ ariaLabel: "Custom accessible description" }))
      .toContain('aria-label="Custom accessible description"');
    expect(render().match(/aria-hidden="true"/g)).toHaveLength(2);
  });

  it("matches compact and large dimensions and supports a dashed warning interval", () => {
    expect(render()).toContain("h-7");
    expect(render()).toContain("h-11 w-[5px]");
    expect(render()).toContain("border-solid");
    const compact = render({ size: "compact", dashed: true });
    expect(compact).toContain("h-4");
    expect(compact).toContain("h-[26px] w-1");
    expect(compact).toContain("border-dashed");
    expect(compact).toContain("text-[13px]");
  });

  it("disables geometry transitions for reduced motion and allows labels to wrap on small screens", () => {
    const html = render({ low: 1e10, high: 2e10, min: 0, max: 2e10 });
    expect(html.match(/duration-\[400ms\]/g)).toHaveLength(3);
    expect(html.match(/motion-reduce:transition-none/g)).toHaveLength(3);
    expect(html).toContain("max-w-full");
    expect(html.match(/break-all/g)).toHaveLength(2);
    expect(html).not.toContain("whitespace-nowrap");
    expect(html).toContain("font-mono");
    expect(html).toContain("bg-[var(--bbf-lime)]");
    expect(html).toContain("[.dark_&amp;]:ring-1");
    expect(html).toContain("[.dark_&amp;]:ring-[var(--bbf-lime)]");
  });
});
