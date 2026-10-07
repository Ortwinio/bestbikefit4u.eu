/* @vitest-environment jsdom */

import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CheckoutFlow, type CheckoutFlowProps } from "./CheckoutFlow";
import { parseCheckoutProduct, readCheckoutSelection } from "./checkout-state";
import { checkoutCopy } from "@/i18n/marketing/checkout";
import styles from "./CheckoutFlow.module.css";

const defaults: CheckoutFlowProps = {
  locale: "nl", authenticated: true, accountId: "rider-1", accountEmail: "rider@example.test",
  bikes: [{ id: "bike-A", name: "Bike A" }, { id: "bike-B", name: "Bike B" }],
  signIn: vi.fn(async () => undefined),
};

beforeEach(() => { vi.stubEnv("NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED", "true"); localStorage.clear(); window.history.replaceState(null, "", "/nl/checkout"); vi.clearAllMocks(); });
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

function selectionFromUrl() {
  const params = new URL(window.location.href).searchParams;
  return { product: parseCheckoutProduct(params.get("product")), bikeId: params.get("bikeId") ?? "" };
}

async function next() {
  const button = screen.getByRole("button", { name: /^Doorgaan/ });
  await waitFor(() => expect(button.hasAttribute("disabled")).toBe(false));
  fireEvent.click(button);
}

async function confirm() {
  await next();
  await next();
}

describe("checkout review regressions", () => {
  it("keeps mobile pinned width more specific than the later full-width primary rule", () => {
    const css = readFileSync("src/components/checkout/CheckoutFlow.module.css", "utf8");
    const mobile = css.slice(css.indexOf("@media (max-width: 760px)"));
    const pinnedRule = mobile.match(/\.primary\.pinnedAction\s*\{([^}]+)\}/)?.[1];
    expect(pinnedRule).toBeDefined();
    expect(pinnedRule).toContain("position: fixed");
    expect(pinnedRule).toContain("left: 16px");
    expect(pinnedRule).toContain("width: calc(100% - 32px)");
    expect(mobile).toMatch(/\.primary\s*\{\s*width: 100%;\s*\}/);
  });
  it("immediately aligns the completed stub notice with its reserved mobile bottom clearance", async () => {
    const scrollIntoView = vi.fn();
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });
    try {
      render(<CheckoutFlow {...defaults} />);
      await confirm();
      fireEvent.click(screen.getByRole("checkbox"));
      fireEvent.click(screen.getByRole("button", { name: /^Betaal/ }));
      expect(screen.getByRole("status").classList.contains(styles.notice)).toBe(true);
      expect(scrollIntoView).toHaveBeenLastCalledWith({ block: "end", behavior: "instant" });
      expect(scrollIntoView.mock.contexts.at(-1)).toBe(screen.getByRole("status"));
    } finally {
      if (original) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", original);
      else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
    }
  });

  it.each(["nl", "en"] as const)("provides one mobile-pinned success action and removes duplicate appointment content in %s", locale => {
    const text = checkoutCopy[locale];
    const view = render(<CheckoutFlow {...defaults} locale={locale} preview="success" />);
    const action = screen.getByRole("link", { name: text.openPlan });
    expect(action.classList.contains(styles.pinnedAction)).toBe(true);
    expect(screen.getAllByRole("link", { name: text.openPlan })).toHaveLength(1);
    expect(action.closest(`.${styles.successColumns}`)).not.toBeNull();
    view.rerender(<CheckoutFlow {...defaults} locale={locale} preview="success" initialSelection={{ product: "personal", bikeId: "" }} agendaUrl="https://agenda.example.test/book" />);
    expect(screen.getAllByText(text.appointmentLead)).toHaveLength(1);
    expect(screen.getAllByRole("heading", { name: text.planAppointment })).toHaveLength(1);
    expect(screen.getByRole("link", { name: text.planAppointment }).classList.contains(styles.pinnedAction)).toBe(true);
    expect(screen.getByRole("link", { name: text.openPlan }).classList.contains(styles.pinnedAction)).toBe(false);
    view.unmount();
    render(<CheckoutFlow {...defaults} locale={locale} appointmentRequested appointmentAvailable />);
    expect(screen.getAllByRole("heading", { name: text.planAppointment })).toHaveLength(1);
    expect(screen.getByRole("heading", { name: text.planAppointment }).tagName).toBe("H1");
    expect(screen.getAllByText(text.appointmentLead)).toHaveLength(1);
    expect(screen.getByText(text.agendaPlaceholder)).toBeTruthy();
    expect(screen.queryByRole("link", { name: text.planAppointment })).toBeNull();
  });
  it.each(["nl", "en"] as const)("accepts the real seven-character auth alphabet and rejects truncated codes in %s", async locale => {
    const text = checkoutCopy[locale];
    const signIn = vi.fn(async () => undefined);
    const authSource = readFileSync("convex/auth.ts", "utf8");
    const alphabet = authSource.match(/const VERIFICATION_ALPHABET = "([^"]+)"/)![1];
    const length = Number(authSource.match(/const VERIFICATION_TOKEN_LENGTH = (\d+)/)![1]);
    render(<CheckoutFlow {...defaults} locale={locale} authenticated={false} signIn={signIn} />);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${text.continue}`) }));
    fireEvent.change(screen.getByLabelText(text.email), { target: { value: "rider@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: text.sendCode }));
    const input = await screen.findByLabelText(text.code) as HTMLInputElement;
    expect(input.pattern).toBe(`[${alphabet}]{${length}}`);
    expect(input.maxLength).toBe(length);
    expect(input.inputMode).not.toBe("numeric");
    fireEvent.change(input, { target: { value: "ABC234" } });
    expect(input.checkValidity()).toBe(false);
    fireEvent.submit(input.closest("form")!);
    expect(signIn).toHaveBeenCalledTimes(1);
    fireEvent.change(input, { target: { value: "ABC2345" } });
    expect(input.checkValidity()).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: text.verify }));
    await waitFor(() => expect(signIn).toHaveBeenCalledTimes(2));
    expect(signIn.mock.calls[1]).toEqual(["rider@example.test", "ABC2345", `/${locale}/checkout?product=annual`]);
  });

  it("keeps a selected owned bike when reloading a pricing entry URL", async () => {
    window.history.replaceState({ existing: true }, "", "/nl/checkout?product=single&src=report");
    const view = render(<CheckoutFlow {...defaults} initialSelection={selectionFromUrl()} />);
    await confirm();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "bike-A" } });
    expect(new URL(window.location.href).searchParams.get("bikeId")).toBe("bike-A");
    expect(new URL(window.location.href).searchParams.get("src")).toBe("report");
    expect(window.history.state).toEqual({ existing: true });
    view.unmount();
    render(<CheckoutFlow {...defaults} initialSelection={selectionFromUrl()} />);
    await confirm();
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("bike-A");
    expect(readCheckoutSelection()).toEqual({ product: "single", bikeId: "bike-A" });
  });

  it("keeps a changed product on reload, but an explicit new pricing link wins over an old draft", async () => {
    window.history.replaceState(null, "", "/nl/checkout?product=annual");
    let view = render(<CheckoutFlow {...defaults} initialSelection={selectionFromUrl()} />);
    fireEvent.click(screen.getAllByRole("radio")[2]);
    expect(new URL(window.location.href).searchParams.get("product")).toBe("annual_personal");
    view.unmount();
    view = render(<CheckoutFlow {...defaults} initialSelection={selectionFromUrl()} />);
    expect((screen.getAllByRole("radio")[2] as HTMLInputElement).checked).toBe(true);
    view.unmount();
    window.history.replaceState(null, "", "/nl/checkout?product=single&bikeId=bike-B");
    render(<CheckoutFlow {...defaults} initialSelection={selectionFromUrl()} />);
    await confirm();
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("bike-B");
    expect(screen.getByRole("button", { name: /^Betaal/ }).textContent).toContain("13,50");
  });

  it.each([
    ["eligibility/price", { upgradeEligible: false }],
    ["account ID", { accountId: "rider-2" }],
    ["account email", { accountEmail: "other@example.test" }],
    ["product prop", { initialSelection: { product: "personal", bikeId: "bike-A" } }],
    ["bike prop", { initialSelection: { product: "annual", bikeId: "bike-B" } }],
  ] satisfies [string, Partial<CheckoutFlowProps>][])("invalidates consent and stub status after a reactive %s change", async (_name, changed) => {
    const props: CheckoutFlowProps = { ...defaults, upgradeEligible: true, initialSelection: { product: "annual", bikeId: "bike-A" } };
    const view = render(<CheckoutFlow {...props} />);
    await confirm();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /^Betaal/ }));
    expect(screen.getByRole("status")).toBeTruthy();
    view.rerender(<CheckoutFlow {...props} {...changed} />);
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
    expect(screen.getByRole("button", { name: /^Betaal/ }).hasAttribute("disabled")).toBe(true);
    expect(screen.queryByRole("status")).toBeNull();
    fireEvent.submit(screen.getByRole("button", { name: /^Betaal/ }).closest("form")!);
    expect(screen.queryByRole("status")).toBeNull();
    view.rerender(<CheckoutFlow {...props} />);
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
  });

  it("does not restore consent after signing out and back in", async () => {
    const view = render(<CheckoutFlow {...defaults} />);
    await confirm();
    fireEvent.click(screen.getByRole("checkbox"));
    view.rerender(<CheckoutFlow {...defaults} authenticated={false} />);
    expect(screen.queryByRole("button", { name: /^Betaal/ })).toBeNull();
    view.rerender(<CheckoutFlow {...defaults} />);
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
  });

  it.each(["nl", "en"] as const)("includes two annual gift measurements for upgrades and standard subscriptions in %s", locale => {
    const view = render(<CheckoutFlow {...defaults} locale={locale} upgradeEligible />);
    const choices = screen.getByRole("group", { name: checkoutCopy[locale].choice });
    const annualList = within(choices).getAllByRole("list")[1];
    expect(within(annualList).getAllByRole("listitem")).toHaveLength(3);
    expect(annualList.textContent).toContain(checkoutCopy[locale].annualBenefits[2]);
    view.rerender(<CheckoutFlow {...defaults} locale={locale} upgradeEligible={false} />);
    expect(annualList.textContent).toContain(checkoutCopy[locale].annualBenefits[2]);
  });
});
