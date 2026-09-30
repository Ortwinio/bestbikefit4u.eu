import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Input } from "./input";
import { Select, SelectTrigger } from "./select";

function classes(html: string, slot: string) {
  const tag = html.match(new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`))?.[0];
  return tag?.match(/class="([^"]*)"/)?.[1].split(/\s+/) ?? [];
}

describe("shared form-control touch targets", () => {
  it("gives an Input a 44px default and minimum height", () => {
    const result = classes(renderToStaticMarkup(<Input aria-label="Name" />), "input");
    expect(result).toContain("h-11");
    expect(result).toContain("min-h-11");
    expect(result).not.toContain("h-9");
  });

  it.each([undefined, "sm", "lg"] as const)("keeps Select size %s at least 44px high", (size) => {
    const result = classes(renderToStaticMarkup(
      <Select><SelectTrigger size={size} aria-label="Goal">Goal</SelectTrigger></Select>,
    ), "select-trigger");
    expect(result).toContain("min-h-11");
    if (!size) expect(result).toContain("h-11");
  });

  it.each(["h-8", "h-12", "min-h-[52px]"])("preserves explicit height %s on both controls", (height) => {
    const input = classes(renderToStaticMarkup(<Input className={height} aria-label="Name" />), "input");
    const select = classes(renderToStaticMarkup(
      <Select><SelectTrigger className={height} aria-label="Goal">Goal</SelectTrigger></Select>,
    ), "select-trigger");
    for (const result of [input, select]) {
      expect(result).toContain(height);
      if (height.startsWith("h-")) expect(result).toContain("min-h-11");
      else expect(result).not.toContain("min-h-11");
    }
  });
});
