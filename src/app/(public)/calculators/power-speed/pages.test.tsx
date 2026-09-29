// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PowerPage, { generateMetadata as powerMetadata } from "./page";
import ClimbPage, { generateMetadata as climbMetadata } from "../climb-planner/page";
import FtpPage, { generateMetadata as ftpMetadata } from "../ftp-wkg/page";
import FuelPage, { generateMetadata as fuelMetadata } from "../fuel-hydration/page";
import { performanceMessages } from "@/i18n/calculators/performance";
let locale: "en" | "nl" = "nl";
vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => locale }));
vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: ({ schema }: { schema: unknown }) => (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  ),
}));
afterEach(cleanup);
const pages = [
  ["power-speed", PowerPage, powerMetadata],
  ["climb-planner", ClimbPage, climbMetadata],
  ["ftp-wkg", FtpPage, ftpMetadata],
  ["fuel-hydration", FuelPage, fuelMetadata],
] as const;
describe.each(["nl", "en"] as const)("%s performance pages preserve SEO", (language) => {
  it.each(pages)(
    "%s retains canonical, schema, FAQs and one translated H1",
    async (route, Page, metadata) => {
      locale = language;
      const result = await metadata();
      expect(result.alternates?.canonical).toBe(`https://bestbikefit4u.eu/${locale}/calculators/${route}`);
      const { container } = render(await Page());
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
        performanceMessages[locale].titles[route],
      );
      const json = Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map(
        (script) => JSON.parse(script.textContent ?? "{}"),
      );
      const graph = json.flat();
      expect(graph.map((item) => item["@type"])).toEqual(
        expect.arrayContaining(["WebApplication", "HowTo", "FAQPage"]),
      );
      const faq = graph.find((item) => item["@type"] === "FAQPage");
      expect(faq.mainEntity).toHaveLength(2);
      for (const question of faq.mainEntity) expect(screen.getByText(question.name)).toBeTruthy();
    },
  );
});
