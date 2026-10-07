/* @vitest-environment jsdom */

import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CheckoutFlow } from "./CheckoutFlow";
import { AppointmentBlock } from "./AppointmentBlock";
import PricingPage from "@/app/(public)/pricing/page";
import { checkoutCopy } from "@/i18n/marketing/checkout";
import { pricingCopy } from "@/i18n/marketing/pricing";
import type { Locale } from "@/i18n/config";

const request = vi.hoisted(() => ({ locale: "nl" as Locale }));
vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => request.locale }));
vi.mock("@/components/seo/JsonLd", () => ({ JsonLd: ({ schema }: { schema: unknown }) => <script type="application/ld+json">{JSON.stringify(schema)}</script> }));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ TrackMarketingEventOnView: () => null }));
vi.mock("@/components/analytics/TrackedCtaLink", () => ({ TrackedCtaLink: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a> }));

const placeholders = /\[LOCATIE\]|\[DUUR AFSPRAAK\]|\[VOORWAARDEN AFSPRAAK — juridisch toetsen\]|\[AGENDALINK\]/;
const products = ["personal", "personal_fit_standalone"] as const;

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/nl/checkout");
  vi.stubEnv("NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED", undefined);
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

describe.each(["nl", "en"] as const)("personal-fit sales presentation in %s", locale => {
  it("shows available soon without a pricing purchase link by default", async () => {
    request.locale = locale;
    const view = render(await PricingPage());
    const card = view.container.querySelector('[data-product="annual_personal"]')!;
    expect(card.textContent).toContain(checkoutCopy[locale].availableSoon);
    expect(card.querySelector("a, button")).toBeNull();
    expect(view.container.querySelector('a[href*="product=annual"]')).not.toBeNull();
  });

  it.each(products)("blocks direct checkout for %s with the switch off", product => {
    const startCheckout = vi.fn();
    const signIn = vi.fn();
    render(<CheckoutFlow locale={locale} authenticated standaloneEligible signIn={signIn} startCheckout={startCheckout} initialSelection={{ product, bikeId: "" }} />);
    expect(screen.getAllByText(checkoutCopy[locale].availableSoon).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: new RegExp(`^${checkoutCopy[locale].continue}`) })).toBeNull();
    expect(screen.queryByRole("button", { name: new RegExp(`^${checkoutCopy[locale].pay} `) })).toBeNull();
    expect((document.querySelector(`input[value="${product}"]`) as HTMLInputElement).disabled).toBe(true);
    expect(startCheckout).not.toHaveBeenCalled();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("renders enabled pricing including structured data without placeholders", async () => {
    vi.stubEnv("NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED", "true");
    request.locale = locale;
    const view = render(await PricingPage());
    expect(view.container.innerHTML).not.toMatch(placeholders);
    expect(JSON.stringify(pricingCopy[locale])).not.toMatch(placeholders);
    expect(screen.getByRole("link", { name: pricingCopy[locale].products.annual_personal.cta })).toBeTruthy();
  });

  it.each(products)("renders enabled %s selection, confirmation and success without placeholders", product => {
    vi.stubEnv("NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED", "true");
    const props = { locale, authenticated: true, standaloneEligible: true, signIn: vi.fn(), initialSelection: { product, bikeId: "" } };
    const view = render(<CheckoutFlow {...props} />);
    expect(view.container.innerHTML).not.toMatch(placeholders);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${checkoutCopy[locale].continue}`) }));
    fireEvent.click(screen.getByRole("button", { name: checkoutCopy[locale].continue }));
    expect(screen.getByRole("button", { name: new RegExp(`^${checkoutCopy[locale].pay} `) })).toBeTruthy();
    expect(view.container.innerHTML).not.toMatch(placeholders);
    view.rerender(<CheckoutFlow {...props} paymentStatus="success" agendaUrl="https://agenda.example.test/book" />);
    expect(view.container.innerHTML).not.toMatch(placeholders);
    expect(screen.getByRole("link", { name: checkoutCopy[locale].planAppointment }).getAttribute("href")).toBe("https://agenda.example.test/book");
  });

  it("blocks a previously confirmed checkout if sales are switched off", () => {
    vi.stubEnv("NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED", "true");
    const props = { locale, authenticated: true, signIn: vi.fn(), startCheckout: vi.fn(), initialSelection: { product: "personal" as const, bikeId: "" } };
    const view = render(<CheckoutFlow {...props} />);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${checkoutCopy[locale].continue}`) }));
    fireEvent.click(screen.getByRole("button", { name: checkoutCopy[locale].continue }));
    fireEvent.click(screen.getByRole("checkbox"));
    vi.stubEnv("NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED", "false");
    view.rerender(<CheckoutFlow {...props} />);
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.getByRole("status").textContent).toBe(checkoutCopy[locale].availableSoon);
    expect(props.startCheckout).not.toHaveBeenCalled();
  });

  it.each([undefined, "http://agenda.example.test", "javascript:alert(1)", "https://user:secret@agenda.example.test"])("uses contact wording for an unavailable or unsafe agenda", agendaUrl => {
    const view = render(<AppointmentBlock locale={locale} agendaUrl={agendaUrl} />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(view.container.innerHTML).not.toMatch(placeholders);
    expect(screen.getByText(checkoutCopy[locale].agendaPlaceholder)).toBeTruthy();
  });
});
