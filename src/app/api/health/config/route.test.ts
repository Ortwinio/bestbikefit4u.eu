import { afterEach, expect, it, vi } from "vitest";
import { GET } from "./route";
import { STRIPE_REQUIRED_ENV } from "@/lib/billing/serverStripe";
afterEach(() => vi.unstubAllEnvs());
it("requires billing configuration only with both affirmative flags and never exposes values", async () => {
  vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", "https://mock.convex.cloud");
  vi.stubEnv("NEXT_PUBLIC_CONVEX_SITE_URL", "https://mock.convex.site");
  vi.stubEnv("STRIPE_BILLING_ENABLED", "false");
  vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
  for (const name of STRIPE_REQUIRED_ENV) vi.stubEnv(name, "");
  expect((await GET()).status).toBe(200);
  vi.stubEnv("STRIPE_BILLING_ENABLED", "true");
  expect((await GET()).status).toBe(503);
  for (const name of STRIPE_REQUIRED_ENV) vi.stubEnv(name, "configured-private-value");
  const response = await GET();
  expect(response.status).toBe(200);
  expect(await response.text()).not.toContain("configured-private-value");
});
