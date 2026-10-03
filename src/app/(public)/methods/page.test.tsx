/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import MethodsPage, { generateMetadata } from "./page";
import { authorshipMessages } from "@/i18n/marketing/authorship";
import { performanceMessages } from "@/i18n/calculators/performance";
import { methodsCopy } from "@/i18n/marketing/science";

let locale: "nl" | "en" = "nl";
vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => locale }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/guides/content", () => ({ getGuideLinkLabel: () => "Guide" }));
vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: ({ schema }: { schema: object }) => <script type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />,
}));
afterEach(cleanup);

describe("sources and methods page", () => {
  it.each(["nl", "en"] as const)("separates evidence, practice and model assumptions in %s", async language => {
    locale = language;
    const { container } = render(await MethodsPage());
    const copy = authorshipMessages[locale];
    for (const heading of [copy.scientificTitle, copy.practiceTitle, copy.ownTitle]) {
      expect(screen.getByRole("heading", { name: heading })).toBeTruthy();
    }
    expect(screen.getByText(performanceMessages[locale].carbSource)).toBeTruthy();
    expect(screen.getByText(performanceMessages[locale].fluidSource)).toBeTruthy();
    for (const method of methodsCopy[locale].methods) {
      expect(screen.getByRole("heading", { name: method.name })).toBeTruthy();
    }
    expect(screen.getByText(copy.pressureRule)).toBeTruthy();
    const metadata = await generateMetadata();
    expect(metadata.alternates?.canonical).toBe(`https://bestbikefit4u.eu/${locale}/methods`);
    expect(metadata.alternates?.languages).toMatchObject({
      nl: "https://bestbikefit4u.eu/nl/methods", en: "https://bestbikefit4u.eu/en/methods",
    });
    expect(metadata.description).toBe(copy.methodsDescription);
    expect(metadata.openGraph).toMatchObject({ title: copy.methodsTitle, description: copy.methodsDescription });
    const schema = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(schema).toMatchObject({ "@type": "WebPage", inLanguage: locale,
      url: `https://bestbikefit4u.eu/${locale}/methods` });
    expect(schema).not.toHaveProperty("reviewedBy");
    expect(schema).not.toHaveProperty("dateReviewed");
  });
});
