/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SaddleWidthCalculatorPage, { generateMetadata } from "./page";
import { saddleWidthMessages } from "@/i18n/calculators/saddleWidth";

vi.mock("@/i18n/getDictionary", () => ({
  getDictionary: async (language: "nl" | "en") => ({
    saddleWidthCalculator: saddleWidthMessages[language],
  }),
}));

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

vi.mock("@/components/campaign/CampaignCtaGroup", () => ({
  CampaignCtaGroup: () => <div>Campaign CTA</div>,
}));

vi.mock("@/config/commercial", async () => {
  const actual = await vi.importActual<object>("@/config/commercial");
  return {
    ...actual,
    isConsumerCampaignActive: () => false,
    getConsumerCampaignCopy: () => ({ donateCta: "Donate" }),
  };
});

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
    canonical: `https://www.bikefitboost.com/${locale}/calculators/saddle-width`,
  }),
}));

vi.mock("./SaddleWidthCalculatorForm", () => ({
  SaddleWidthCalculatorForm: () => <div>Saddle width form</div>,
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

describe("saddle width calculator page", () => {
  it.each(["en", "nl"] as const)(
    "preserves page, breadcrumb and FAQ schemas without application or rating markup in %s",
    async (language) => {
      locale = language;
      const { container } = render(await SaddleWidthCalculatorPage());
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

  it.each(["en", "nl"] as const)("preserves metadata in %s", async (language) => {
    locale = language;
    const metadata = await generateMetadata();
    expect(metadata.alternates?.canonical).toBe(
      `https://www.bikefitboost.com/${language}/calculators/saddle-width`,
    );
    expect(metadata.openGraph).toBeTruthy();
  });
  it("renders the public saddle-width flow in English", async () => {
    const ui = await SaddleWidthCalculatorPage();
    render(ui);

    expect(screen.getByText("Saddle width form")).toBeTruthy();
    expect(screen.getByText("Start free bike fit").closest("a")?.getAttribute("href")).toBe(
      "/en/calculators/bike-fit",
    );
    expect(screen.getByText("Compare plans").closest("a")?.getAttribute("href")).toBe(
      "/en/pricing",
    );
    expect(screen.queryByText("Donate via our Alpe d'HuZes page")).toBeNull();
  });
});

it.each(["nl", "en"] as const)("renders the answer and one visible FAQ schema in %s", async language => {
  locale = language;
  const { container } = render(await SaddleWidthCalculatorPage());
  expect(container.querySelector('[data-calculator-answer="saddle-width"]')).not.toBeNull();
  const schemas = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
    .flatMap(script => JSON.parse(script.textContent ?? "[]"));
  const faqs = schemas.filter(schema => schema["@type"] === "FAQPage");
  expect(faqs).toHaveLength(1);
  for (const question of faqs[0].mainEntity) {
    expect(screen.getByText(question.name)).toBeTruthy();
    expect(screen.getByText(question.acceptedAnswer.text)).toBeTruthy();
  }
});
