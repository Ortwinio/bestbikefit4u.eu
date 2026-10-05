/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SaddleHeightCalculatorPage, { generateMetadata } from "./page";
import { getDictionary } from "@/i18n/getDictionary";
import { getFitAnswer } from "@/lib/seo/calculatorAnswers/fit";

const experienceProps = vi.hoisted(() => vi.fn());

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

vi.mock("server-only", () => ({}));

vi.mock("@/i18n/request", () => ({
  getRequestLocale: () => Promise.resolve(locale),
}));

vi.mock("./SaddleHeightExperience", () => ({
  SaddleHeightExperience: (props: unknown) => {
    experienceProps(props);
    return <div>Saddle height experience</div>;
  },
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

describe("saddle height calculator page", () => {
  it.each(["en", "nl"] as const)(
    "preserves page, breadcrumb and FAQ schemas without application or rating markup in %s",
    async (language) => {
      locale = language;
      const { container } = render(await SaddleHeightCalculatorPage());
      const scripts = Array.from(container.querySelectorAll('script[type="application/ld+json"]'));
      const schemas = scripts.flatMap((script) => JSON.parse(script.textContent ?? "null"));
      expect(schemas.map((schema) => schema["@type"])).toEqual(
        expect.arrayContaining(["WebPage", "BreadcrumbList", "FAQPage", "HowTo"]),
      );
      expect(JSON.stringify(schemas)).not.toMatch(/WebApplication|SoftwareApplication/);
      expect(JSON.stringify(schemas)).not.toContain('"aggregateRating"');
      expect(JSON.stringify(schemas)).not.toContain('"AggregateRating"');
      const faqSchemas = schemas.filter((schema) => schema["@type"] === "FAQPage");
      expect(faqSchemas).toHaveLength(1);
      scripts.forEach((script) => script.remove());
      for (const question of faqSchemas[0].mainEntity) {
        expect(container.textContent).toContain(question.name);
        expect(container.textContent).toContain(question.acceptedAnswer.text);
      }
      expect(container.textContent).toContain(language === "nl" ? "84,5 cm" : "84.5 cm");
      const howTo = schemas.find((schema) => schema["@type"] === "HowTo");
      expect(howTo.step[0].text).toContain(language === "nl" ? "lichaamslengte" : "height");
      expect(howTo.step[1].text).toContain(language === "nl" ? "optioneel" : "Optionally");
      expect(howTo.step[2].text).toContain("95%");
      expect(JSON.stringify(howTo)).not.toMatch(/fietscategorie|riding goal|flexibility|rompstabiliteit/);
    },
  );

  it("preserves localized metadata and canonical URLs", async () => {
    for (const language of ["en", "nl"] as const) {
      locale = language;
      const metadata = await generateMetadata();
      expect(metadata.alternates?.canonical).toBe(
        `https://bikefitboost.com/${language}/calculators/saddle-height`,
      );
      expect(metadata.description).toBeTruthy();
      expect(metadata.description).toContain(language === "nl" ? "optioneel" : "optional");
      expect(metadata.description).toContain("95%");
      expect(metadata.openGraph?.url).toBe(metadata.alternates?.canonical);
      expect(metadata.openGraph?.description).toBe(metadata.description);
      expect(metadata.alternates?.languages).toMatchObject({
        en: "https://bikefitboost.com/en/calculators/saddle-height",
        nl: "https://bikefitboost.com/nl/calculators/saddle-height",
        "x-default": "https://bikefitboost.com/en/calculators/saddle-height",
      });
    }
  });

  it("preserves Dutch FAQ content beneath the tool", async () => {
    locale = "nl";
    render(await SaddleHeightCalculatorPage());
    expect(screen.getByText("Hoe meet ik mijn binnenbeenlengte voor zadelhoogte?")).toBeTruthy();
    expect(screen.getByText("Kan ik beginnen zonder mijn binnenbeenlengte?")).toBeTruthy();
    expect(screen.getByText("Wat betekent het 95%-bereik?")).toBeTruthy();
  });

  it.each(["en", "nl"] as const)("keeps guidance, safety and uncertainty visible in %s", async (language) => {
    locale = language;
    const { container } = render(await SaddleHeightCalculatorPage());
    container.querySelectorAll("script").forEach((script) => script.remove());
    const content = container.textContent;
    expect(content).not.toMatch(
      /Safe baseline band|Veilige basiszone|conservative test band|conservatieve bandbreedte/,
    );
    expect(content).toContain(language === "nl" ? "Een te hoog zadel" : "A saddle that is too high");
    expect(content).toContain(language === "nl" ? "Een te laag zadel" : "A saddle that is too low");
    expect(content).toContain(language === "nl" ? "Stop bij pijn of tintelingen" : "Stop if you feel pain or tingling");
    expect(content).toContain("bikefitter");
    const guide = screen.getByRole("link", {
      name: language === "nl" ? "Bekijk de meetgids" : "Read the measurement guide",
    });
    expect(guide.getAttribute("href")).toBe(`/${language}/measurement-guide`);
    expect(guide.classList.contains("inline-flex")).toBe(true);
    expect(guide.classList.contains("min-h-11")).toBe(true);
    const answer = getFitAnswer("saddle-height", language);
    expect(answer.example.inputs.map((row) => row.value)).toEqual([
      "178 cm", language === "nl" ? "84,5 cm" : "84.5 cm",
    ]);
    expect(answer.example.results.map((row) => row.value)).toEqual(["746 mm", "±23 mm", "725–770 mm"]);
    for (const row of answer.example.results) expect(content).toContain(row.value);
    expect(experienceProps).toHaveBeenLastCalledWith({
      isNl: language === "nl",
      copy: (await getDictionary(language)).saddleHeightCalculator,
    });
  });

  it("keeps the value-first next-step CTAs visible in English", async () => {
    const ui = await SaddleHeightCalculatorPage();
    render(ui);

    expect(screen.getByText("Saddle height experience")).toBeTruthy();
    expect(screen.getByText("Start free bike fit").closest("a")?.getAttribute("href")).toBe(
      "/en/calculators/bike-fit",
    );
    expect(screen.getByText("Compare plans").closest("a")?.getAttribute("href")).toBe(
      "/en/pricing",
    );
    expect(screen.queryByText("Donate via our Alpe d'HuZes page")).toBeNull();
  });
});
