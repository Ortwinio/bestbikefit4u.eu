import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, expect, it, vi } from "vitest";
import { GET as signIn } from "@/app/api/auth/signin/[...path]/route";
import { GET as callback } from "@/app/api/auth/callback/[...path]/route";

let server: Server | undefined;

afterEach(async () => {
  vi.unstubAllEnvs();
  if (server) {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server!.close((error) => error ? reject(error) : resolve()));
    server = undefined;
  }
});

it("round-trips fake provider redirects and separate state cookies through a real loopback HTTP upstream", async () => {
  const appOrigin = "https://bikefitboost.com";
  const callbackUrl = `${appOrigin}/api/auth/callback/google`;
  const requests: { pathname: string; search: string; cookie?: string }[] = [];
  server = createServer((request, response) => {
    const url = new URL(request.url!, origin);
    requests.push({ pathname: url.pathname, search: url.search, cookie: request.headers.cookie });
    response.setHeader("Cache-Control", "public, max-age=3600");
    if (url.pathname === "/api/auth/signin/google") {
      response.writeHead(302, {
        Location: `${origin}/fake-provider?redirect_uri=${encodeURIComponent(callbackUrl)}&state=fake-state`,
        "Set-Cookie": [
          "__Host-googleOAuthstate=fake-state; Path=/; Secure; HttpOnly; SameSite=None; Partitioned",
          "__Host-googleOAuthpkce=fake-pkce; Expires=Wed, 21 Oct 2026 07:28:00 GMT; Path=/; Secure; HttpOnly; SameSite=None",
        ],
      });
    } else if (url.pathname === "/fake-provider") {
      response.writeHead(302, { Location: `${url.searchParams.get("redirect_uri")}?code=fake-provider-code&state=fake-state` });
    } else if (url.pathname === "/api/auth/callback/google") {
      if (url.searchParams.get("state") !== "fake-state" || !request.headers.cookie?.includes("fake-pkce")) {
        response.writeHead(400);
        response.end("Invalid fake state");
        return;
      }
      response.writeHead(302, {
        Location: `${appOrigin}/nl/welcome?handoff=1&code=fake-app-code`,
        "Set-Cookie": [
          "__Host-googleOAuthstate=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=None",
          "__Host-googleOAuthpkce=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=None",
        ],
      });
    } else response.writeHead(404);
    response.end();
  });
  await new Promise<void>((resolve, reject) => {
    server!.once("error", reject);
    server!.listen(0, "127.0.0.1", resolve);
  });
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  vi.stubEnv("NEXT_PUBLIC_CONVEX_SITE_URL", origin);

  const query = "?code=fake%2Bverifier&redirectTo=%2Fnl%2Fwelcome%3Fhandoff%3D1&scope=a&scope=b";
  const start = await signIn(new Request(`${appOrigin}/api/auth/signin/google${query}`));
  expect(start.status).toBe(302);
  expect(requests).toHaveLength(1);
  expect(requests[0].search).toBe(query);
  expect(start.headers.get("cache-control")).toBe("no-store");
  const cookies = start.headers.getSetCookie();
  expect(cookies).toHaveLength(2);
  expect(cookies[1]).toContain("Expires=Wed, 21 Oct 2026");
  expect(cookies[0]).toContain("Partitioned");

  const provider = await fetch(start.headers.get("location")!, { redirect: "manual" });
  expect(provider.status).toBe(302);
  const returned = await callback(new Request(provider.headers.get("location")!, {
    headers: { Cookie: cookies.map((cookie) => cookie.split(";")[0]).join("; "), Accept: "text/html" },
  }));
  expect(returned.status).toBe(302);
  expect(returned.headers.get("location")).toBe(`${appOrigin}/nl/welcome?handoff=1&code=fake-app-code`);
  expect(returned.headers.getSetCookie()).toHaveLength(2);
  expect(returned.headers.getSetCookie().every((cookie) => cookie.includes("Max-Age=0"))).toBe(true);
  expect(requests.map((request) => request.pathname)).toEqual([
    "/api/auth/signin/google", "/fake-provider", "/api/auth/callback/google",
  ]);

  const rejected = await callback(new Request(`${callbackUrl}?code=fake-code&state=wrong`));
  expect(rejected.status).toBe(400);
  expect(await rejected.text()).toBe("Invalid fake state");
  expect(rejected.headers.get("cache-control")).toBe("no-store");
});
