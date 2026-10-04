// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as commercial from "@/config/commercial";
import { contactPresentation } from "@/i18n/marketing/contact";
import ContactPage, { generateMetadata } from "./page";
import styles from "./contact.module.css";

const mocks = vi.hoisted(() => ({
  locale: "nl" as "nl" | "en",
  logEvent: vi.fn().mockResolvedValue(undefined),
  pushEvent: vi.fn(),
}));

vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => mocks.locale }));
vi.mock("convex/react", () => ({ useMutation: () => mocks.logEvent }));
vi.mock("@/lib/cookieConsent", () => ({ canTrackMarketing: () => true }));
vi.mock("@/lib/analytics/marketing", () => ({ pushDataLayerEvent: mocks.pushEvent }));
vi.mock("@/lib/analytics/conversions", () => ({ trackAdConversion: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("Contact marketing page", () => {
  it.each(["nl", "en"] as const)("puts the measurement target on the native focusable link in %s", async (locale) => {
    mocks.locale = locale;
    render(await ContactPage());
    const link = screen.getByRole("link", { name: contactPresentation[locale].measurementLink });

    expect(link.tagName).toBe("A");
    expect(link.classList.contains(styles.measurementLink)).toBe(true);
    expect(link.parentElement?.classList.contains(styles.measurementLink)).toBe(false);
    expect(link.getAttribute("href")).toBe(`/${locale}/measurement-guide`);
    expect(link.tabIndex).toBe(0);
    link.focus();
    expect(document.activeElement).toBe(link);
  });

  it.each(["nl", "en"] as const)("keeps real support content and mail-only channels in %s", async (locale) => {
    mocks.locale = locale;
    const { container } = render(await ContactPage());
    const copy = contactPresentation[locale];

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(copy.title + copy.titleEnd);
    expect(screen.getByText(copy.languages)).toBeTruthy();
    expect(screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent))
      .toEqual(copy.steps.map((step) => step.title));
    for (const step of copy.steps) expect(screen.getByText(step.body)).toBeTruthy();
    for (const response of commercial.getSupportResponseItems(locale)) {
      expect(Array.from(container.querySelectorAll("li")).some((item) => item.textContent === response)).toBe(true);
    }
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "mailto:support@bikefitboost.com",
      "mailto:support@bikefitboost.com",
      `/${locale}/faq`,
      `/${locale}/measurement-guide`,
    ]);
    expect(screen.getByRole("link", { name: "support@bikefitboost.com" })).toBeTruthy();
    expect(container.querySelector("form, input, textarea, select")).toBeNull();
    expect(container.querySelector("header, footer, main")).toBeNull();
    expect(container.textContent).not.toMatch(/Ontwerpstaat|Voorbeeldgegevens|\[PLACEHOLDER\]/);
    expect(container.textContent).toContain(copy.directContactBody);
    expect(screen.getByText(copy.responseNote)).toBeTruthy();
    expect(screen.getByText(copy.measurementText)).toBeTruthy();
    expect(screen.getByRole("link", { name: copy.measurementLink }).getAttribute("href"))
      .toBe(`/${locale}/measurement-guide`);
  });

  it.each(["nl", "en"] as const)("provides at least 150 words of useful contact guidance in %s", async (locale) => {
    mocks.locale = locale;
    const { container } = render(await ContactPage());
    const paragraphs = Array.from(container.querySelectorAll("p")).map((node) => node.textContent).join(" ");
    expect(paragraphs.trim().split(/\s+/).length).toBeGreaterThanOrEqual(150);
    expect(paragraphs).toContain(locale === "nl"
      ? "geen gegarandeerde reactietijden" : "not guaranteed response times");
    expect(paragraphs).toContain(locale === "nl" ? "foutmelding" : "error message");
    expect(paragraphs).toContain(locale === "nl" ? "eenheden" : "units");
    expect(paragraphs).not.toMatch(/24\s*(uur|hours)|48\s*(uur|hours)|within one hour/i);
  });

  it.each(["nl", "en"] as const)("preserves email and FAQ CTA analytics in %s", async (locale) => {
    mocks.locale = locale;
    render(await ContactPage());
    const actions = [
      { label: locale === "nl" ? "Open e-mailapp" : "Open email app",
        target: "mailto:support@bikefitboost.com", section: "contact_email_cta" },
      { label: locale === "nl" ? "Bekijk FAQ" : "View FAQ",
        target: `/${locale}/faq`, section: "contact_faq_link" },
    ];

    for (const action of actions) {
      document.addEventListener("click", (event) => event.preventDefault(), { once: true });
      fireEvent.click(screen.getByRole("link", { name: action.label }));
      expect(mocks.logEvent).toHaveBeenLastCalledWith({
        eventType: "cta_click",
        locale,
        pagePath: `/${locale}/contact`,
        section: action.section,
        ctaLabel: action.label,
        ctaTargetPath: action.target,
        sourceTag: `/${locale}/contact:${action.section}`,
      });
      expect(mocks.pushEvent).toHaveBeenLastCalledWith(expect.objectContaining({
        event: "bbf_cta_click", ctaTargetPath: action.target, locale,
      }));
    }
    expect(mocks.logEvent).toHaveBeenCalledTimes(2);
  });

  it.each(["nl", "en"] as const)("retains metadata, canonicals and language alternates in %s", async (locale) => {
    mocks.locale = locale;
    const metadata = await generateMetadata();
    const title = locale === "nl" ? "Contact - BikeFitBoost" : "Contact Us - BikeFitBoost";
    const description = locale === "nl"
      ? "Neem contact op met het BikeFitBoost-team. We helpen je graag met vragen over bike fitting en support."
      : "Get in touch with the BikeFitBoost team. " +
        "We are here to help with your bike fitting questions and support needs.";
    expect(metadata).toEqual({
      title,
      description,
      keywords: ["contact BikeFitBoost", "bike fit support", locale === "nl" ? "fiets hulp" : "cycling help"],
      openGraph: { title, description, type: "website", url: `https://bikefitboost.com/${locale}/contact` },
      alternates: {
        canonical: `https://bikefitboost.com/${locale}/contact`,
        languages: {
          nl: "https://bikefitboost.com/nl/contact",
          en: "https://bikefitboost.com/en/contact",
          "x-default": "https://bikefitboost.com/en/contact",
        },
      },
    });
  });

  it("reads response expectations from commercial configuration", async () => {
    vi.spyOn(commercial, "getSupportResponseItems").mockReturnValue(["Support response from configuration"]);
    render(await ContactPage());
    expect(screen.getByText("Support response from configuration")).toBeTruthy();
  });

  it("provides equivalent presentation fields and guidance in both languages", () => {
    expect(Object.keys(contactPresentation.nl).sort()).toEqual(Object.keys(contactPresentation.en).sort());
    expect(contactPresentation.nl.steps).toHaveLength(3);
    expect(contactPresentation.en.steps).toHaveLength(3);
  });
});
