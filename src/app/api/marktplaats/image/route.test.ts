import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ token: vi.fn(), rateLimit: vi.fn() }));
vi.mock("@convex-dev/auth/nextjs/server", () => ({ convexAuthNextjsToken: mocks.token }));
vi.mock("@/lib/rateLimiter", () => ({ consumeRateLimit: mocks.rateLimit }));
vi.mock("@/lib/ipHash", () => ({ getClientIp: () => "127.0.0.1", hashIp: () => "test-ip" }));
import { GET } from "./route";

function request(url = "https://images.marktplaats.nl/photo.jpg") {
  return new NextRequest(`http://localhost/api/marktplaats/image?url=${encodeURIComponent(url)}`);
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.token.mockResolvedValue("token");
  mocks.rateLimit.mockResolvedValue({ allowed: true });
});
afterEach(() => vi.unstubAllGlobals());

describe("Marktplaats image proxy", () => {
  it("does not fetch images for unauthenticated requests", async () => {
    mocks.token.mockResolvedValue(null);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect((await GET(request())).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not follow redirects outside the approved hosts", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, {
      status: 302, headers: { location: "http://169.254.169.254/secret" },
    }));
    vi.stubGlobal("fetch", fetchMock);
    expect((await GET(request())).status).toBe(502);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects active SVG content", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<svg/>", {
      headers: { "content-type": "image/svg+xml" },
    })));
    expect((await GET(request())).status).toBe(415);
  });

  it("returns a valid raster image without enabling MIME sniffing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("jpeg", {
      headers: { "content-type": "image/jpeg" },
    })));
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(await response.text()).toBe("jpeg");
  });
});
