// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TransitionOffer, TransitionOfferView } from "./TransitionOffer";
import { getFunctionName } from "convex/server";
import { transitionOfferCopy } from "@/i18n/account/transitionOffer";

const state = vi.hoisted(() => ({ authenticated: true, status: "available", redeem: vi.fn() }));
vi.mock("convex/react", () => ({
  useConvexAuth: () => ({ isAuthenticated: state.authenticated }),
  useMutation: () => state.redeem,
  useQuery: (reference: Parameters<typeof getFunctionName>[0], args: unknown) => {
    if (args === "skip") return undefined;
    const name = getFunctionName(reference);
    if (name === "users/queries:getCurrentUser") return { _id: "user-1" };
    if (name === "bikes/queries:listSummariesByUser") return bikes;
    if (name === "pricing/queries:getTransitionOffer") return { status: state.status, redeemBy: available.redeemBy };
    throw new Error("Unexpected query");
  },
}));
afterEach(() => { cleanup(); vi.unstubAllEnvs(); state.authenticated = true; state.status = "available"; });
const bikes = [{ _id: "bike-1", name: "Road bike" }, { _id: "bike-2", name: "Gravel bike" }];
const available = { status: "available" as const, redeemBy: Date.UTC(2027, 0, 7) };
it("shows valid offers with billing OFF without invoking a payment or redemption", () => {
  vi.stubEnv("STRIPE_BILLING_ENABLED", "false");
  vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "false");
  render(<TransitionOffer locale="en" />);
  expect(screen.getByRole("heading", { name: transitionOfferCopy.en.title })).toBeTruthy();
  expect(state.redeem).not.toHaveBeenCalled();
});
it("hides signed-out and no-offer accounts", () => {
  state.authenticated = false;
  const view = render(<TransitionOffer locale="en" />);
  expect(view.container.textContent).toBe("");
  state.authenticated = true;
  state.status = "none";
  view.rerender(<TransitionOffer locale="en" />);
  expect(view.container.textContent).toBe("");
});
describe.each(["nl", "en"] as const)("transition offer %s", locale => {
  const copy = transitionOfferCopy[locale];
  it("requires an explicit bike and confirmation before redeeming once", async () => {
    const redeem = vi.fn().mockResolvedValue("entitlement");
    render(<TransitionOfferView locale={locale} offer={available} bikes={bikes} onRedeem={redeem} />);
    expect((screen.getByRole("button", { name: copy.use }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(copy.choose), { target: { value: "bike-2" } });
    fireEvent.click(screen.getByRole("button", { name: copy.use }));
    expect(redeem).not.toHaveBeenCalled();
    expect(screen.getByText(copy.explanation)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: copy.confirm }));
    await screen.findByRole("status");
    expect(redeem).toHaveBeenCalledExactlyOnceWith("bike-2");
  });
  it.each(["none", "expired", "redeemed"] as const)("hides %s", status => {
    const { container } = render(<TransitionOfferView locale={locale} offer={status === "redeemed"
      ? { status, bikeId: "bike-1", expiresAt: available.redeemBy } : { status }} bikes={bikes} onRedeem={vi.fn()} />);
    expect(container.textContent).toBe("");
  });
  it("shows upcoming date without activation and supports an empty garage", () => {
    const view = render(<TransitionOfferView locale={locale} offer={{ status: "upcoming", goLiveAt: available.redeemBy }}
      bikes={bikes} onRedeem={vi.fn()} />);
    expect(screen.getByText(new RegExp(copy.upcoming))).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
    view.rerender(<TransitionOfferView locale={locale} offer={available} bikes={[]} onRedeem={vi.fn()} />);
    expect(screen.getByRole("link", { name: copy.addBike }).getAttribute("href")).toBe(`/${locale}/bikes/new`);
  });
  it.each([
    ["TRANSITION_OFFER_UNAVAILABLE", "unavailable"],
    ["TRANSITION_OFFER_ALREADY_REDEEMED", "redeemed"],
    ["TRANSITION_OFFER_NOT_FOUND", "missing"], ["network", "error"],
  ] as const)("maps %s without leaking the raw error", async (error, key) => {
    render(<TransitionOfferView locale={locale} offer={available} bikes={bikes} bikeId="bike-1"
      onRedeem={vi.fn().mockRejectedValue(new Error(error))} />);
    fireEvent.click(screen.getByRole("button", { name: copy.useHere }));
    fireEvent.click(screen.getByRole("button", { name: copy.confirm }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe(copy[key]));
  });
});
