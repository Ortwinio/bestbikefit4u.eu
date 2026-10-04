// @vitest-environment jsdom

import type { ComponentProps } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { aboutCopy, aboutPresentation, aboutTrustPoints } from "@/i18n/marketing/about";
import { buildLocaleAlternates } from "@/i18n/metadata";
import AboutPage, { generateMetadata } from "./page";

let locale: "en" | "nl" = "nl";
const { trackClick } = vi.hoisted(() => ({ trackClick: vi.fn() }));

vi.mock("@/i18n/request", () => ({ getRequestLocale: () => Promise.resolve(locale) }));
vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({
    locale: language,
    pagePath,
    section,
    ctaLabel,
    ...props
  }: ComponentProps<"a"> & {
    locale: string;
    pagePath: string;
    section: string;
    ctaLabel: string;
  }) => <a {...props} onClick={() => trackClick({ locale: language, pagePath, section, ctaLabel })} />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("About marketing page", () => {
  it.each(["nl", "en"] as const)("preserves all real content and accessible sections in %s", async (language) => {
    locale = language;
    const { container } = render(await AboutPage());
    const { metadata, guideLinks, ...body } = aboutCopy[locale];
    const text = container.textContent;
    expect(metadata.title).toBeTruthy();
    for (const value of strings(body)) expect(text).toContain(value);
    for (const value of strings(aboutTrustPoints[locale])) expect(text).toContain(value);
    for (const chip of aboutPresentation[locale].chips) expect(text).toContain(chip);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(aboutCopy[locale].title);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(6);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(10);
    expect(screen.getAllByRole("region")).toHaveLength(7);
    expect(screen.getByRole("img").getAttribute("alt")).toBe(aboutPresentation[locale].imageAlt);
    expect(screen.getByRole("img").getAttribute("src")).toContain("06-meetset.webp");
    expect(container.querySelector("main")).toBeNull();
    expect(container.querySelector("header, footer")).toBeNull();
    for (const link of guideLinks) {
      expect(screen.getByRole("link", { name: link.label }).getAttribute("href")).toBe(
        `/${locale}${link.href}`
      );
    }
  });

  it.each(["nl", "en"] as const)("keeps the login CTA and tracking contract in %s", async (language) => {
    locale = language;
    render(await AboutPage());
    const cta = screen.getByRole("link", { name: aboutCopy[locale].ctaButton });
    expect(cta.tagName).toBe("A");
    expect(cta.getAttribute("href")).toBe(`/${locale}/login`);
    cta.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(cta);
    expect(trackClick).toHaveBeenCalledExactlyOnceWith({
      locale,
      pagePath: `/${locale}/about`,
      section: "about_final_cta",
      ctaLabel: aboutCopy[locale].ctaButton,
    });
  });

  it.each(["nl", "en"] as const)("preserves metadata, canonical and language alternates in %s", async (language) => {
    locale = language;
    const page = aboutCopy[locale];
    const alternates = buildLocaleAlternates("/about", locale);
    expect(await generateMetadata()).toEqual({
      title: page.metadata.title,
      description: page.metadata.description,
      keywords: page.metadata.keywords,
      openGraph: {
        title: page.metadata.title,
        description: page.metadata.description,
        type: "website",
        url: alternates.canonical,
      },
      alternates,
    });
    expect(alternates.canonical).toBe(`https://bikefitboost.com/${locale}/about`);
    expect(alternates.languages).toMatchObject({
      en: "https://bikefitboost.com/en/about",
      nl: "https://bikefitboost.com/nl/about",
    });
  });

  it("retains the original drop ranges and all rider inputs in both languages", () => {
    expect(aboutCopy.en.dropBullets).toEqual([
      "Comfort: 0-50mm",
      "Balanced: 50-80mm",
      "Performance: 80-120mm",
      "Aero/Racing: 120mm+",
    ]);
    expect(aboutCopy.nl.dropBullets).toEqual([
      "Comfort: 0-50 mm",
      "Gebalanceerd: 50-80 mm",
      "Prestatie: 80-120 mm",
      "Aero/Race: 120 mm+",
    ]);
    for (const language of ["nl", "en"] as const) {
      expect(aboutCopy[language].considerBullets).toHaveLength(10);
      expect(aboutCopy[language].componentCards).toHaveLength(4);
      expect(aboutCopy[language].guideLinks.map(({ href }) => href)).toEqual([
        "/calculators/bike-fit",
        "/science/bike-fit-methods",
        "/science/stack-and-reach",
      ]);
    }
    expect(Object.keys(aboutPresentation.nl)).toEqual(Object.keys(aboutPresentation.en));
  });
});
