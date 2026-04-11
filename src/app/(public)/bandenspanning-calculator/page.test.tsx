/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BandenspanningCalculatorPage, { PressureCalculatorPageContent } from "./page";

let locale: "en" | "nl" = "en";

vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: () => null,
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

vi.mock("@/components/features/pressure/PressureCalculatorFaq", () => ({
  PressureCalculatorFaq: () => <section>Pressure FAQ</section>,
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

vi.mock("@/i18n/metadata", () => ({
  buildLocaleAlternates: () => ({
    canonical:
      locale === "nl"
        ? "https://bestbikefit4u.eu/nl/bandenspanning-calculator"
        : "https://bestbikefit4u.eu/en/tire-pressure-calculator",
  }),
}));

vi.mock("@/i18n/getDictionary", () => ({
  getDictionary: () =>
    Promise.resolve({
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
          tertiaryCta:
            locale === "nl" ? "Open bike-fit calculator" : "Open bike-fit calculator",
        },
      },
    }),
}));

vi.mock("@/lib/seo/jsonLd", () => ({
  buildWebApplicationSchema: () => ({}),
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
  it("keeps the calculator form and next-step CTAs visible in English content", async () => {
    const ui = await PressureCalculatorPageContent();
    render(ui);

    expect(screen.getByText("Tire Pressure Calculator")).toBeTruthy();
    expect(screen.getByText("Tire pressure form")).toBeTruthy();
    expect(screen.getByText("Pressure FAQ")).toBeTruthy();
    expect(screen.getByText("Create account or sign in").closest("a")?.getAttribute("href")).toBe(
      "/en/login"
    );
    expect(screen.getByText("Compare Free vs Pro").closest("a")?.getAttribute("href")).toBe(
      "/en/pricing"
    );
    expect(screen.getByText("Open bike-fit calculator").closest("a")?.getAttribute("href")).toBe(
      "/en/calculators/bike-fit"
    );
  });

  it("redirects the English alias route to the canonical tire-pressure path", async () => {
    locale = "en";

    await expect(BandenspanningCalculatorPage()).rejects.toThrow(
      "REDIRECT:/en/tire-pressure-calculator"
    );
    expect(permanentRedirect).toHaveBeenCalledWith("/en/tire-pressure-calculator");
  });
});
