/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SubscriptionOverview, type SubscriptionOverviewDetails } from "./SubscriptionOverview";
import { subscriptionCopy } from "@/i18n/account/subscription";
import { stripeNotImplemented } from "@/lib/billing/stripeStub";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); sessionStorage.clear(); });

describe("SubscriptionOverview", () => {
  it.each(["nl", "en"] as const)("confirms cancellation only after a successful server response in %s", async (locale) => {
    let confirmResponse!: (value: unknown) => void;
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(resolve => { confirmResponse = resolve; })));
    const copy = subscriptionCopy[locale];
    const view = render(<SubscriptionOverview locale={locale} subscription={{ plan: "annual", renewed: false }} />);
    fireEvent.click(screen.getByRole("button", { name: copy.cancel }));
    fireEvent.click(screen.getByRole("button", { name: copy.confirm }));
    expect(screen.queryByText(copy.cancelConfirmed)).toBeNull();
    confirmResponse({ ok: true, json: async () => ({ cancelled: true, endsAt: Date.UTC(2027, 0, 3), refundCents: 0 }) });
    expect(await screen.findByText(copy.cancelConfirmed)).toBeTruthy();
    expect(screen.queryByText(copy.notCancelled)).toBeNull();
    expect(screen.queryByText(copy.cancelFailed)).toBeNull();
    expect(screen.queryByText(copy.renewal)).toBeNull();
    expect(screen.queryByRole("button", { name: copy.cancel })).toBeNull();
    view.rerender(<SubscriptionOverview locale={locale} subscription={{ plan: "annual", cancelled: true, enforced: false }} />);
    expect(screen.getByText(`${copy.annual} · ${copy.cancelled}`)).toBeTruthy();
    view.rerender(<SubscriptionOverview locale={locale} subscription={{ plan: "free", enforced: false }} />);
    expect(screen.getByText(copy.free)).toBeTruthy();
    expect(screen.queryByRole("link", { name: copy.giveGift })).toBeNull();
  });

  it.each([
    { ok: false, body: { cancelled: true } },
    { ok: true, body: { cancelled: false } },
    { ok: true, body: {} },
  ])("does not confirm an unsuccessful or malformed cancellation %#", async ({ ok, body }) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok, json: async () => body }));
    const copy = subscriptionCopy.en;
    render(<SubscriptionOverview locale="en" subscription={{ plan: "annual" }} />);
    fireEvent.click(screen.getByRole("button", { name: copy.cancel }));
    fireEvent.click(screen.getByRole("button", { name: copy.confirm }));
    expect(await screen.findByText(copy.cancelFailed)).toBeTruthy();
    expect(screen.queryByText(copy.cancelConfirmed)).toBeNull();
    expect(screen.getByText(copy.renewal)).toBeTruthy();
  });

  it.each(["nl", "en"] as const)("links gifts only for actual annual access in %s", (locale) => {
    const view = render(<SubscriptionOverview locale={locale} subscription={{ plan: "free", enforced: false }} />);
    expect(screen.queryByRole("link", { name: subscriptionCopy[locale].giveGift })).toBeNull();
    view.rerender(<SubscriptionOverview locale={locale} subscription={{ plan: "single", enforced: false }} />);
    expect(screen.queryByRole("link", { name: subscriptionCopy[locale].giveGift })).toBeNull();
    for (const plan of ["annual", "personal"] as const) {
      view.rerender(<SubscriptionOverview locale={locale} subscription={{ plan, enforced: false }} />);
      expect(screen.getByRole("link", { name: subscriptionCopy[locale].giveGift }).getAttribute("href")).toBe(`/${locale}/gifts`);
      expect(screen.getByText(subscriptionCopy[locale].gifts)).toBeTruthy();
    }
  });

  it.each(["nl", "en"] as const)("requires server eligibility for appointment purchase in %s", (locale) => {
    const copy = subscriptionCopy[locale];
    const request = vi.fn();
    vi.stubGlobal("fetch", request);
    const view = render(<SubscriptionOverview locale={locale} subscription={{ plan: "annual", enforced: false }} />);
    expect(screen.queryByRole("link", { name: copy.buyAppointment })).toBeNull();
    view.rerender(<SubscriptionOverview locale={locale} subscription={{ plan: "single", canBuyAppointment: true }} />);
    const purchase = screen.getByRole("link", { name: copy.buyAppointment });
    expect(purchase.getAttribute("href")).toBe(`/${locale}/checkout?product=personal_fit_standalone`);
    expect(purchase.textContent).toContain(locale === "nl" ? "209,50" : "209.50");
    expect(screen.queryByRole("link", { name: copy.planAppointment })).toBeNull();
    view.rerender(<SubscriptionOverview locale={locale} subscription={{ plan: "single", canBuyAppointment: true, appointmentAvailable: true }} />);
    expect(screen.queryByRole("link", { name: copy.buyAppointment })).toBeNull();
    expect(screen.getByRole("link", { name: copy.planAppointment })).toBeTruthy();
    expect(request).not.toHaveBeenCalled();
  });

  it.each(["nl", "en"] as const)("offers an upgrade for an expired fit only while server eligibility remains in %s", (locale) => {
    const copy = subscriptionCopy[locale];
    const view = render(<SubscriptionOverview locale={locale} subscription={{ plan: "free", upgradeEligible: true }} />);
    expect(screen.getByRole("link", { name: copy.upgrade }).getAttribute("href")).toBe(`/${locale}/checkout?product=annual`);
    expect(screen.getByText(copy.upgradeEligibility)).toBeTruthy();
    view.rerender(<SubscriptionOverview locale={locale} subscription={{ plan: "free", enforced: false, upgradeEligible: false }} />);
    expect(screen.queryByRole("link", { name: copy.upgrade })).toBeNull();
    expect(screen.queryByText(copy.upgradeEligibility)).toBeNull();
  });

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
  const noDiscountCases: [string, SubscriptionOverviewDetails][] = [
    ["personal first year", { plan: "personal", periodPriceCents: 23450, renewed: false }],
    ["upgrade first year", { plan: "annual", periodPriceCents: 950, renewed: false }],
    ["renewed annual", { plan: "annual", periodPriceCents: 2150, renewed: true }],
    ["unknown amount", { plan: "annual", renewed: false }],
    ["unknown renewal status", { plan: "annual", periodPriceCents: 2150 }],
    ["standard first year", { plan: "annual", periodPriceCents: 2150, renewed: false }],
    ["already renewed standard amount", { plan: "annual", periodPriceCents: 2150, renewed: true }],
  ];
  describe.each(["nl", "en"] as const)("truthful renewal amount in %s", (locale) => {
    it.each(noDiscountCases)("omits a false discount for %s", (_label, subscription) => {
      const copy = subscriptionCopy[locale];
      render(<SubscriptionOverview locale={locale} subscription={subscription} />);
      expect(screen.getByText(copy.renewal).nextElementSibling?.textContent).toBe(copy.renewalPrice);
      expect(copy.renewalPrice).toBe(locale === "nl" ? "€21,50" : "€21.50");
      expect(screen.queryByText(/korting|discount/i)).toBeNull();
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
    render(<SubscriptionOverview locale="nl" subscription={{ plan: "single", bikeName: "Canyon Endurace", expiresAt: Date.UTC(2027, 0, 3), upgradeEligible: true }} />);
    expect(screen.getByText("Canyon Endurace")).toBeTruthy();
    expect(screen.getByText("3 januari 2027")).toBeTruthy();
    expect(screen.getByText(subscriptionCopy.nl.singleDescription)).toBeTruthy();
    expect(screen.getByRole("link").textContent).toContain("€9,50");
    expect(screen.getByRole("link").getAttribute("href")).toBe("/nl/checkout?product=annual");
    expect(screen.queryByText(subscriptionCopy.nl.gifts)).toBeNull();
    expect(screen.queryByText(subscriptionCopy.nl.renewal)).toBeNull();
  });

  it.each(["nl", "en"] as const)("cancellation stays a stub with no plan change in %s", async (locale) => {
    const request = vi.fn().mockResolvedValue({ status: 501, json: async () => stripeNotImplemented(locale) });
    vi.stubGlobal("fetch", request);
    const copy = subscriptionCopy[locale];
    render(<SubscriptionOverview locale={locale} subscription={{ plan: "annual", expiresAt: Date.UTC(2027, 2, 1), renewed: false, periodPriceCents: 2150 }} />);
    fireEvent.click(screen.getByRole("button", { name: copy.cancel }));
    expect(screen.getByRole("region", { name: copy.cancelTitle })).toBeTruthy();
    expect(screen.getByText(copy.cancelFirst)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: copy.confirm }));
    expect((await screen.findByText(stripeNotImplemented(locale).message))).toBeTruthy();
    expect(request).toHaveBeenCalledWith("/api/stripe/cancel", expect.objectContaining({ method: "POST", body: JSON.stringify({ locale }) }));
    expect(JSON.parse(sessionStorage.getItem("bbf-subscription-cancellation-choice")!)).toEqual({ action: "cancel", locale });
    expect(screen.getByRole("status").textContent).toContain(copy.notCancelled);
    expect(screen.getByText(copy.annual)).toBeTruthy();
    expect(screen.getByText(copy.renewal).nextElementSibling?.textContent).toContain(copy.renewalPrice);
    fireEvent.click(screen.getByRole("button", { name: copy.keep }));
    expect(screen.queryByRole("region")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("shows pro-rata terms after renewal without inventing a refund", () => {
    render(<SubscriptionOverview locale="en" subscription={{ plan: "annual", renewed: true, periodPriceCents: 2150 }} />);
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
