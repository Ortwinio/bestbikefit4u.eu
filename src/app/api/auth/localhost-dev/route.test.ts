import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const { action } = vi.hoisted(() => ({ action: vi.fn() }));
vi.mock("convex/browser", () => ({ ConvexHttpClient: class { action = action; } }));

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL_ENV", "development");
  vi.stubEnv("CONVEX_DEPLOYMENT", "dev:test");
  vi.stubEnv("LOCALHOST_DEV_LOGIN_SECRET", "test-only-secret");
  vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", "https://example.convex.cloud");
  action.mockReset().mockResolvedValue({ tokens: { token: "test-token", refreshToken: "test-refresh" } });
});
afterEach(() => vi.unstubAllEnvs());

function request(origin = "http://localhost:3000", body: unknown = {}) {
  return new Request("http://localhost:3000/api/auth/localhost-dev", {
    method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body),
  });
}

describe("localhost dev login access", () => {
  it("is disabled in production even with a secret and localhost Host", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect((await POST(request())).status).toBe(404);
    expect(action).not.toHaveBeenCalled();
  });
  it("rejects cross-origin requests before exchanging the privileged secret", async () => {
    expect((await POST(request("https://attacker.example"))).status).toBe(403);
    expect(action).not.toHaveBeenCalled();
  });
  it("rejects missing Origin and malformed request bodies", async () => {
    expect((await POST(request(""))).status).toBe(403);
    expect((await POST(request(undefined, null))).status).toBe(400);
    expect((await POST(request(undefined, { adminRole: {} }))).status).toBe(400);
    expect(action).not.toHaveBeenCalled();
  });
  it("preserves explicitly configured same-origin local development login", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(action).toHaveBeenCalledTimes(1);
  });
});
