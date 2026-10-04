import { afterEach, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

it("uses the new canonical origin by default", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  vi.stubEnv("SITE_URL", "");
  vi.resetModules();
  expect((await import("./brand")).SITE_ORIGIN).toBe("https://www.bikefitboost.com");
});

it("normalizes the shared public override to an origin", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", " https://preview.example.com/path ");
  vi.stubEnv("SITE_URL", "https://backend.example.com");
  vi.resetModules();
  expect((await import("./brand")).SITE_ORIGIN).toBe("https://preview.example.com");
});

it("supports the backend site environment when the public override is absent", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  vi.stubEnv("SITE_URL", "https://backend.example.com/");
  vi.resetModules();
  expect((await import("./brand")).SITE_ORIGIN).toBe("https://backend.example.com");
});

it("ignores a stale override that still names a legacy host, so redirects cannot loop", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://bestbikefit4u.eu");
  vi.stubEnv("SITE_URL", "https://www.bestbikefit4u.eu/");
  vi.resetModules();
  expect((await import("./brand")).SITE_ORIGIN).toBe("https://www.bikefitboost.com");
});
