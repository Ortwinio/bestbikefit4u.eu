/* @vitest-environment jsdom */

import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage, { generateMetadata } from "@/app/(public)/page";

const { requestLocale } = vi.hoisted(() => ({ requestLocale: vi.fn(() => "nl") }));
vi.mock("server-only", () => ({}));
vi.mock("@/i18n/request", () => ({ getRequestLocale: requestLocale }));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ TrackMarketingEventOnView: () => null }));
vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => <a href={href} className={className}>{children}</a>,
}));
vi.mock("@/components/home/LatestBlogSection", () => ({ LatestBlogSection: () => null }));

afterEach(() => { cleanup(); requestLocale.mockReturnValue("nl"); });

describe("marketing home", () => {
  it("retains localized calculator, pain, report, and account destinations without unverified placeholders", async () => {
    render(await HomePage());
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Haal meer uit elke rit.");
    expect(screen.getByRole("link", { name: "Start gratis bike fit" }).getAttribute("href")).toBe("/nl/calculators/bike-fit");
    expect(screen.getByRole("link", { name: /Bandenspanning Voor/ }).getAttribute("href")).toBe("/nl/bandenspanning-calculator");
    expect(screen.getByRole("link", { name: "Maak gratis account" }).getAttribute("href")).toBe("/nl/login");
    expect(screen.getByRole("link", { name: "Wat zit in het rapport?" }).getAttribute("href")).toBe("#fit-report");
    expect(document.body.textContent).not.toMatch(/CLAIM|bron\?|Meest populair|Meetduur:|Voorbeeldgegevens/);
    expect(screen.getByText("Begin met je maten. Verfijn op de fiets.")).toBeTruthy();
    expect(screen.getByText("Schuif naar jouw maat")).toBeTruthy();
    expect(document.body.textContent).toContain("Betalingen zijn tijdelijk niet beschikbaar");
    expect(document.querySelector('a[href="/nl/pain/hand-numbness-cycling"]')).toBeTruthy();
  });

  it("serves English copy and retains canonical metadata", async () => {
    requestLocale.mockReturnValue("en");
    render(await HomePage());
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Get more from every ride.");
    expect(screen.getByRole("link", { name: "Start free bike fit" }).getAttribute("href")).toBe("/en/calculators/bike-fit");
    const metadata = await generateMetadata();
    expect(metadata.alternates?.canonical).toBe("https://www.bikefitboost.com/en");
    expect(metadata.openGraph).toMatchObject({ type: "website" });
    expect(metadata.description).toBeTruthy();
  });

  it.each(["nl", "en"])("removes unsupported trust claims without removing the %s layout", async (locale) => {
    requestLocale.mockReturnValue(locale);
    const { container } = render(await HomePage());
    expect(container.textContent).not.toMatch(/4[.,]8|380\+|2[.,]400\+|180\+|Thomas V\.|Laura M\.|Pieter J\./);
    expect(container.querySelectorAll("blockquote, cite")).toHaveLength(0);
    expect(container.querySelectorAll("article")).toHaveLength(7);
    expect(container.querySelectorAll("section")).toHaveLength(11);
    expect(container.querySelector("#fit-report")).toBeTruthy();
    expect(container.textContent).not.toMatch(/CLAIM|bron\?|verified rider|geverifieerd rijder/i);
  });
});
