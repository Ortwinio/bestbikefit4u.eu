/* @vitest-environment jsdom */

import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage, { generateMetadata } from "@/app/(public)/page";

const { requestLocale } = vi.hoisted(() => ({ requestLocale: vi.fn(() => "nl") }));
vi.mock("server-only", () => ({}));
vi.mock("@/i18n/request", () => ({ getRequestLocale: requestLocale }));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({
  TrackMarketingEventOnView: () => null, useMarketingEventLogger: () => vi.fn(),
}));
vi.mock("@/lib/analytics/useHomeSaddleWidgetAnalytics", () => ({
  useHomeSaddleWidgetAnalytics: () => ({ trackHomeSaddleWidgetUsed: vi.fn() }),
}));
vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => <a href={href} className={className}>{children}</a>,
}));
vi.mock("@/components/home/LatestBlogSection", () => ({ LatestBlogSection: () => null }));

afterEach(() => { cleanup(); requestLocale.mockReturnValue("nl"); });

describe("marketing home", () => {
  it("retains localized calculator, pain, report, and account destinations without unverified placeholders", async () => {
    render(await HomePage());
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("A good bikefit boosts your ride");
    expect(screen.getByRole("link", { name: "Start gratis bike fit" }).getAttribute("href")).toBe("/nl/calculators/bike-fit");
    expect(screen.getByRole("link", { name: "Bandenspanning" }).getAttribute("href")).toBe("/nl/bandenspanning-calculator");
    expect(screen.getByRole("link", { name: "Maak gratis account" }).getAttribute("href")).toBe("/nl/login");
    expect(screen.getAllByRole("link", { name: "Wat zit in het rapport?" }).map(link => link.getAttribute("href"))).toEqual(["#fit-report", "/nl/pricing"]);
    expect(document.body.textContent).not.toMatch(/CLAIM|bron\?|Meest populair|Meetduur:|Voorbeeldgegevens/);
    expect(screen.getByText("Begin met je maten. Verfijn op de fiets.")).toBeTruthy();
    expect(screen.getByText("Schuif naar jouw maat")).toBeTruthy();
    const widgetCta = screen.getByRole("link", { name: "Verfijn je zadelhoogte" });
    expect(widgetCta.getAttribute("href")).toBe("/nl/calculators/saddle-height#inseam");
    expect(widgetCta.compareDocumentPosition(screen.getByRole("link", { name: "Start gratis bike fit" })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(document.body.textContent).toContain("Losse meting €13,50 of jaarabonnement €21,50 per jaar");
    expect(screen.getByRole("link", { name: "Bekijk prijzen" }).getAttribute("href")).toBe("/nl/pricing");
    expect(document.querySelector('a[href="/nl/pain/hand-numbness-cycling"]')).toBeTruthy();
  });

  it("serves English copy and retains canonical metadata", async () => {
    requestLocale.mockReturnValue("en");
    render(await HomePage());
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("A good bikefit boosts your ride");
    expect(screen.getByRole("link", { name: "Start free bike fit" }).getAttribute("href")).toBe("/en/calculators/bike-fit");
    const metadata = await generateMetadata();
    expect(metadata.alternates?.canonical).toBe("https://bikefitboost.com/en");
    expect(metadata.openGraph).toMatchObject({ type: "website" });
    expect(metadata.description).toBeTruthy();
  });

  it.each(["nl", "en"])("removes unsupported trust claims without removing the %s layout", async (locale) => {
    requestLocale.mockReturnValue(locale);
    const { container } = render(await HomePage());
    expect(container.textContent).not.toMatch(/4[.,]8|380\+|2[.,]400\+|180\+|Thomas V\.|Laura M\.|Pieter J\./);
    expect(container.querySelectorAll("blockquote, cite")).toHaveLength(0);
    expect(container.querySelectorAll("article")).toHaveLength(7);
    expect(container.querySelectorAll("section")).toHaveLength(9);
    expect(container.querySelector("#fit-report")).toBeTruthy();
    expect(container.textContent).not.toMatch(/CLAIM|bron\?|verified rider|geverifieerd rijder/i);
  });

  it.each(["nl", "en"])("offers all eleven %s calculators directly in two routes", async (locale) => {
    requestLocale.mockReturnValue(locale);
    const { container } = render(await HomePage());
    const routes = container.querySelector('[data-usability="home-routes"]');
    const links = Array.from(routes!.querySelectorAll("nav a"));
    expect(links.map(link => link.getAttribute("href"))).toEqual([
      "saddle-height", "frame-size", "crank-length", "saddle-width", "bike-fit",
      locale === "nl" ? "/bandenspanning-calculator" : "/tire-pressure-calculator",
      "gearing", "climb-planner", "power-speed", "ftp-wkg", "fuel-hydration",
    ].map(path => `/${locale}${path.startsWith("/") ? path : `/calculators/${path}`}`));
    expect(routes!.querySelectorAll("nav")[0].querySelectorAll("a")).toHaveLength(5);
    expect(routes!.querySelectorAll("nav")[1].querySelectorAll("a")).toHaveLength(6);
    expect(screen.getByRole("link", { name: locale === "nl" ? "Start met zadelhoogte" : "Start with saddle height" }).getAttribute("href")).toBe(`/${locale}/calculators/saddle-height`);
    expect(screen.getByRole("link", { name: locale === "nl" ? "Start met bandenspanning" : "Start with tire pressure" }).getAttribute("href")).toBe(`/${locale}/${locale === "nl" ? "bandenspanning" : "tire-pressure"}-calculator`);
    const explanation = container.querySelector("#fit-report details");
    expect(explanation?.hasAttribute("open")).toBe(false);
    expect(explanation?.querySelectorAll("li").length).toBeGreaterThan(0);
    expect(explanation?.querySelectorAll("article")).toHaveLength(3);
    const trustHeading = locale === "nl" ? "Maak je volgende aanpassing bewust" : "Make your next adjustment deliberately";
    expect(explanation?.textContent).toContain(trustHeading);
    expect(screen.getByRole("heading", { name: trustHeading }).closest("details")).toBe(explanation);
    expect(container.querySelectorAll("#fit-report > div > ol > li")).toHaveLength(3);
  });
});
