/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GearingCalculatorPage, { generateMetadata } from "./page";
import { gearingPageMessages } from "@/i18n/calculators/gearingPage";

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
    canonical: `https://bikefitboost.com/${locale}/calculators/gearing`,
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
  it.each(["nl", "en"] as const)("makes only supported calculator promises in %s", async language => {
    locale = language;
    const copy = gearingPageMessages[language];
    const { container } = render(await GearingCalculatorPage());
    for (const point of copy.trustPoints) {
      expect(screen.getByText(point.title)).toBeTruthy();
      expect(screen.getByText(point.description)).toBeTruthy();
    }
    expect(screen.getByText(copy.sectionDescription)).toBeTruthy();
    expect(container.textContent).not.toMatch(
      /upgrade-richting|upgrade direction|Exacte? drivetrain math|climb verdict|rijder en event|rider and event/i,
    );
    const metadata = await generateMetadata();
    expect(metadata.description).toBe(copy.description);
    expect(metadata.openGraph?.description).toBe(copy.description);
    expect(metadata.alternates?.canonical).toBe(`https://bikefitboost.com/${language}/calculators/gearing`);
    const schemas = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
      .flatMap(script => JSON.parse(script.textContent ?? "[]"));
    expect(schemas.find(schema => schema["@type"] === "WebPage").description).toBe(copy.description);
    expect(JSON.stringify(metadata)).not.toMatch(/hardest gear|zwaarste versnelling|speed at cadence|snelheid bij cadans/);
  });

  it.each(["en", "nl"] as const)("explains the public FTP-derived cadence model in %s", async language => {
    locale = language;
    const { container } = render(await GearingCalculatorPage());
    expect(container.textContent).toContain("85%");
    expect(container.textContent).toContain("3 W/kg");
    expect(container.textContent).toContain("9 kg");
    expect(container.textContent).toContain(language === "nl" ? "2,1 m" : "2.1 m");
    expect(container.textContent).toContain(language === "nl" ? "laat apart zien" : "separately shows");
    expect(container.textContent).not.toContain("does not calculate required power");
    expect(container.textContent).not.toContain("berekent niet je benodigde vermogen");
  });

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
    expect(document.querySelectorAll("details[data-usability=explanation]").length).toBeGreaterThan(0);
    expect(document.querySelector("details[open]")).toBeNull();
    expect(document.querySelector("[data-usability=short-answer]")).not.toBeNull();
    expect(screen.queryByText("Start free bike fit")).toBeNull();
    expect(screen.queryByText("Compare plans")).toBeNull();
    expect(screen.queryByText("Donate via our Alpe d'HuZes page")).toBeNull();
  });

  it("renders the public gearing flow in Dutch", async () => {
    locale = "nl";
    const ui = await GearingCalculatorPage();
    render(ui);

    expect(screen.getByText("Gearing form")).toBeTruthy();
    expect(document.querySelectorAll("details[data-usability=explanation]").length).toBeGreaterThan(0);
    expect(document.querySelector("details[open]")).toBeNull();
    expect(document.querySelector("[data-usability=short-answer]")).not.toBeNull();
    expect(screen.queryByText("Start gratis bike fit")).toBeNull();
    expect(screen.queryByText("Bekijk prijzen")).toBeNull();
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
