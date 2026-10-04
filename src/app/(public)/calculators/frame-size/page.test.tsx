/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FrameSizeCalculatorPage, { generateMetadata } from "./page";
import { frameSizeMessages } from "@/i18n/calculators/frameSize";

vi.mock("@/i18n/getDictionary", () => ({
  getDictionary: async (language: "nl" | "en") => ({
    frameSizeCalculator: frameSizeMessages[language],
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

vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: ({ schema }: { schema: object | object[] }) => (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  ),
}));

vi.mock("@/components/campaign/CampaignCtaGroup", () => ({
  CampaignCtaGroup: ({
    startHref,
    donateHref,
    startLabel,
    donateLabel,
  }: {
    startHref: string;
    donateHref: string;
    startLabel?: string;
    donateLabel?: string;
  }) => (
    <div>
      <a href={startHref}>{startLabel ?? "Create account or sign in"}</a>
      <a href={donateHref}>{donateLabel ?? "Donate via our Alpe d'HuZes page"}</a>
    </div>
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
    canonical: `https://bikefitboost.com/${locale}/calculators/frame-size`,
  }),
}));

vi.mock("./FrameSizeCalculatorForm", () => ({
  FrameSizeCalculatorForm: () => <div>Frame size form</div>,
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

describe("frame size calculator page", () => {
  it.each(["en", "nl"] as const)(
    "preserves page, breadcrumb and FAQ schemas without application or rating markup in %s",
    async (language) => {
      locale = language;
      const { container } = render(await FrameSizeCalculatorPage());
      const scripts = Array.from(container.querySelectorAll('script[type="application/ld+json"]'));
      const schemas = scripts.flatMap((script) => JSON.parse(script.textContent ?? "null"));
      expect(schemas.map((schema) => schema["@type"])).toEqual(
        expect.arrayContaining(["WebPage", "BreadcrumbList", "FAQPage"]),
      );
      expect(JSON.stringify(schemas)).not.toMatch(/WebApplication|SoftwareApplication/);
      expect(JSON.stringify(schemas)).not.toContain('"aggregateRating"');
      expect(JSON.stringify(schemas)).not.toContain('"AggregateRating"');
      const faqSchemas = schemas.filter((schema) => schema["@type"] === "FAQPage");
      expect(faqSchemas).toHaveLength(1);
      for (const question of faqSchemas[0].mainEntity) {
        expect(container.textContent).toContain(question.name);
        expect(container.textContent).toContain(question.acceptedAnswer.text);
      }
      expect(container.textContent).toContain(language === "nl" ? "84,5 cm" : "84.5 cm");

    },
  );

  it.each(["en", "nl"] as const)("keeps metadata and canonical for %s", async (language) => {
    locale = language;
    const metadata = await generateMetadata();
    expect(metadata.alternates?.canonical).toBe(
      `https://bikefitboost.com/${language}/calculators/frame-size`,
    );
    expect(metadata.openGraph).toBeTruthy();
  });
  it("keeps the value-first next-step CTAs visible in English", async () => {
    const ui = await FrameSizeCalculatorPage();
    render(ui);

    expect(screen.getByText("Frame size form")).toBeTruthy();
    expect(screen.getByText("Start free bike fit").closest("a")?.getAttribute("href")).toBe(
      "/en/calculators/bike-fit",
    );
    expect(screen.getByText("Compare plans").closest("a")?.getAttribute("href")).toBe(
      "/en/pricing",
    );
    expect(screen.queryByText("Donate via our Alpe d'HuZes page")).toBeNull();
  });
});
