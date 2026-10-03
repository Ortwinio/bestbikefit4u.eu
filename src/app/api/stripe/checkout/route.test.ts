import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stripeNotImplemented } from "@/lib/billing/stripeStub";

const mocks = vi.hoisted(() => ({ token: vi.fn(), stripe: vi.fn(), convex: vi.fn() }));
vi.mock("@convex-dev/auth/nextjs/server", () => ({ convexAuthNextjsToken: mocks.token }));
vi.mock("stripe", () => ({ default: mocks.stripe }));
vi.mock("convex/browser", () => ({ ConvexHttpClient: mocks.convex }));

import { POST as checkout } from "./route";
import { POST as portal } from "../portal/route";
import { POST as cancel } from "../cancel/route";
import { POST as refund } from "../refund/route";

const routes = { checkout, portal, cancel, refund };
const flagValues = [undefined, "false", "true"] as const;
const flags = flagValues.flatMap((server) => flagValues.map((client) => ({ server, client })));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.token.mockResolvedValue("session-token");
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("No network expected"); }));
  vi.stubEnv("STRIPE_SECRET_KEY", "unused-test-key");
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

function request(route: string, locale: "nl" | "en") {
  return new Request(`https://bikefitboost.com/api/stripe/${route}`, {
    method: "POST", body: JSON.stringify({ locale, productKey: "annual", withdrawalConsent: true }),
  });
}

describe.each(Object.entries(routes))("%s Stripe stub", (name, post) => {
  it.each(flags)("stays inert with flags %j in both languages", async ({ server, client }) => {
    vi.stubEnv("STRIPE_BILLING_ENABLED", server);
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", client);
    for (const locale of ["nl", "en"] as const) {
      const response = await post(request(name, locale));
      expect(response.status).toBe(501);
      expect(await response.json()).toEqual(stripeNotImplemented(locale));
      expect(response.headers.get("Cache-Control")).toBe("no-store");
    }
    expect(mocks.stripe).not.toHaveBeenCalled();
    expect(mocks.convex).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(flags)("keeps unauthenticated calls at 401 with flags %j", async ({ server, client }) => {
    vi.stubEnv("STRIPE_BILLING_ENABLED", server);
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", client);
    mocks.token.mockResolvedValue(undefined);
    const response = await post(request(name, "nl"));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Not authenticated." });
    expect(mocks.stripe).not.toHaveBeenCalled();
    expect(mocks.convex).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does not turn malformed payment input into a real checkout", async () => {
    const response = await post(new Request(`https://bikefitboost.com/api/stripe/${name}`, {
      method: "POST", body: "invalid JSON",
    }));
    expect(response.status).toBe(501);
    expect(await response.json()).toEqual(stripeNotImplemented("nl"));
  });
});
