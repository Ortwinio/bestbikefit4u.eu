import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
const route = vi.hoisted(() => ({ path: "/nl/calculators/saddle-height" }));
vi.mock("next/navigation", () => ({
  usePathname: () => route.path,
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/components/providers/ThemeProvider", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));
vi.mock("convex/react", () => ({
  useConvexAuth: () => ({ isAuthenticated: false, isLoading: false }),
  useMutation: () => vi.fn(),
}));
import { ConfiguratorHeaderSwitch } from "./ConfiguratorHeaderSwitch";
function markup() {
  return renderToStaticMarkup(
    <ConfiguratorHeaderSwitch
      locale="nl"
      loginLabel="Inloggen"
      languageLabels={{ language: "Taal", english: "Engels", dutch: "Nederlands" }}
    >
      <header>Marketing</header>
    </ConfiguratorHeaderSwitch>,
  );
}
describe("approved tool header", () => {
  it.each(["nl", "en"])("uses the theme-aware foreground token for selected %s", (locale) => {
    route.path = `/${locale}/calculators/bike-fit`;
    const html = markup();
    const label = locale === "nl" ? "Nederlands" : "Engels";
    const anchor = html.match(new RegExp(`<a [^>]*aria-label="${label}"[^>]*>`))?.[0];
    expect(anchor).toContain('aria-current="page"');
    expect(anchor).toContain("bg-primary");
    expect(anchor).toContain("text-primary-foreground");
    expect(anchor).not.toContain("text-[color:var(--primary-foreground)]");
  });

  it("gives the logo, language choices and login 44px hit areas", () => {
    route.path = "/nl/calculators/bike-fit";
    const html = markup();
    const logo = html.match(/<a [^>]*href="\/nl"[^>]*>/)?.[0];
    expect(logo).toContain("min-h-11");
    expect(logo).toContain("min-w-11");
    expect(logo).not.toContain("aria-label");
    expect(html).toContain('alt="BestBikeFit4U"');
    for (const label of ["Engels", "Nederlands"]) {
      const anchor = html.match(new RegExp(`<a [^>]*aria-label="${label}"[^>]*>`))?.[0];
      expect(anchor).toContain("min-h-11");
      expect(anchor).toContain("min-w-11");
    }
    expect(html.match(/<a [^>]*href="\/nl\/login"[^>]*>/)?.[0]).toContain("min-h-11");
  });

  it.each(["saddle-height", "frame-size", "crank-length", "saddle-width", "bike-fit"])(
    "uses real navigation and a soft border for %s",
    (tool) => {
      route.path = `/nl/calculators/${tool}`;
      const html = markup();
      expect(html).toContain("border-b border-border");
      expect(html.match(/<a [^>]*aria-current="page"[^>]*>/)?.[0]).toContain(
        `href="/nl/calculators/${tool}"`,
      );
      expect(html).toContain('href="/nl/login"');
      expect(html).not.toContain("Marketing");
    },
  );
  it.each([
    "/nl/tire-pressure-calculator",
    "/nl/bandenspanning-calculator",
  ])("activates the pressure tab on %s", (path) => {
    route.path = path;
    expect(markup().match(/<a [^>]*aria-current="page"[^>]*>/)?.[0]).toContain(
      'href="/nl/bandenspanning-calculator"',
    );
  });
  it.each([
    "/nl/bandenspanning/racefiets", "/nl/bandenspanning/gravelbike", "/nl/bandenspanning/mountainbike",
    "/en/tire-pressure/road-bike", "/en/tire-pressure/gravel-bike", "/en/tire-pressure/mountain-bike",
  ])("uses the marketing header for pressure reference page %s", path => {
    route.path = path;
    expect(markup()).toBe("<header>Marketing</header>");
  });
  it("leaves later batches and marketing pages unchanged", () => {
    for (const path of ["/nl/calculators/gearing", "/nl/pricing"]) {
      route.path = path;
      expect(markup()).toBe("<header>Marketing</header>");
    }
  });
});
