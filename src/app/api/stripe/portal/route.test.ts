import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const token = vi.fn();
  const query = vi.fn();
  const setAuth = vi.fn();
  const clientConstructor = vi.fn();
  const portalCreate = vi.fn();
  const stripeConstructor = vi.fn();

  return {
    token,
    query,
    setAuth,
    clientConstructor,
    portalCreate,
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
  },
}));

vi.mock("stripe", () => ({
  default: class MockStripe {
    billingPortal = {
      sessions: {
        create: mocks.portalCreate,
      },
    };

    constructor(key: string, options: unknown) {
      mocks.stripeConstructor(key, options);
    }
  },
}));

import { POST } from "./route";

describe("stripe portal route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://example.convex.cloud";
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.SITE_URL = "https://bestbikefit4u.eu";
    mocks.token.mockResolvedValue("auth-token");
    mocks.query.mockResolvedValue({
      _id: "user_1",
      email: "rider@example.com",
      tier: "pro",
      stripeCustomerId: "cus_123",
    });
    mocks.portalCreate.mockResolvedValue({ url: "https://billing.stripe.com/session/test" });
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_CONVEX_URL;
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.SITE_URL;
  });

  function request(body: Record<string, unknown> = {}) {
    return new Request("https://app.test/api/stripe/portal", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  it("requires authentication", async () => {
    mocks.token.mockResolvedValue(null);

    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Not authenticated." });
  });

  it("creates a billing portal session for a paid Stripe-backed user", async () => {
    const response = await POST(request({ locale: "nl" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ url: "https://billing.stripe.com/session/test" });
    expect(mocks.setAuth).toHaveBeenCalledWith("auth-token");
    expect(mocks.portalCreate).toHaveBeenCalledWith({
      customer: "cus_123",
      return_url: "https://bestbikefit4u.eu/nl/settings?billing=portal_return",
    });
  });

  it("rejects free users without exposing a portal action", async () => {
    mocks.query.mockResolvedValue({
      _id: "user_1",
      email: "rider@example.com",
      tier: "free",
    });

    const response = await POST(request());

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "No paid subscription is available to manage.",
    });
    expect(mocks.portalCreate).not.toHaveBeenCalled();
  });

  it("returns a clear conflict when the paid user has no Stripe customer", async () => {
    mocks.query.mockResolvedValue({
      _id: "user_1",
      email: "rider@example.com",
      tier: "pro",
    });

    const response = await POST(request());

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: "This paid account is not linked to a Stripe customer yet.",
    });
    expect(mocks.portalCreate).not.toHaveBeenCalled();
  });

  it("fails closed when Stripe is not configured", async () => {
    delete process.env.STRIPE_SECRET_KEY;

    const response = await POST(request());

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "Stripe Customer Portal is not configured.",
    });
    expect(mocks.query).not.toHaveBeenCalled();
  });
});
