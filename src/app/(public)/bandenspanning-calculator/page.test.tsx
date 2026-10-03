/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BandenspanningCalculatorPage, { generateMetadata } from "./page";
import TirePressureCalculatorPage from "../tire-pressure-calculator/page";
import { PressureCalculatorPageContent } from "./PressureCalculatorPageContent";
import { tirePressureMessages } from "@/i18n/calculators/tirePressure";

let locale: "en" | "nl" = "en";

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

vi.mock("@/components/features/pressure/PressureCalculatorHero", () => ({
  PressureCalculatorHero: ({ title }: { title: string }) => <section>{title}</section>,
}));

vi.mock("@/components/features/pressure/PressureCalculatorForm", () => ({
  PressureCalculatorForm: () => <div>Tire pressure form</div>,
}));



vi.mock("@/components/features/pressure/PressureCalculatorCta", () => ({
  PressureCalculatorCta: ({
    labels,
  }: {
    labels: { title: string; primaryCta: string; secondaryCta: string; tertiaryCta: string };
  }) => (
    <div>
      <a href="/en/login">{labels.primaryCta}</a>
      <a href="/en/pricing">{labels.secondaryCta}</a>
      <a href="/en/calculators/bike-fit">{labels.tertiaryCta}</a>
    </div>
  ),
}));

vi.mock("@/i18n/request", () => ({
  getRequestLocale: () => Promise.resolve(locale),
}));

const { permanentRedirect } = vi.hoisted(() => ({
  permanentRedirect: vi.fn((href: string) => {
    throw new Error(`REDIRECT:${href}`);
  }),
}));

vi.mock("next/navigation", () => ({
  permanentRedirect,
}));

vi.mock("@/i18n/getDictionary", () => ({
  getDictionary: () =>
    Promise.resolve({
      tirePressureCalculator: tirePressureMessages[locale],
      pressure: {
        publicPage: {
          title: locale === "nl" ? "Bandenspanning calculator" : "Tire Pressure Calculator",
          description: "desc",
          h1: locale === "nl" ? "Bandenspanning calculator" : "Tire Pressure Calculator",
          subtitle: "subtitle",
          chips: ["chip"],
        },
        form: {},
        result: {},
        cta: {
          title: locale === "nl" ? "Zet de volgende stap" : "Take the next step",
          primaryCta: locale === "nl" ? "Maak account aan of log in" : "Create account or sign in",
          secondaryCta: locale === "nl" ? "Vergelijk Free en Pro" : "Compare Free vs Pro",
          tertiaryCta: locale === "nl" ? "Open bike-fit calculator" : "Open bike-fit calculator",
        },
      },
    }),
}));

vi.mock("@/lib/seo/relatedLinks", () => ({
  getRelatedLinks: () => [],
}));

beforeEach(() => {
  locale = "en";
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("bandenspanning calculator page", () => {
  it.each(["en", "nl"] as const)(
    "publishes a free WebApplication without ratings in %s",
    async (language) => {
      locale = language;
      const { container } = render(await PressureCalculatorPageContent({ locale }));
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
    },
  );

  it("keeps the form and FAQ without a duplicate signup band", async () => {
    const ui = await PressureCalculatorPageContent({ locale });
    render(ui);

    expect(screen.getByText("Tire pressure form")).toBeTruthy();
    expect(screen.getByText("Frequently asked questions")).toBeTruthy();
    expect(screen.queryByText("Create account or sign in")).toBeNull();
  });

  it("redirects the English alias route to the canonical tire-pressure path", async () => {
    locale = "en";

    await expect(BandenspanningCalculatorPage()).rejects.toThrow(
      "REDIRECT:/en/tire-pressure-calculator",
    );
    expect(permanentRedirect).toHaveBeenCalledWith("/en/tire-pressure-calculator");
  });
});


it("redirects the Dutch tire-pressure alias and publishes canonical translated alternates", async () => {
  locale = "nl";
  await expect(TirePressureCalculatorPage()).rejects.toThrow("REDIRECT:/nl/bandenspanning-calculator");
  const metadata = await generateMetadata();
  expect(metadata.title).toBe("Bandenspanning calculator");
  expect(metadata.openGraph?.title).toBe("Bandenspanning calculator");
  expect(metadata.alternates?.canonical).toBe("https://bestbikefit4u.eu/nl/bandenspanning-calculator");
  expect(metadata.alternates?.languages).toMatchObject({
    en: "https://bestbikefit4u.eu/en/tire-pressure-calculator",
    nl: "https://bestbikefit4u.eu/nl/bandenspanning-calculator",
  });
});

it.each(["nl", "en"] as const)("renders pressure answers and matching visible FAQs in %s", async language => {
  locale = language;
  const { container } = render(await PressureCalculatorPageContent({ locale }));
  expect(container.querySelector('[data-calculator-answer="tire-pressure"]')).not.toBeNull();
  const schemas = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
    .flatMap(script => JSON.parse(script.textContent ?? "[]"));
  const faqs = schemas.filter(schema => schema["@type"] === "FAQPage");
  expect(faqs).toHaveLength(1);
  for (const question of faqs[0].mainEntity) {
    expect(screen.getByText(question.name)).toBeTruthy();
    expect(screen.getByText(question.acceptedAnswer.text)).toBeTruthy();
  }
});
