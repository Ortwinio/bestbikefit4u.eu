/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GearingCalculatorPage from "./page";

let locale: "en" | "nl" = "en";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({ href, children }: { href: string; children?: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: ({ schema }: { schema: object | object[] }) => (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  ),
}));

vi.mock("@/components/seo/RelatedLinksSection", () => ({
  RelatedLinksSection: () => <section>Related links</section>,
}));

vi.mock("@/i18n/request", () => ({
  getRequestLocale: () => Promise.resolve(locale),
}));

vi.mock("@/i18n/metadata", () => ({
  buildLocaleAlternates: () => ({
    canonical: `https://bestbikefit4u.eu/${locale}/calculators/gearing`,
  }),
}));

vi.mock("./GearingCalculatorForm", () => ({
  GearingCalculatorForm: () => <div>Gearing form</div>,
}));

beforeEach(() => {
  locale = "en";
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-09-27T12:00:00Z"));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("gearing calculator page", () => {
  it.each(["en", "nl"] as const)(
    "preserves page, breadcrumb and FAQ schemas without application or rating markup in %s",
    async (language) => {
      locale = language;
      const { container } = render(await GearingCalculatorPage());
      const scripts = Array.from(container.querySelectorAll('script[type="application/ld+json"]'));
      const schemas = scripts.flatMap((script) => JSON.parse(script.textContent ?? "null"));
      expect(schemas.map((schema) => schema["@type"])).toEqual(
        expect.arrayContaining(["WebPage", "BreadcrumbList", "FAQPage"]),
      );
      expect(JSON.stringify(schemas)).not.toMatch(/WebApplication|SoftwareApplication/);
      expect(JSON.stringify(schemas)).not.toContain('"aggregateRating"');
      expect(JSON.stringify(schemas)).not.toContain('"AggregateRating"');
    },
  );

  it("renders the public gearing flow in English", async () => {
    const ui = await GearingCalculatorPage();
    render(ui);

    expect(screen.getByText("Gearing form")).toBeTruthy();
    expect(screen.getByText("Start free bike fit").closest("a")?.getAttribute("href")).toBe(
      "/en/calculators/bike-fit",
    );
    expect(screen.getByText("Compare plans").closest("a")?.getAttribute("href")).toBe("/en/pricing");
    expect(screen.queryByText("Donate via our Alpe d'HuZes page")).toBeNull();
  });

  it("renders the public gearing flow in Dutch", async () => {
    locale = "nl";
    const ui = await GearingCalculatorPage();
    render(ui);

    expect(screen.getByText("Gearing form")).toBeTruthy();
    expect(screen.getByText("Start gratis bike fit").closest("a")?.getAttribute("href")).toBe(
      "/nl/calculators/bike-fit",
    );
    expect(screen.getByText("Bekijk prijzen").closest("a")?.getAttribute("href")).toBe("/nl/pricing");
  });
});

it.each(["nl", "en"] as const)("renders the answer and one visible FAQ schema in %s", async language => {
  locale = language;
  const { container } = render(await GearingCalculatorPage());
  expect(container.querySelector('[data-calculator-answer="gearing"]')).not.toBeNull();
  const schemas = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
    .flatMap(script => JSON.parse(script.textContent ?? "[]"));
  const faqs = schemas.filter(schema => schema["@type"] === "FAQPage");
  expect(faqs).toHaveLength(1);
  for (const question of faqs[0].mainEntity) {
    expect(screen.getByText(question.name)).toBeTruthy();
    expect(screen.getByText(question.acceptedAnswer.text)).toBeTruthy();
  }
});
