/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CheckoutFlow, type CheckoutFlowProps } from "./CheckoutFlow";
import { CHECKOUT_STORAGE_KEY, checkoutPrice, checkoutProductId, getCheckoutPreview, parseCheckoutProduct, readCheckoutSelection, safeAgendaUrl } from "./checkout-state";
import { BRAND } from "@/config/brand";
import { checkoutCopy } from "@/i18n/marketing/checkout";
import { stripeNotImplemented } from "@/lib/billing/stripeStub";

vi.mock("@/lib/billing/stripeStub", async importOriginal => {
  const actual = await importOriginal<typeof import("@/lib/billing/stripeStub")>();
  return { ...actual, stripeNotImplemented: vi.fn(actual.stripeNotImplemented) };
});

const defaults: CheckoutFlowProps = {
  locale: "nl", authenticated: true, accountEmail: "rider@example.test", bikes: [{ id: "owned-bike", name: "My bike" }], signIn: vi.fn(async () => undefined),
};

beforeEach(() => { localStorage.clear(); window.history.replaceState(null, "", "/nl/checkout"); vi.clearAllMocks(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

async function confirm(locale: "nl" | "en" = "nl") {
  const text = checkoutCopy[locale];
  await waitFor(() => expect(screen.getByRole("button", { name: new RegExp(`^${text.continue} ·`) }).hasAttribute("disabled")).toBe(false));
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${text.continue} ·`) }));
  fireEvent.click(screen.getByRole("button", { name: text.continue }));
}

describe("checkout flow", () => {
  it.each(["nl", "en"] as const)("uses the BikeFitBoost logo in %s", locale => {
    const { container } = render(<CheckoutFlow {...defaults} locale={locale} />);
    const logo = screen.getByRole("img", { name: "BikeFitBoost" });
    expect(logo.getAttribute("src")).toBe(BRAND.assets.logoPrimary);
    expect(container.querySelector("header")?.textContent).not.toMatch(/BestBikeFit4U/i);
    expect(screen.getByRole("link", { name: new RegExp(BRAND.supportEmail) }).getAttribute("href"))
      .toBe(`mailto:${BRAND.supportEmail}`);
  });
  it("only opens the real appointment panel for an authenticated authoritative entitlement", () => {
    const view = render(<CheckoutFlow {...defaults} appointmentRequested appointmentAvailable={false} />);
    expect(screen.queryByRole("region", { name: "Plan je afspraak" })).toBeNull();
    view.rerender(<CheckoutFlow {...defaults} appointmentRequested appointmentAvailable />);
    expect(screen.getByRole("region", { name: "Plan je afspraak" })).toBeTruthy();
    expect(screen.queryByRole("note")).toBeNull();
    expect(stripeNotImplemented).not.toHaveBeenCalled();
    view.rerender(<CheckoutFlow {...defaults} authenticated={false} appointmentRequested appointmentAvailable />);
    expect(screen.queryByRole("region", { name: "Plan je afspraak" })).toBeNull();
  });
  it.each(["nl", "en"] as const)("requires withdrawal consent and preserves choice before the %s stub", async locale => {
    render(<CheckoutFlow {...defaults} locale={locale} />);
    await confirm(locale);
    const button = screen.getByRole("button", { name: /^Betaal |^Pay / });
    expect(button.hasAttribute("disabled")).toBe(true);
    fireEvent.submit(button.closest("form")!);
    expect(stripeNotImplemented).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(button);
    expect(stripeNotImplemented).toHaveBeenCalledWith(locale);
    expect(readCheckoutSelection()).toEqual({ product: "annual", bikeId: "" });
    expect(screen.getByRole("status").textContent).toBe(stripeNotImplemented(locale).message);
    expect(screen.queryByText(checkoutCopy[locale].annualSuccess)).toBeNull();
  });

  it("uses real auth actions and retains canonical selection through email/code sign-in", async () => {
    const signIn = vi.fn(async () => undefined);
    const view = render(<CheckoutFlow {...defaults} authenticated={false} signIn={signIn} initialSelection={{ product: "personal", bikeId: "owned-bike" }} />);
    await waitFor(() => expect(screen.getByRole("button", { name: /^Doorgaan ·/ }).hasAttribute("disabled")).toBe(false));
    fireEvent.click(screen.getByRole("button", { name: /^Doorgaan ·/ }));
    fireEvent.change(screen.getByLabelText("E-mailadres"), { target: { value: "Rider@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Stuur code" }));
    await screen.findByLabelText(checkoutCopy.nl.code);
    expect(signIn).toHaveBeenCalledWith("Rider@example.test", undefined, "/nl/checkout?product=annual_personal&bikeId=owned-bike");
    expect(JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY)!)).toEqual({ product: "annual_personal", bikeId: "owned-bike" });
    const input = screen.getByLabelText(checkoutCopy.nl.code) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "abc2345" } });
    expect(input.value).toBe("ABC2345");
    expect(input.checkValidity()).toBe(true);
    expect(input.maxLength).toBe(7);
    fireEvent.click(screen.getByRole("button", { name: "Bevestig" }));
    await waitFor(() => expect(signIn).toHaveBeenLastCalledWith("Rider@example.test", "ABC2345", "/nl/checkout?product=annual_personal&bikeId=owned-bike"));
    view.rerender(<CheckoutFlow {...defaults} signIn={signIn} />);
    await screen.findByRole("heading", { name: "Controleer en betaal" });
    expect(screen.getByRole("button", { name: /^Betaal/ }).textContent).toContain("234,50");
  });

  it("cannot pay a single fit for an unowned or missing bike", async () => {
    render(<CheckoutFlow {...defaults} initialSelection={{ product: "single", bikeId: "somebody-elses-bike" }} />);
    await confirm();
    fireEvent.click(screen.getByRole("checkbox"));
    const button = screen.getByRole("button", { name: /^Betaal/ });
    expect(button.hasAttribute("disabled")).toBe(true);
    fireEvent.submit(button.closest("form")!);
    expect(stripeNotImplemented).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "owned-bike" } });
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(button);
    expect(readCheckoutSelection()?.bikeId).toBe("owned-bike");
    expect(stripeNotImplemented).toHaveBeenCalledOnce();
  });

  it("refuses to claim persistence when local storage is unavailable", async () => {
    render(<CheckoutFlow {...defaults} />);
    await confirm();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /^Betaal/ }));
    expect(screen.getByRole("alert").textContent).toBe(checkoutCopy.nl.storageError);
    expect(stripeNotImplemented).not.toHaveBeenCalled();
  });

  it("restores selection on remount without restoring consent or email", async () => {
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify({ product: "single", bikeId: "owned-bike", email: "private@example.test", consent: true }));
    render(<CheckoutFlow {...defaults} />);
    await confirm();
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("owned-bike");
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
    expect(localStorage.getItem(CHECKOUT_STORAGE_KEY)).not.toContain("email");
  });

  it("shows exactly three benefits per plan and only one primary continuation", () => {
    render(<CheckoutFlow {...defaults} />);
    const choices = screen.getByRole("group", { name: "Je keuze" });
    expect(within(choices).getAllByRole("radio")).toHaveLength(3);
    for (const list of within(choices).getAllByRole("list")) expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("only applies the entry price with authenticated eligibility", async () => {
    const view = render(<CheckoutFlow {...defaults} introEligible />);
    await confirm();
    expect(screen.getByRole("button", { name: /^Betaal/ }).textContent).toContain("13,50");
    expect(JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY)!).product).toBe("annual_entry");
    view.rerender(<CheckoutFlow {...defaults} authenticated={false} introEligible />);
    expect(screen.queryByRole("button", { name: /^Betaal/ })).toBeNull();
    expect(screen.getByLabelText("Je keuze").textContent).toContain("24,50");
  });

  it("labels preview success explicitly and leaves agenda placeholder until configured", () => {
    render(<CheckoutFlow {...defaults} preview="success" initialSelection={{ product: "personal", bikeId: "" }} />);
    expect(screen.getByRole("note").textContent).toBe(checkoutCopy.nl.preview);
    expect(screen.getByText(checkoutCopy.nl.agendaPlaceholder)).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Plan je afspraak" })).toBeNull();
    expect(stripeNotImplemented).not.toHaveBeenCalled();
  });

  it("uses the configured agenda link only for personal preview and failure retry keeps selection", () => {
    const view = render(<CheckoutFlow {...defaults} preview="success" initialSelection={{ product: "personal", bikeId: "" }} agendaUrl="https://agenda.example.test/book" />);
    expect(screen.getByRole("link", { name: "Plan je afspraak" }).getAttribute("href")).toBe("https://agenda.example.test/book");
    view.unmount();
    render(<CheckoutFlow {...defaults} preview="failure" initialSelection={{ product: "single", bikeId: "owned-bike" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Probeer opnieuw" }));
    expect(screen.getByRole("button", { name: /^Betaal/ }).textContent).toContain("13,50");
    expect(screen.getByRole("button", { name: /^Betaal/ }).hasAttribute("disabled")).toBe(true);
  });
});

describe("checkout trust boundaries", () => {
  it("uses canonical IDs/prices and never derives entry eligibility from an input ID", () => {
    expect(parseCheckoutProduct("annual_personal")).toBe("personal");
    expect(checkoutProductId(parseCheckoutProduct("annual_entry"), false)).toBe("annual");
    expect(checkoutPrice("annual", false)).toBe(24.5);
    expect(checkoutPrice("annual", true)).toBe(13.5);
    expect(checkoutPrice("personal", true)).toBe(234.5);
  });
  it("denies preview by default and on production deployments even with flags", () => {
    expect(getCheckoutPreview("success", {})).toBeNull();
    expect(getCheckoutPreview("success", { CHECKOUT_PREVIEW_ENABLED: "true", NODE_ENV: "production" })).toBeNull();
    expect(getCheckoutPreview("success", { CHECKOUT_PREVIEW_ENABLED: "true", VERCEL_ENV: "production" })).toBeNull();
    expect(getCheckoutPreview("success", { CHECKOUT_PREVIEW_ENABLED: "true", NODE_ENV: "production", VERCEL_ENV: "preview" })).toBe("success");
    expect(getCheckoutPreview("failure", { CHECKOUT_PREVIEW_ENABLED: "true", NODE_ENV: "test" })).toBe("failure");
  });
  it("rejects invalid/unsafe agenda schemes", () => {
    expect(safeAgendaUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeAgendaUrl("http://agenda.example.test")).toBeUndefined();
    expect(safeAgendaUrl("https://user:password@agenda.example.test")).toBeUndefined();
    expect(safeAgendaUrl("https://agenda.example.test/book")).toBe("https://agenda.example.test/book");
  });
});
