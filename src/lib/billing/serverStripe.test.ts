import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ construct: vi.fn() }));
vi.mock("stripe", () => ({ default: class { constructor(...args: unknown[]) { mock.construct(...args); } } }));
import { assertStripeMode, getServerStripe } from "./serverStripe";

afterEach(() => vi.unstubAllEnvs());
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("STRIPE_BILLING_ENABLED", "true");
  vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
});
describe("Stripe client mode boundary", () => {
  for (const prefix of ["sk", "rk"]) {
    for (const keyMode of ["test", "live"]) {
      it.each(["test", "live"])(`${prefix}_${keyMode} vs configured %s`, mode => {
        vi.stubEnv("STRIPE_MODE", mode);
        vi.stubEnv("STRIPE_SECRET_KEY", `${prefix}_${keyMode}_dummy`);
        if (mode === keyMode) {
          expect(assertStripeMode()).toBe(mode);
          getServerStripe();
          expect(mock.construct).toHaveBeenCalledTimes(1);
        } else {
          expect(() => getServerStripe()).toThrow("STRIPE_MODE_MISMATCH");
          expect(mock.construct).not.toHaveBeenCalled();
        }
      });
    }
  }
  it.each([undefined, "", "production", "TEST"])("invalid mode %s constructs no client", mode => {
    vi.stubEnv("STRIPE_MODE", mode);
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_dummy");
    expect(() => getServerStripe()).toThrow("STRIPE_MODE_INVALID");
    expect(mock.construct).not.toHaveBeenCalled();
  });
  it.each([undefined, "", "pk_test_dummy", "sk_test_", "bad", "sk_live_dummy secret"])(
    "invalid key %s constructs no client", key => {
      vi.stubEnv("STRIPE_MODE", "test");
      vi.stubEnv("STRIPE_SECRET_KEY", key);
      expect(() => getServerStripe()).toThrow("STRIPE_KEY_INVALID");
      expect(mock.construct).not.toHaveBeenCalled();
    });
  it.each([["false", "true"], ["true", "false"], ["false", "false"]])(
    "flags %s/%s keep the original disabled error despite absent mode/key", (server, client) => {
      vi.stubEnv("STRIPE_BILLING_ENABLED", server);
      vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", client);
      vi.stubEnv("STRIPE_MODE", undefined);
      vi.stubEnv("STRIPE_SECRET_KEY", undefined);
      expect(() => getServerStripe()).toThrow("STRIPE_NOT_IMPLEMENTED");
      expect(mock.construct).not.toHaveBeenCalled();
    });
});
