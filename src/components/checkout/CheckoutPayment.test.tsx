/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CheckoutFlow, type CheckoutFlowProps } from "./CheckoutFlow";
import { checkoutCopy } from "@/i18n/marketing/checkout";

const defaults: CheckoutFlowProps = {
  locale: "nl", authenticated: true, accountId: "rider", accountEmail: "rider@example.test",
  bikes: [{ id: "bike", name: "Bike" }], signIn: vi.fn(async () => undefined),
};

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/nl/checkout");
});
afterEach(cleanup);

async function confirm() {
  const next = screen.getByRole("button", { name: /^Doorgaan ·/ });
  await waitFor(() => expect(next.hasAttribute("disabled")).toBe(false));
  fireEvent.click(next);
  fireEvent.click(screen.getByRole("button", { name: "Doorgaan" }));
  fireEvent.click(screen.getByRole("checkbox"));
}

describe("checkout payment states", () => {
  it("retains the actual upgrade amount after eligibility changes following payment", () => {
    render(<CheckoutFlow {...defaults} upgradeEligible={false} paymentStatus="success"
      paymentReceipt={{ productId: "annual_upgrade", amountTotalCents: 950 }} />);
    expect(screen.getByLabelText("Je keuze").textContent).toContain("9,50");
    expect(screen.getByLabelText("Je keuze").textContent).toContain(checkoutCopy.nl.firstYear);
    expect(screen.getByLabelText("Je keuze").textContent).toContain("21,50");
  });

  it.each(["nl", "en"] as const)("never grants access or booking while an async %s payment is pending", locale => {
    const text = checkoutCopy[locale];
    const view = render(<CheckoutFlow {...defaults} locale={locale} paymentStatus="pending"
      initialSelection={{ product: "personal_fit_standalone", bikeId: "" }} />);
    expect(screen.getByRole("heading", { name: text.pendingTitle })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe(text.pendingLead);
    expect(screen.queryByRole("link", { name: text.openPlan })).toBeNull();
    expect(screen.queryByRole("region", { name: text.planAppointment })).toBeNull();
    view.rerender(<CheckoutFlow {...defaults} locale={locale} paymentStatus="success"
      initialSelection={{ product: "personal_fit_standalone", bikeId: "" }} />);
    expect(screen.getByRole("heading", { name: text.standaloneSuccess })).toBeTruthy();
    expect(screen.getByRole("region", { name: text.planAppointment })).toBeTruthy();
    expect(screen.queryByText(text.annualSuccess)).toBeNull();
    expect(screen.queryByText(text.renewal)).toBeNull();
  });

  it("requires authoritative standalone eligibility even for a direct selection", async () => {
    const startCheckout = vi.fn(async () => undefined);
    const view = render(<CheckoutFlow {...defaults} startCheckout={startCheckout}
      initialSelection={{ product: "personal_fit_standalone", bikeId: "" }} />);
    await confirm();
    const pay = screen.getByRole("button", { name: /^Betaal/ });
    expect(pay.textContent).toContain("209,50");
    expect(pay.hasAttribute("disabled")).toBe(true);
    fireEvent.submit(pay.closest("form")!);
    expect(startCheckout).not.toHaveBeenCalled();
    view.rerender(<CheckoutFlow {...defaults} startCheckout={startCheckout} standaloneEligible
      initialSelection={{ product: "personal_fit_standalone", bikeId: "" }} />);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(pay);
    await waitFor(() => expect(startCheckout).toHaveBeenCalledWith({ product: "personal_fit_standalone", bikeId: "" }));
    expect(screen.queryByRole("region", { name: "Plan je afspraak" })).toBeNull();
  });

  it("suppresses duplicate submissions and never interprets session creation as paid", async () => {
    let complete!: () => void;
    const startCheckout = vi.fn(() => new Promise<void>(resolve => { complete = resolve; }));
    render(<CheckoutFlow {...defaults} startCheckout={startCheckout} />);
    await confirm();
    const pay = screen.getByRole("button", { name: /^Betaal/ });
    fireEvent.click(pay);
    fireEvent.submit(pay.closest("form")!);
    expect(startCheckout).toHaveBeenCalledTimes(1);
    expect(pay.hasAttribute("disabled")).toBe(true);
    complete();
    await waitFor(() => expect(pay.hasAttribute("disabled")).toBe(false));
    expect(screen.queryByText(checkoutCopy.nl.annualSuccess)).toBeNull();
  });

  it("keeps the selection and permits retry after a checkout request fails", async () => {
    render(<CheckoutFlow {...defaults} startCheckout={vi.fn(async () => { throw new Error("offline"); })} />);
    await confirm();
    fireEvent.click(screen.getByRole("button", { name: /^Betaal/ }));
    expect((await screen.findByRole("alert")).textContent).toBe(checkoutCopy.nl.paymentError);
    expect(screen.getByRole("button", { name: /^Betaal/ }).hasAttribute("disabled")).toBe(false);
  });

  it("allows a failed async payment to return to confirmation with fresh consent", () => {
    render(<CheckoutFlow {...defaults} paymentStatus="failure" />);
    fireEvent.click(screen.getByRole("button", { name: "Probeer opnieuw" }));
    expect(screen.getByRole("heading", { name: "Controleer en betaal" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Betaal/ }).hasAttribute("disabled")).toBe(true);
  });
});
