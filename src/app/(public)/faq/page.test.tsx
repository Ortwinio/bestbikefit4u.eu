/* @vitest-environment jsdom */

import { createHash } from "node:crypto";
import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { faqPresentation } from "@/i18n/marketing/faq";
import FAQPage, { generateMetadata } from "./page";

let locale: "nl" | "en" = "nl";

vi.mock("@/i18n/request", () => ({
  getRequestLocale: () => Promise.resolve(locale),
}));

vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: ({ schema }: { schema: unknown }) => (
    <script type="application/ld+json">{JSON.stringify(schema)}</script>
  ),
}));

vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({
    href, children, section, pagePath, ctaLabel, locale: language, ...props
  }: {
    href: string;
    children: ReactNode;
    section: string;
    pagePath: string;
    ctaLabel: string;
    locale: string;
  }) => (
    <a
      {...props}
      href={href}
      data-section={section}
      data-path={pagePath}
      data-label={ctaLabel}
      data-locale={language}
    >
      {children}
    </a>
  ),
}));

const schemaHashes = {
  nl: "9f2229e32d15c0b458a0750f524912ef5cd230cc86251738c369c52fbf072710",
  en: "1be46b196f422982ed727079171113c7b7c5a18a54cd7cdca33247f0f8991d8c",
};

const metadataCopy = {
  nl: {
    title: "BestBikeFit4U FAQ | Online bikefitting, zadelhoogte, framemaat & klachten oplossen",
    description:
      "Antwoorden over BestBikeFit4U online bikefitting: metingen, zadelhoogte, zadelterugstand, " +
      "reach & drop, stack & reach, MTB/gravel/TT, klachten, abonnementen, exports en veiligheidsregels.",
    keywords: ["online bikefitting FAQ", "zadelhoogte", "framemaat", "reach en drop", "stack en reach"],
  },
  en: {
    title: "BestBikeFit4U FAQ | Online Bike Fitting, Saddle Height, Frame Size & Pain Fixes",
    description:
      "Answers about BestBikeFit4U online bike fitting: measurements, saddle height, setback, " +
      "reach & drop, stack & reach, MTB/gravel/TT setups, pain troubleshooting, plans, exports, and safety guardrails.",
    keywords: ["online bike fitting FAQ", "saddle height", "frame size", "reach and drop", "stack and reach"],
  },
};

afterEach(cleanup);

describe.each(["nl", "en"] as const)("FAQ in %s", (language) => {
  it("preserves the complete pre-redesign schema and displays every exact question and answer", async () => {
    locale = language;
    const { container } = render(await FAQPage());
    const serialized = container.querySelector('script[type="application/ld+json"]')!.textContent!;
    expect(createHash("sha256").update(serialized).digest("hex")).toBe(schemaHashes[language]);
    const schema = JSON.parse(serialized);
    const disclosures = Array.from(container.querySelectorAll("details"));
    expect(disclosures).toHaveLength(12);
    schema.mainEntity.forEach((question: { name: string; acceptedAnswer: { text: string } }, index: number) => {
      expect(disclosures[index].querySelector("summary")?.textContent).toBe(question.name);
      expect(disclosures[index].querySelector("p")?.textContent).toBe(question.acceptedAnswer.text);
    });
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      language === "nl" ? "Veelgestelde vragen" : "Frequently Asked Questions"
    );
    for (const point of faqPresentation[language].trustPoints) {
      expect(screen.getByRole("heading", { name: point.title })).toBeTruthy();
    }
  });

  it("uses independent native disclosures with associated answers", async () => {
    locale = language;
    const { container } = render(await FAQPage());
    const disclosures = Array.from(container.querySelectorAll("details"));
    for (const disclosure of disclosures) {
      const summary = disclosure.querySelector("summary")!;
      expect(disclosure.open).toBe(true);
      expect(document.getElementById(summary.getAttribute("aria-controls")!)).toBe(disclosure.querySelector("p"));
      fireEvent.click(summary);
      expect(disclosure.open).toBe(false);
      fireEvent.click(summary);
      expect(disclosure.open).toBe(true);
    }
    fireEvent.click(disclosures[0].querySelector("summary")!);
    expect(disclosures[0].open).toBe(false);
    expect(disclosures.slice(1).every((disclosure) => disclosure.open)).toBe(true);
  });

  it("preserves metadata, canonical, language alternates and Open Graph", async () => {
    locale = language;
    const metadata = await generateMetadata();
    expect(metadata).toEqual({
      ...metadataCopy[language],
      openGraph: {
        title: metadataCopy[language].title,
        description: metadataCopy[language].description,
        type: "website",
        url: `https://bestbikefit4u.eu/${language}/faq`,
      },
      alternates: {
        canonical: `https://bestbikefit4u.eu/${language}/faq`,
        languages: {
          nl: "https://bestbikefit4u.eu/nl/faq",
          en: "https://bestbikefit4u.eu/en/faq",
          "x-default": "https://bestbikefit4u.eu/en/faq",
        },
      },
    });
  });

  it("keeps all guide and CTA routes localized with the original tracking sections", async () => {
    locale = language;
    const { container } = render(await FAQPage());
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(8);
    for (const path of [
      "/calculators/bike-fit", "/calculators/saddle-height", "/guides/bike-fitting-for-knee-pain",
      "/guides/road-bike-fit-guide", "/pricing", "/contact", "/login",
    ]) {
      expect(links.some((link) => link.getAttribute("href") === `/${language}${path}`)).toBe(true);
    }
    for (const [section, path] of [
      ["faq_bottom_primary", "/calculators/bike-fit"],
      ["faq_bottom_secondary", "/pricing"],
      ["faq_final_cta", "/login"],
    ]) {
      const link = container.querySelector(`[data-section="${section}"]`)!;
      expect(link.getAttribute("href")).toBe(`/${language}${path}`);
      expect(link.getAttribute("data-path")).toBe(`/${language}/faq`);
      expect(link.getAttribute("data-label")).toBe(link.textContent);
      expect(link.getAttribute("data-locale")).toBe(language);
    }
  });
});
