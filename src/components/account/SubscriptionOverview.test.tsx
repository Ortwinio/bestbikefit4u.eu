/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SubscriptionOverview, type SubscriptionOverviewDetails } from "./SubscriptionOverview";
import { subscriptionCopy } from "@/i18n/account/subscription";
import { stripeNotImplemented } from "@/lib/billing/stripeStub";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); sessionStorage.clear(); });

describe("SubscriptionOverview", () => {
  it.each(["nl", "en"] as const)("links to the guarded appointment flow only with authoritative availability in %s", (locale) => {
    const request = vi.fn();
    vi.stubGlobal("fetch", request);
    const view = render(<SubscriptionOverview locale={locale} subscription={{ plan: "annual", appointmentAvailable: true }} />);
    const link = screen.getByRole("link", { name: subscriptionCopy[locale].planAppointment });
    expect(link.getAttribute("href")).toBe(`/${locale}/checkout?appointment=1`);
    link.addEventListener("click", event => event.preventDefault());
    fireEvent.click(link, { ctrlKey: true });
    expect(request).not.toHaveBeenCalled();
    view.rerender(<SubscriptionOverview locale={locale} subscription={{ plan: "personal", appointmentAvailable: false }} />);
    expect(screen.queryByRole("link", { name: subscriptionCopy[locale].planAppointment })).toBeNull();
    view.rerender(<SubscriptionOverview locale={locale} subscription={{ plan: "personal" }} />);
    expect(screen.queryByRole("link", { name: subscriptionCopy[locale].planAppointment })).toBeNull();
  });
  it.each(["nl", "en"] as const)("shows the discount only for a confirmed standard first year in %s", (locale) => {
    const copy = subscriptionCopy[locale];
    render(<SubscriptionOverview locale={locale} subscription={{ plan: "annual", periodPriceCents: 2450, renewed: false }} />);
    expect(screen.getByText(`${copy.renewalPrice} (${copy.renewalDiscount})`)).toBeTruthy();
  });

  const noDiscountCases: [string, SubscriptionOverviewDetails][] = [
    ["personal first year", { plan: "personal", periodPriceCents: 23450, renewed: false }],
    ["entry first year", { plan: "annual", periodPriceCents: 1350, renewed: false }],
    ["renewed annual", { plan: "annual", periodPriceCents: 1950, renewed: true }],
    ["unknown amount", { plan: "annual", renewed: false }],
    ["unknown renewal status", { plan: "annual", periodPriceCents: 2450 }],
    ["already renewed standard amount", { plan: "annual", periodPriceCents: 2450, renewed: true }],
  ];
  describe.each(["nl", "en"] as const)("truthful renewal amount in %s", (locale) => {
    it.each(noDiscountCases)("omits a false discount for %s", (_label, subscription) => {
      const copy = subscriptionCopy[locale];
      render(<SubscriptionOverview locale={locale} subscription={subscription} />);
      expect(screen.getByText(copy.renewal).nextElementSibling?.textContent).toBe(copy.renewalPrice);
      expect(screen.queryByText(copy.renewalDiscount, { exact: false })).toBeNull();
    });
  });
  it.each(["nl", "en"] as const)("renders free and loading states truthfully in %s", (locale) => {
    const copy = subscriptionCopy[locale];
    const view = render(<SubscriptionOverview locale={locale} subscription={undefined} />);
    expect(screen.getByText(copy.loading)).toBeTruthy();
    expect(screen.queryByText(copy.free)).toBeNull();
    view.rerender(<SubscriptionOverview locale={locale} subscription={null} />);
    expect(screen.getByText(copy.unavailable)).toBeTruthy();
    view.rerender(<SubscriptionOverview locale={locale} subscription={{ plan: "free" }} />);
    expect(screen.getByText(copy.freeDescription)).toBeTruthy();
    expect(screen.getByRole("link", { name: copy.prices }).getAttribute("href")).toBe(`/${locale}/pricing`);
    expect(screen.queryByRole("button", { name: copy.cancel })).toBeNull();
  });

  it("shows the single bike and real expiry without claiming renewal or gifts", () => {
    render(<SubscriptionOverview locale="nl" subscription={{ plan: "single", bikeName: "Canyon Endurace", expiresAt: Date.UTC(2027, 0, 3), introEligible: true }} />);
    expect(screen.getByText("Canyon Endurace")).toBeTruthy();
    expect(screen.getByText("3 januari 2027")).toBeTruthy();
    expect(screen.getByText(subscriptionCopy.nl.singleDescription)).toBeTruthy();
    expect(screen.getByRole("link").textContent).toContain("€13,50");
    expect(screen.queryByText(/cadeau|weg te geven/)).toBeNull();
    expect(screen.queryByText(subscriptionCopy.nl.renewal)).toBeNull();
  });

  it.each(["nl", "en"] as const)("cancellation stays a stub with no plan change in %s", async (locale) => {
    const request = vi.fn().mockResolvedValue({ status: 501, json: async () => stripeNotImplemented(locale) });
    vi.stubGlobal("fetch", request);
    const copy = subscriptionCopy[locale];
    render(<SubscriptionOverview locale={locale} subscription={{ plan: "annual", expiresAt: Date.UTC(2027, 2, 1), renewed: false, periodPriceCents: 2450 }} />);
    fireEvent.click(screen.getByRole("button", { name: copy.cancel }));
    expect(screen.getByRole("region", { name: copy.cancelTitle })).toBeTruthy();
    expect(screen.getByText(copy.cancelFirst)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: copy.confirm }));
    expect((await screen.findByText(stripeNotImplemented(locale).message))).toBeTruthy();
    expect(request).toHaveBeenCalledWith("/api/stripe/cancel", expect.objectContaining({ method: "POST", body: JSON.stringify({ locale }) }));
    expect(JSON.parse(sessionStorage.getItem("bbf-subscription-cancellation-choice")!)).toEqual({ action: "cancel", locale });
    expect(screen.getByRole("status").textContent).toContain(copy.notCancelled);
    expect(screen.getByText(copy.annual)).toBeTruthy();
    expect(screen.getByText(copy.renewalPrice, { exact: false })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: copy.keep }));
    expect(screen.queryByRole("region")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("shows pro-rata terms after renewal without inventing a refund", () => {
    render(<SubscriptionOverview locale="en" subscription={{ plan: "annual", renewed: true, periodPriceCents: 1950 }} />);
    fireEvent.click(screen.getByRole("button", { name: subscriptionCopy.en.cancel }));
    expect(screen.getByText(subscriptionCopy.en.cancelRenewed)).toBeTruthy();
    expect(screen.queryByText(/14[,.]63|9 months/)).toBeNull();
  });

  it("keeps access unchanged when the cancellation request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<SubscriptionOverview locale="en" subscription={{ plan: "annual", renewed: true }} />);
    fireEvent.click(screen.getByRole("button", { name: subscriptionCopy.en.cancel }));
    fireEvent.click(screen.getByRole("button", { name: subscriptionCopy.en.confirm }));
    expect(await screen.findByText(subscriptionCopy.en.cancelFailed)).toBeTruthy();
    expect(screen.getByText(subscriptionCopy.en.annual)).toBeTruthy();
    expect(screen.getByText(subscriptionCopy.en.notCancelled)).toBeTruthy();
  });

  it("does not call the stub if saving the choice fails", async () => {
    const request = vi.fn();
    vi.stubGlobal("fetch", request);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("storage unavailable"); });
    render(<SubscriptionOverview locale="nl" subscription={{ plan: "annual" }} />);
    fireEvent.click(screen.getByRole("button", { name: subscriptionCopy.nl.cancel }));
    fireEvent.click(screen.getByRole("button", { name: subscriptionCopy.nl.confirm }));
    expect(await screen.findByText(subscriptionCopy.nl.cancelFailed)).toBeTruthy();
    expect(request).not.toHaveBeenCalled();
  });

  it("shows personal fit price and ordinary annual renewal", () => {
    render(<SubscriptionOverview locale="nl" subscription={{ plan: "personal", periodPriceCents: 23450, renewed: false }} />);
    expect(screen.getByText(/234,50/)).toBeTruthy();
    expect(screen.getByText(subscriptionCopy.nl.personalRenewal)).toBeTruthy();
  });

  it("does not offer cancellation or renewal for an already cancelled annual plan", () => {
    render(<SubscriptionOverview locale="en" subscription={{ plan: "annual", cancelled: true, expiresAt: Date.UTC(2027, 2, 1) }} />);
    expect(screen.getByText("Annual subscription · Cancelled")).toBeTruthy();
    expect(screen.getByText(subscriptionCopy.en.cancelledDescription)).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByText(subscriptionCopy.en.renewal)).toBeNull();
  });
});
