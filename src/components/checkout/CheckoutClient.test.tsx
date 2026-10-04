/* @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CheckoutFlowProps } from "./CheckoutFlow";
import { CheckoutClient } from "./CheckoutClient";
import { isStripeBillingEnabled } from "@/config/billing";
import { stripeNotImplemented } from "@/lib/billing/stripeStub";

const mocks = vi.hoisted(() => ({
  token: "test-token" as string | null,
  query: vi.fn(),
  signIn: vi.fn(async () => undefined),
  props: null as CheckoutFlowProps | null,
}));

vi.mock("@convex-dev/auth/react", () => ({ useAuthActions: () => ({ signIn: mocks.signIn }), useAuthToken: () => mocks.token }));
vi.mock("convex/react", () => ({ useConvexAuth: () => ({ isAuthenticated: true, isLoading: false }), useQuery: (...args: unknown[]) => mocks.query(...args) }));
vi.mock("./CheckoutFlow", () => ({ CheckoutFlow: (props: CheckoutFlowProps) => { mocks.props = props; return null; } }));

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "false");
  vi.stubEnv("STRIPE_BILLING_ENABLED", undefined);
  mocks.token = "test-token";
  mocks.query.mockReset();
  mocks.signIn.mockClear();
  mocks.query.mockReturnValueOnce({ _id: "rider", email: "rider@example.test" })
    .mockReturnValueOnce([{ _id: "bike", name: "Bike" }])
    .mockReturnValueOnce({ access: { eligibleForUpgrade: true, eligibleForPersonalFit: true, appointmentAvailable: false } });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("checkout client integration", () => {
  it("enables checkout presentation and status lookup with only the public flag", () => {
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
    expect(process.env.STRIPE_BILLING_ENABLED).toBeUndefined();
    expect(isStripeBillingEnabled()).toBe(false);
    render(<CheckoutClient locale="nl" sessionId="cs_mock" />);
    expect(mocks.props?.startCheckout).toBeTypeOf("function");
    expect(mocks.query.mock.calls[3][1]).toEqual({ sessionId: "cs_mock" });
    expect(mocks.props?.paymentStatus).toBe("pending");
  });

  it("uses authoritative eligibility and retains the local flag-off stub without fetch", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<CheckoutClient locale="nl" />);
    expect(mocks.props?.upgradeEligible).toBe(true);
    expect(mocks.props?.standaloneEligible).toBe(true);
    expect(mocks.props?.appointmentAvailable).toBe(false);
    expect(mocks.props?.startCheckout).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves a server-disabled response even when the browser flag is enabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
    vi.stubGlobal("fetch", vi.fn(async () => Response.json(stripeNotImplemented("en"), { status: 501 })));
    render(<CheckoutClient locale="en" />);
    expect(await mocks.props?.startCheckout?.({ product: "annual", bikeId: "" })).toEqual(stripeNotImplemented("en"));
  });

  it("does not submit a checkout without an auth token", async () => {
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
    mocks.token = null;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<CheckoutClient locale="nl" />);
    await expect(mocks.props?.startCheckout?.({ product: "annual", bikeId: "" })).rejects.toThrow("AUTH_REQUIRED");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    [undefined, "pending"], [null, "pending"], ["pending", "pending"],
    ["paid", "success"], ["failed", "failure"], ["expired", "failure"],
  ] as const)("maps authoritative %s status to %s without trusting the return URL", (status, expected) => {
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
    mocks.query.mockReturnValueOnce(status ? { status, productId: "annual_upgrade", bikeId: "bike", amountTotalCents: 950, currency: "EUR" } : status);
    render(<CheckoutClient locale="nl" sessionId="cs_mock" initialSelection={{ product: "personal", bikeId: "wrong-bike" }} />);
    expect(mocks.query.mock.calls[3][1]).toEqual({ sessionId: "cs_mock" });
    expect(mocks.props?.paymentStatus).toBe(expected);
    if (status) {
      expect(mocks.props?.initialSelection).toEqual({ product: "annual", bikeId: "bike" });
      expect(mocks.props?.paymentReceipt).toEqual({ productId: "annual_upgrade", amountTotalCents: 950 });
    }
  });

  it("skips payment lookup when billing is disabled, regardless of the session URL", () => {
    render(<CheckoutClient locale="nl" sessionId="cs_mock" />);
    expect(mocks.query.mock.calls[3][1]).toBe("skip");
    expect(mocks.props?.paymentStatus).toBeNull();
  });

  it.each(["free", "unknown", "toString", undefined])("does not accept paid status for an invalid product %s", productId => {
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
    mocks.query.mockReturnValueOnce({ status: "paid", productId, amountTotalCents: 950, currency: "EUR" });
    render(<CheckoutClient locale="nl" sessionId="cs_mock" />);
    expect(mocks.props?.paymentStatus).toBe("pending");
    expect(mocks.props?.paymentReceipt).toBeUndefined();
  });

  it("returns cancellation to a retryable failure without claiming access", () => {
    render(<CheckoutClient locale="nl" cancelled />);
    expect(mocks.props?.paymentStatus).toBe("failure");
  });

  it("retains the return session through sign-in", async () => {
    render(<CheckoutClient locale="nl" sessionId="cs_mock" />);
    await mocks.props?.signIn("rider@example.test", undefined, "/nl/checkout?product=annual");
    expect(mocks.signIn).toHaveBeenCalledWith("resend", {
      email: "rider@example.test", locale: "nl", redirectTo: "/nl/checkout?product=annual&session_id=cs_mock",
    });
  });
});
