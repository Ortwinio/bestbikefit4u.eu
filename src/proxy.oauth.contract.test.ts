import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, type NextFetchEvent } from "next/server";
import { BRAND } from "@/config/brand";
import { proxy } from "./proxy";

const mocks = vi.hoisted(() => ({
  fetchAction: vi.fn(),
  fetchQuery: vi.fn(),
  headers: vi.fn(),
  cookies: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@convex-dev/auth/nextjs/server", () =>
  vi.importActual<typeof import("@convex-dev/auth/nextjs/server")>("../node_modules/@convex-dev/auth/src/nextjs/server/index.tsx")
);
vi.mock("convex/nextjs", () => ({
  fetchAction: mocks.fetchAction,
  fetchQuery: mocks.fetchQuery,
}));
vi.mock("next/headers", () => ({
  headers: mocks.headers,
  cookies: mocks.cookies,
}));

function makeRequest(path: string, init: ConstructorParameters<typeof NextRequest>[1] = {}, origin = "https://bikefitboost.com") {
  const request = new NextRequest(new URL(path, origin), init);
  request.headers.set("host", new URL(origin).host);
  mocks.headers.mockResolvedValue(request.headers);
  mocks.cookies.mockResolvedValue(request.cookies);
  return request;
}

async function runProxy(request: NextRequest) {
  const response = await proxy(request, {} as NextFetchEvent);
  expect(response).toBeInstanceOf(Response);
  return response as Response;
}

describe("OAuth namespace middleware contract with installed Convex Auth", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.fetchAction.mockResolvedValue({ tokens: { token: "new-token", refreshToken: "new-refresh" } });
    mocks.fetchQuery.mockResolvedValue(false);
  });

  it.each(["/api/auth/signin/google", "/api/auth/callback/google"])("forwards %s code, state and cookies without auth exchange or refresh", async (path) => {
    const request = makeRequest(`${path}?code=provider%2Bcode&state=opaque%2Fstate`, {
      method: "GET",
      headers: {
        accept: "text/html",
        cookie: "__Host-__convexAuthJWT=invalid-token; __Host-__convexAuthRefreshToken=refresh; __Host-__convexAuthOAuthVerifier=verifier; oauth-state=opaque",
      },
    });
    const originalUrl = request.url;
    const originalCookie = request.headers.get("cookie");
    const response = await runProxy(request);

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(request.url).toBe(originalUrl);
    expect(request.nextUrl.searchParams.get("code")).toBe("provider+code");
    expect(response.headers.get("x-middleware-request-cookie")).toBe(originalCookie);
    expect(request.headers.get("cookie")).toBe(originalCookie);
    expect(mocks.headers).not.toHaveBeenCalled();
    expect(mocks.cookies).not.toHaveBeenCalled();
    expect(mocks.fetchAction).not.toHaveBeenCalled();
    expect(mocks.fetchQuery).not.toHaveBeenCalled();
  });

  it.each(["/api/auth/signin", "/api/auth/signin/", "/api/auth/callback", "/api/auth/callback/"])("bypasses namespace root %s", async (path) => {
    const response = await runProxy(makeRequest(`${path}?code=provider-code`, { headers: { accept: "text/html" } }));
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(mocks.headers).not.toHaveBeenCalled();
  });

  it.each(["/api/auth", "/api/auth/"])("retains %s POST action and cookie behavior", async (path) => {
    const response = await runProxy(makeRequest(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "auth:signIn", args: { provider: "resend", params: { code: "email-code" } } }),
    }));
    expect(mocks.fetchAction).toHaveBeenCalledWith("auth:signIn", { provider: "resend", params: { code: "email-code" } }, {});
    expect(await response.json()).toEqual({ tokens: { token: "new-token", refreshToken: "dummy" } });
    expect(response.headers.get("set-cookie")).toContain("__Host-__convexAuthRefreshToken=new-refresh");
  });

  it("retains the auth POST cross-origin rejection", async () => {
    const response = await runProxy(makeRequest("/api/auth", {
      method: "POST",
      headers: { origin: "https://other.example" },
      body: "{}",
    }));
    expect(response.status).toBe(403);
    expect(mocks.fetchAction).not.toHaveBeenCalled();
  });

  it("leaves localhost-dev POST body and middleware processing intact", async () => {
    const request = makeRequest("/api/auth/localhost-dev", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "dev@example.test" }),
    }, "http://localhost:3000");
    const response = await runProxy(request);
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(mocks.cookies).toHaveBeenCalled();
    expect(mocks.fetchAction).not.toHaveBeenCalled();
    expect(request.bodyUsed).toBe(false);
    expect(await request.json()).toEqual({ email: "dev@example.test" });
  });

  it("retains session refresh on localhost-dev", async () => {
    const expiredToken = `e30.${Buffer.from(JSON.stringify({ iat: 1, exp: 2 })).toString("base64url")}.signature`;
    const response = await runProxy(makeRequest("/api/auth/localhost-dev", {
      method: "POST",
      headers: { cookie: `__convexAuthJWT=${expiredToken}; __convexAuthRefreshToken=existing-refresh` },
    }, "http://localhost:3000"));
    expect(mocks.fetchAction).toHaveBeenCalledWith("auth:signIn", { refreshToken: "existing-refresh" }, {});
    expect(response.headers.get("set-cookie")).toContain("__convexAuthRefreshToken=new-refresh");
  });

  it.each(["/en/login", "/nl/login", "/api/auth/callback-extra", "/api/auth/signin-extra"])("retains code processing outside the bypass: %s", async (path) => {
    const response = await runProxy(makeRequest(`${path}?code=convex-code&keep=yes`, {
      headers: { accept: "text/html", cookie: "__Host-__convexAuthOAuthVerifier=verifier" },
    }));
    expect(mocks.fetchAction).toHaveBeenCalledWith("auth:signIn", { params: { code: "convex-code" }, verifier: "verifier" }, {});
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(`https://bikefitboost.com${path}?keep=yes`);
    expect(response.headers.get("set-cookie")).toContain("__Host-__convexAuthJWT=new-token");
  });

  it.each([BRAND.siteUrl, "https://preview.example"])("preserves nonce and deployment headers on %s", async (origin) => {
    const response = await runProxy(makeRequest("/api/auth/callback/google", {}, origin));
    const nonce = response.headers.get("x-middleware-request-x-nonce");
    expect(nonce).toMatch(/^[a-f0-9]{32}$/);
    expect(response.headers.get("content-security-policy")).toContain(`'nonce-${nonce}'`);
    expect(response.headers.get("x-middleware-request-content-security-policy")).toBe(response.headers.get("content-security-policy"));
    expect(response.headers.get("x-robots-tag")).toBe(new URL(origin).hostname === BRAND.host ? null : "noindex, nofollow, noarchive");
  });
});
