import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fitPassCopy, fitPassPresentation } from "@/i18n/marketing/fitPass";
import FitPassPage, { generateMetadata } from "./page";

let locale: "en" | "nl" = "nl";

vi.mock("@/i18n/request", () => ({ getRequestLocale: () => Promise.resolve(locale) }));
vi.mock("@/components/features/fitpass/FitPassLandingCta", () => ({
  FitPassLandingCta: (props: {
    locale: string;
    label: string;
    loadingLabel: string;
    alreadyActiveLabel: string;
    loginHref: string;
    dashboardHref: string;
  }) => (
    <div
      data-cta-locale={props.locale}
      data-purchase-label={props.label}
      data-loading-label={props.loadingLabel}
      data-active-label={props.alreadyActiveLabel}
    >
      <a href={props.loginHref}>Login</a>
      <a href={props.dashboardHref}>Dashboard</a>
    </div>
  ),
}));

afterEach(() => vi.unstubAllEnvs());

describe("Fit Pass marketing page", () => {
  it.each(["nl", "en"] as const)("preserves source features, FAQ and localized CTA contracts in %s", async (language) => {
    locale = language;
    vi.stubEnv("STRIPE_BILLING_ENABLED", "false");
    const html = renderToStaticMarkup(await FitPassPage());
    const copy = fitPassCopy[locale];
    const presentation = fitPassPresentation[locale];

    expect(html.match(/<h1>/g)).toHaveLength(1);
    expect(html).toContain(presentation.title);
    expect(html).toContain(presentation.pausedTitle);
    expect(html).toContain(presentation.paused);
    expect(html).toContain(presentation.pausedStep);
    expect(html).toContain(presentation.reportStep);
    expect(html).not.toContain(copy.steps[1].body);
    for (const feature of copy.features) {
      expect(html).toContain(feature.title);
      expect(html).toContain(feature.body);
    }
    for (const faq of copy.faqs) {
      expect(html).toContain(faq.q);
      expect(html).toContain(faq.a);
    }
    expect(html.match(/<details/g)).toHaveLength(3);
    expect(html.match(/data-cta-locale=/g)).toHaveLength(2);
    expect(html).toContain(`data-cta-locale="${locale}"`);
    expect(html).toContain(`data-loading-label="${presentation.loading}"`);
    expect(html).toContain(`data-active-label="${copy.alreadyActive}"`);
    expect(html).toContain(`data-purchase-label="${copy.cta}"`);
    expect(html).toContain(`href="/${locale}/login?redirect=/fit-pass"`);
    expect(html).toContain(`href="/${locale}/dashboard"`);
    expect(html).toContain(`href="/${locale}/how-it-works"`);
    expect(html).toContain(`href="/${locale}/pricing"`);
    expect(html).toContain("03-cockpit-afstellen.webp");
    expect(html).not.toMatch(/Voorbeeldgegevens|Ontwerpstaat|review-strip|review-pill/);
  });

  it.each(["nl", "en"] as const)("retains metadata and locale alternates in %s", async (language) => {
    locale = language;
    const metadata = await generateMetadata();
    expect(metadata.title).toBe(fitPassCopy[locale].metadata.title);
    expect(metadata.description).toBe(fitPassCopy[locale].metadata.description);
    expect(metadata.alternates?.canonical).toBe(`https://bestbikefit4u.eu/${locale}/fit-pass`);
    expect(metadata.alternates?.languages).toMatchObject({
      nl: "https://bestbikefit4u.eu/nl/fit-pass",
      en: "https://bestbikefit4u.eu/en/fit-pass",
    });
    expect(metadata.openGraph).toMatchObject({
      title: fitPassCopy[locale].metadata.title,
      description: fitPassCopy[locale].metadata.description,
      url: `https://bestbikefit4u.eu/${locale}/fit-pass`,
    });
  });

  it.each(["nl", "en"] as const)("uses purchase content only when billing is enabled in %s", async (language) => {
    locale = language;
    vi.stubEnv("STRIPE_BILLING_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
    const html = renderToStaticMarkup(await FitPassPage());
    expect(html).toContain(fitPassPresentation[locale].processIntro);
    expect(html).toContain(fitPassCopy[locale].steps[1].label);
    expect(html).not.toContain(fitPassPresentation[locale].pausedTitle);
    expect(html).not.toContain(fitPassPresentation[locale].pausedStep);
  });

  it("keeps both presentation dictionaries aligned", () => {
    expect(Object.keys(fitPassPresentation.nl).sort()).toEqual(Object.keys(fitPassPresentation.en).sort());
  });
});
