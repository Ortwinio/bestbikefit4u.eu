import { afterEach, describe, expect, it, vi } from "vitest";
import { proxyOAuthRequest } from "./oauthProxy";
import * as signIn from "@/app/api/auth/signin/[...path]/route";
import * as callback from "@/app/api/auth/callback/[...path]/route";

const site = "https://bikefitboost.com";
const upstreamOrigin = "https://oauth-test.convex.site";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function setup(response: Response = new Response(null, { status: 302 })) {
  vi.stubEnv("NEXT_PUBLIC_CONVEX_SITE_URL", upstreamOrigin);
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("site-origin OAuth HTTP proxy", () => {
  it("exposes installed Convex OAuth methods without caching", () => {
    expect(signIn.GET).toBe(proxyOAuthRequest);
    expect(callback.GET).toBe(proxyOAuthRequest);
    expect(callback.POST).toBe(proxyOAuthRequest);
    expect(signIn.dynamic).toBe("force-dynamic");
    expect(callback.dynamic).toBe("force-dynamic");
    expect("POST" in signIn).toBe(false);
  });

  it("preserves raw query parameters and separate secure cookies without following provider redirects", async () => {
    const headers = new Headers({ Location: "https://accounts.google.com/o/oauth2/v2/auth?state=opaque" });
    const cookies = [
      "__Host-googleOAuthstate=state; Path=/; Secure; HttpOnly; SameSite=Lax",
      "__Host-googleOAuthpkce=pkce; Expires=Wed, 21 Oct 2026 07:28:00 GMT; Path=/; Secure; HttpOnly; SameSite=Lax",
    ];
    for (const cookie of cookies) headers.append("Set-Cookie", cookie);
    const fetchMock = setup(new Response(null, { status: 302, headers }));
    const query = "?code=opaque%2Bvalue&redirectTo=%2Fnl%2Fwelcome%3Fhandoff%3D1&scope=a&scope=b";
    const response = await signIn.GET(new Request(`${site}/api/auth/signin/google${query}`, {
      headers: { Cookie: "existing=opaque", Host: "spoof.invalid", "X-Forwarded-Host": "spoof.invalid" },
    }));
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${upstreamOrigin}/api/auth/signin/google${query}`);
    expect(options).toMatchObject({ method: "GET", redirect: "manual", cache: "no-store" });
    expect(options.headers.get("cookie")).toBe("existing=opaque");
    expect(options.headers.has("host")).toBe(false);
    expect(options.headers.has("x-forwarded-host")).toBe(false);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(headers.get("location"));
    expect(response.headers.getSetCookie()).toEqual(cookies);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("preserves callback state cookies and the localized app-code redirect", async () => {
    const location = `${site}/en/welcome?handoff=1&code=app-code`;
    const fetchMock = setup(new Response(null, { status: 302, headers: { Location: location } }));
    const response = await callback.GET(new Request(`${site}/api/auth/callback/google?code=provider-code&state=state`, {
      headers: { Cookie: "__Host-googleOAuthstate=state; __Host-googleOAuthpkce=pkce" },
    }));
    expect(fetchMock.mock.calls[0][1].headers.get("cookie")).toContain("__Host-googleOAuthpkce=pkce");
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(location);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("passes form-post callback bytes and upstream errors, stripping hop-by-hop headers", async () => {
    const fetchMock = setup(new Response("Invalid provider state", {
      status: 400,
      headers: { "Content-Type": "text/plain", "Content-Length": "22", Connection: "x-internal", "x-internal": "remove" },
    }));
    const body = "code=opaque%2Bcode&state=a+b&state=second";
    const response = await callback.POST(new Request(`${site}/api/auth/callback/google?extra=%2F`, {
      method: "POST", body, headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: "state=opaque" },
    }));
    const options = fetchMock.mock.calls[0][1];
    expect(new TextDecoder().decode(options.body)).toBe(body);
    expect(options.headers.get("content-type")).toBe("application/x-www-form-urlencoded");
    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Invalid provider state");
    expect(response.headers.has("content-length")).toBe(false);
    expect(response.headers.has("x-internal")).toBe(false);
  });

  it.each(["/api/auth", "/api/auth/localhost-dev", "/api/auth/callback", "/api/strava/callback"])(
    "does not capture unrelated namespace %s", async (path) => {
      const fetchMock = setup();
      expect((await proxyOAuthRequest(new Request(`${site}${path}`))).status).toBe(404);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it.each([undefined, "", site, "https://user:password@oauth-test.convex.site", "https://oauth-test.convex.site/path",
    "https://oauth-test.convex.site?bad=1", "https://oauth-test.convex.site#bad", "http://remote.invalid", "file:///tmp/auth"])(
    "fails closed for invalid upstream %s", async (configured) => {
      const fetchMock = setup();
      vi.stubEnv("NEXT_PUBLIC_CONVEX_SITE_URL", configured);
      const response = await signIn.GET(new Request(`${site}/api/auth/signin/google?code=private`));
      expect(response.status).toBe(503);
      expect(await response.text()).not.toContain("private");
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("permits a loopback fake upstream and removes fetch-decoded transport encoding", async () => {
    const fetchMock = setup(new Response("decoded", { headers: { "Content-Encoding": "gzip" } }));
    vi.stubEnv("NEXT_PUBLIC_CONVEX_SITE_URL", "http://127.0.0.1:4329/");
    const response = await signIn.GET(new Request(`${site}/api/auth/signin/google`));
    expect(fetchMock.mock.calls[0][0]).toBe("http://127.0.0.1:4329/api/auth/signin/google");
    expect(response.headers.has("content-encoding")).toBe(false);
    expect(await response.text()).toBe("decoded");
  });

  it("does not leak upstream failures", async () => {
    const fetchMock = setup();
    fetchMock.mockRejectedValue(new Error("secret detail"));
    const response = await signIn.GET(new Request(`${site}/api/auth/signin/google`));
    expect(response.status).toBe(502);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).not.toContain("secret");
  });

  it.each(["PUT", "DELETE", "POST"])("rejects unsupported signin method %s", async (method) => {
    const fetchMock = setup();
    const response = await proxyOAuthRequest(new Request(`${site}/api/auth/signin/google`, { method }));
    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
