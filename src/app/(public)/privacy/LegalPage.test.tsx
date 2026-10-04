/* @vitest-environment jsdom */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { getSubscriptionTermsCopy } from "@/config/commercial";
import { legalMessages } from "@/i18n/marketing/legal";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { content } from "./content";
import { getContent } from "../terms/content";
import PrivacyPage, { generateMetadata as privacyMetadata } from "./page";
import TermsPage, { generateMetadata as termsMetadata } from "../terms/page";
import { legalBaseline } from "./legalBaseline.fixture";

let locale: "en" | "nl" = "en";
vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => locale }));
vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({ href, children, section }: { href: string; children: ReactNode; section: string }) => (
    <a href={href} data-tracking-section={section}>
      {children}
    </a>
  ),
}));
afterEach(cleanup);

describe.each(["en", "nl"] as const)("Legal pages in %s", (language) => {
  it("preserves all original legal copy, dates, metadata and order exactly", () => {
    expect(content[language]).toEqual(legalBaseline.privacy[language]);
    const terms = getContent(language);
    expect(terms.sections[5].body).toBe(getSubscriptionTermsCopy(language));
    const normalized = {
      ...terms,
      sections: terms.sections.map((section, index) =>
        index === 5 ? { ...section, body: "__DYNAMIC_SUBSCRIPTION_TERMS__" } : section,
      ),
    };
    expect(normalized).toEqual(legalBaseline.terms[language]);
  });

  it.each(["privacy", "terms"] as const)(
    "renders complete %s text and matching anchor navigation",
    async (kind) => {
      locale = language;
      const page = kind === "privacy" ? content[language] : getContent(language);
      render(await (kind === "privacy" ? PrivacyPage() : TermsPage()));
      expect(screen.getByRole("heading", { level: 1, name: page.title })).toBeTruthy();
      expect(screen.getByText(`${page.lastUpdatedLabel}: ${page.lastUpdatedDate}`)).toBeTruthy();
      const article = screen.getByRole("article", { name: page.title });
      const headings = within(article).getAllByRole("heading", { level: 2 });
      expect(headings.map((heading) => heading.textContent)).toEqual(
        page.sections.map((section) => section.title),
      );
      const contents = screen.getByRole("navigation", { name: legalMessages[language].contents });
      page.sections.forEach((section, index) => {
        const link = within(contents).getByRole("link", { name: section.title });
        const id = `${kind}-${index + 1}`;
        expect(link.getAttribute("href")).toBe(`#${id}`);
        expect(headings[index].parentElement?.id).toBe(id);
        const rendered = headings[index].parentElement!;
        const expected = [
          section.title,
          section.warningTitle,
          section.warningBody,
          section.body,
          ...(section.subsections?.flatMap((sub) => [sub.title, sub.body]) ?? []),
          ...(section.bullets ?? []),
        ]
          .filter(Boolean)
          .join("");
        expect(rendered.textContent).toBe(expected);
      });
      const typeLinks = screen.getByRole("navigation", { name: legalMessages[language].navigation });
      for (const type of ["privacy", "terms"] as const) {
        const link = within(typeLinks).getByRole("link", { name: legalMessages[language][type] });
        expect(link.getAttribute("href")).toBe(`/${language}/${type}`);
        expect(link.getAttribute("aria-current")).toBe(type === kind ? "page" : null);
      }
      const label = kind === "privacy" ? legalMessages[language].privacyCta : legalMessages[language].termsCta;
      const cta = screen.getByRole("link", { name: label });
      expect(cta.getAttribute("href")).toBe(`/${language}${kind === "privacy" ? "/calculators/bike-fit" : ""}`);
      expect(cta.getAttribute("data-tracking-section")).toBe(`${kind}_footer_cta`);
    },
  );

  it.each(["privacy", "terms"] as const)("preserves %s metadata and canonical links", async (kind) => {
    locale = language;
    const original = legalBaseline[kind][language];
    const metadata = await (kind === "privacy" ? privacyMetadata() : termsMetadata());
    expect(metadata).toEqual({
      ...original.metadata,
      openGraph: {
        title: original.metadata.title,
        description: original.metadata.description,
        type: "website",
        url: buildLocaleAlternates(`/${kind}`, language).canonical,
      },
      alternates: buildLocaleAlternates(`/${kind}`, language),
    });
  });
});
