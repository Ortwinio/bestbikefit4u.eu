import { afterEach, describe, expect, it, vi } from "vitest";
import { requestCheckout } from "./checkout-request";
import { stripeNotImplemented } from "@/lib/billing/stripeStub";
import type { CheckoutProduct } from "./checkout-state";

afterEach(() => vi.unstubAllGlobals());

describe("checkout request contract", () => {
  it.each([
    ["single", false, "single"],
    ["annual", false, "annual"],
    ["annual", true, "annual_upgrade"],
    ["personal", true, "annual_personal"],
    ["personal_fit_standalone", false, "personal_fit_standalone"],
  ] satisfies [CheckoutProduct, boolean, string][])("posts the canonical %s selection without prices or coupons", async (product, eligible, productId) => {
    const fetchMock = vi.fn(async () => Response.json({ url: "https://checkout.stripe.com/mock-session", sessionId: "cs_mock" }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await requestCheckout({ product, bikeId: "bike" }, "nl", eligible, "test-token")).toEqual({ url: "https://checkout.stripe.com/mock-session" });
    expect(fetchMock).toHaveBeenCalledWith("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer test-token" },
      body: JSON.stringify({ productId, ...(product === "single" ? { bikeId: "bike" } : {}), locale: "nl", withdrawalAccepted: true }),
    });
  });

  it.each(["nl", "en"] as const)("preserves the server-side disabled message in %s", async locale => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json(stripeNotImplemented(locale), { status: 501 })));
    expect(await requestCheckout({ product: "annual", bikeId: "" }, locale, false, "test-token")).toEqual(stripeNotImplemented(locale));
  });

  it.each([
    { url: "javascript:alert(1)", sessionId: "cs_mock" },
    { url: "http://checkout.stripe.com/mock", sessionId: "cs_mock" },
    { url: "https://user:password@example.test/mock", sessionId: "cs_mock" },
    { url: "https://checkout.stripe.com/mock" },
    null,
  ])("rejects unsafe or incomplete session responses", async body => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json(body)));
    await expect(requestCheckout({ product: "annual", bikeId: "" }, "en", false, "test-token")).rejects.toThrow();
  });
});
