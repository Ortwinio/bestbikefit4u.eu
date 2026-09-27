import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const token = vi.fn();
  const query = vi.fn();
  const mutation = vi.fn();
  const setAuth = vi.fn();
  const clientConstructor = vi.fn();
  const checkoutSessionsCreate = vi.fn();
  const customersCreate = vi.fn();
  const customersRetrieve = vi.fn();
  const stripeConstructor = vi.fn();

  return {
    token,
    query,
    mutation,
    setAuth,
    clientConstructor,
    checkoutSessionsCreate,
    customersCreate,
    customersRetrieve,
    stripeConstructor,
  };
});

vi.mock("@convex-dev/auth/nextjs/server", () => ({
  convexAuthNextjsToken: mocks.token,
}));

vi.mock("convex/browser", () => ({
  ConvexHttpClient: class MockConvexHttpClient {
    constructor(url: string) {
      mocks.clientConstructor(url);
    }

    setAuth = mocks.setAuth;
    query = mocks.query;
    mutation = mocks.mutation;
  },
}));

vi.mock("stripe", () => ({
  default: class MockStripe {
    checkout = {
      sessions: {
        create: mocks.checkoutSessionsCreate,
      },
    };

    customers = {
      create: mocks.customersCreate,
      retrieve: mocks.customersRetrieve,
    };

    constructor(key: string, options: unknown) {
      mocks.stripeConstructor(key, options);
    }
  },
}));

import { POST } from "./route";

describe("Stripe checkout route", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    vi.stubEnv("NODE_ENV", "test");
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://example.convex.cloud";
    process.env.SITE_URL = "https://bestbikefit4u.eu";
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID = "price_pro_monthly";
    delete process.env.STRIPE_BILLING_ENABLED;
    delete process.env.NEXT_PUBLIC_STRIPE_BILLING_ENABLED;

    mocks.token.mockResolvedValue("token-123");
    mocks.query.mockResolvedValue({
      _id: "user_123",
      email: "rider@example.com",
      stripeCustomerId: "cus_existing",
    });
    mocks.checkoutSessionsCreate.mockResolvedValue({
      url: "https://checkout.stripe.com/c/session",
    });
    mocks.customersCreate.mockResolvedValue({ id: "cus_created" });
    mocks.customersRetrieve.mockResolvedValue({ id: "cus_existing", metadata: { userId: "user_123" } });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  function checkoutRequest(body: unknown) {
    return new Request("http://localhost/api/stripe/checkout", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  it.each(["STRIPE_BILLING_ENABLED", "NEXT_PUBLIC_STRIPE_BILLING_ENABLED"])(
    "blocks direct checkout without contacting Stripe when %s is false",
    async (flag) => {
      process.env[flag] = "false";
      const response = await POST(checkoutRequest({ productKey: "pro_monthly" }));
      expect(response.status).toBe(503);
      expect(await response.json()).toMatchObject({ code: "BILLING_DISABLED" });
      expect(mocks.token).not.toHaveBeenCalled();
      expect(mocks.stripeConstructor).not.toHaveBeenCalled();
      expect(mocks.customersCreate).not.toHaveBeenCalled();
      expect(mocks.checkoutSessionsCreate).not.toHaveBeenCalled();
    }
  );

  it("returns 401 when the user is not authenticated", async () => {
    mocks.token.mockResolvedValue(undefined);

    const response = await POST(checkoutRequest({ productKey: "fit_pass" }));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Not authenticated." });
    expect(mocks.query).not.toHaveBeenCalled();
    expect(mocks.checkoutSessionsCreate).not.toHaveBeenCalled();
  });

  it("rejects invalid or unsupported products", async () => {
    const response = await POST(checkoutRequest({ productKey: "price_123" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid checkout request." });
    expect(mocks.token).not.toHaveBeenCalled();
    expect(mocks.checkoutSessionsCreate).not.toHaveBeenCalled();
  });

  it("fails closed in production when Stripe config is missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.STRIPE_PRO_MONTHLY_PRICE_ID;

    const response = await POST(checkoutRequest({ productKey: "fit_pass" }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Stripe checkout is not configured.",
    });
    expect(mocks.checkoutSessionsCreate).not.toHaveBeenCalled();
  });

  it("allows a mock checkout URL only outside production when Stripe config is incomplete", async () => {
    delete process.env.STRIPE_SECRET_KEY;

    const response = await POST(checkoutRequest({ productKey: "fit_pass" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      url: "https://bestbikefit4u.eu/pricing?dev=stripe_mock",
    });
    expect(mocks.query).not.toHaveBeenCalled();
    expect(mocks.checkoutSessionsCreate).not.toHaveBeenCalled();
  });

  it("reuses an existing Stripe customer and creates a configured subscription checkout session", async () => {
    const response = await POST(
      checkoutRequest({
        productKey: "fit_pass",
        sessionId: "session_456",
        locale: "nl",
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      url: "https://checkout.stripe.com/c/session",
    });
    expect(mocks.setAuth).toHaveBeenCalledWith("token-123");
    expect(mocks.customersCreate).not.toHaveBeenCalled();
    expect(mocks.mutation).not.toHaveBeenCalled();
    expect(mocks.checkoutSessionsCreate).toHaveBeenCalledWith({
      mode: "subscription",
      line_items: [{ price: "price_pro_monthly", quantity: 1 }],
      success_url:
        "https://bestbikefit4u.eu/nl/fit/session_456/results?checkout=success&checkout_session_id={CHECKOUT_SESSION_ID}",
      cancel_url:
        "https://bestbikefit4u.eu/nl/fit/session_456/results?checkout=cancelled",
      customer: "cus_existing",
      subscription_data: { metadata: { userId: "user_123" } },
      client_reference_id: "user_123",
      allow_promotion_codes: true,
      metadata: {
        userId: "user_123",
        productKey: "fit_pass",
        planKey: "pro_monthly",
        fitSessionId: "session_456",
      },
    });
  });

  it("creates an idempotent customer and leaves persistence to the verified webhook", async () => {
    mocks.query.mockResolvedValueOnce({
      _id: "user_123",
      email: "rider@example.com",
      stripeCustomerId: undefined,
    });

    const response = await POST(checkoutRequest({ productKey: "pro_monthly" }));

    expect(response.status).toBe(200);
    expect(mocks.customersCreate).toHaveBeenCalledWith({
      metadata: { userId: "user_123" },
    }, { idempotencyKey: "customer:user_123" });
    expect(mocks.mutation).not.toHaveBeenCalled();
    expect(mocks.checkoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: "cus_created",
        line_items: [{ price: "price_pro_monthly", quantity: 1 }],
        client_reference_id: "user_123",
        metadata: {
          userId: "user_123",
          productKey: "pro_monthly",
          planKey: "pro_monthly",
        },
      })
    );
  });

  it.each([
    { id: "cus_existing", metadata: { userId: "another_user" } },
    { id: "cus_existing", metadata: {} },
    { id: "cus_existing", deleted: true },
  ])("rejects an unverified legacy customer binding: %j", async (customer) => {
    mocks.customersRetrieve.mockResolvedValue(customer);
    const response = await POST(checkoutRequest({ productKey: "fit_pass" }));
    expect(response.status).toBe(409);
    expect(mocks.checkoutSessionsCreate).not.toHaveBeenCalled();
  });

});
