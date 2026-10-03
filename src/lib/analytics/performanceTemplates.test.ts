import { describe, expect, it } from "vitest";
import { groupPerformanceEvent, performanceTemplate } from "./performanceTemplates";

describe("performance template grouping", () => {
  it.each(["", "/nl", "/en"])("groups the six public templates for %s", locale => {
    for (const [path, template] of [
      ["/", "home"], ["/calculators/saddle-height", "calculator"],
      ["/tire-pressure-calculator", "calculator"], ["/bandenspanning-calculator", "calculator"],
      ["/guides/example", "guide"], ["/pain/example", "pain"], ["/pricing", "pricing"], ["/login", "login"],
    ]) expect(performanceTemplate(`${locale}${path}`)).toBe(template);
  });
  it("removes query values, fragments and dynamic segments from both event dimensions", () => {
    const event = { type: "vital" as const,
      url: "https://bestbikefit4u.eu/nl/guides/private-slug?email=lisa@example.com#secret", route: "/nl/guides/private-slug" };
    expect(groupPerformanceEvent(event)).toEqual({ type: "vital", route: "/templates/guide",
      url: "https://bestbikefit4u.eu/templates/guide" });
    expect(event.url).toContain("private-slug");
  });
  it.each(["/fit/secret-id/results", "/bikes/secret-id", "/profile", "/login/secret", "/guides/a/b"])(
    "does not transmit unsupported or account paths: %s", path => {
      expect(groupPerformanceEvent({ type: "vital", url: `https://bestbikefit4u.eu/nl${path}` })).toBeNull();
    },
  );
  it.each(["not a URL", "javascript:alert(1)"])("drops invalid URLs: %s", url => {
    expect(groupPerformanceEvent({ type: "vital", url })).toBeNull();
  });
});
