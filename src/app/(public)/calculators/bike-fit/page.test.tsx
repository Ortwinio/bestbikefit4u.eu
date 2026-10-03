/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BikeFitCalculatorPage, { generateMetadata } from "./page";

let locale: "en" | "nl" = "en";
let campaignActive = true;

vi.mock("server-only", () => ({}));

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

vi.mock("@/config/commercial", async () => {
  const actual = await vi.importActual<typeof import("@/config/commercial")>("@/config/commercial");

  return {
    ...actual,
    isConsumerCampaignActive: () => campaignActive,
  };
});

vi.mock("@/components/seo/RelatedLinksSection", () => ({
  RelatedLinksSection: () => <section>Related links</section>,
}));

vi.mock("@/i18n/request", () => ({
  getRequestLocale: () => Promise.resolve(locale),
}));

vi.mock("@/i18n/metadata", () => ({
  buildLocaleAlternates: () => ({
    canonical: `https://bestbikefit4u.eu/${locale}/calculators/bike-fit`,
  }),
}));

vi.mock("./BikeFitCalculatorForm", () => ({
  BikeFitCalculatorForm: () => <div>Bike fit form</div>,
}));

beforeEach(() => {
  locale = "en";
  campaignActive = true;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("bike fit calculator page", () => {
  it.each(["en", "nl"] as const)(
    "publishes a free WebApplication without ratings in %s",
    async (language) => {
      locale = language;
      const { container } = render(await BikeFitCalculatorPage());
      const scripts = Array.from(container.querySelectorAll('script[type="application/ld+json"]'));
      const schemas = scripts.flatMap((script) => JSON.parse(script.textContent ?? "null"));
      const application = schemas.find((schema) => schema["@type"] === "WebApplication");

      expect(application).toMatchObject({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      });
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

  it.each(["en", "nl"] as const)(
    "preserves %s metadata, canonical and FAQ content",
    async (language) => {
      locale = language;
      const metadata = await generateMetadata();
      expect(metadata.alternates?.canonical).toBe(
        `https://bestbikefit4u.eu/${language}/calculators/bike-fit`,
      );
      expect(metadata.openGraph?.url).toBe(metadata.alternates?.canonical);
      render(await BikeFitCalculatorPage());
      expect(
        screen.getByText(
          language === "nl"
            ? "Welke waarde moet ik als eerste aanpassen?"
            : "Which value should I adjust first?",
        ),
      ).toBeTruthy();
    },
  );

  it.each(["en", "nl"] as const)(
    "leaves %s signup to the calculator handoff block without a duplicate campaign CTA",
    async (language) => {
      locale = language;
      campaignActive = false;
      const { container } = render(await BikeFitCalculatorPage());
      expect(screen.getByText("Bike fit form")).toBeTruthy();
      expect(container.querySelector('a[href*="/login"]')).toBeNull();
      expect(screen.queryByText("Create a free account")).toBeNull();
      expect(screen.queryByText("Maak een gratis account aan")).toBeNull();
    },
  );
});
