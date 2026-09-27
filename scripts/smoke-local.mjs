import assert from "node:assert/strict";

// Read-only route checks against a local production build, never a remote site.
const origin = new URL(process.env.SMOKE_BASE_URL ?? "http://localhost:3001");
assert(["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname), "Use a local server");
const paths = [
  "/en", "/nl", "/en/login", "/nl/login", "/en/pricing", "/en/faq", "/en/contact",
  "/en/calculators/bike-fit", "/en/calculators/saddle-height", "/en/calculators/saddle-width",
  "/en/calculators/frame-size", "/en/calculators/crank-length", "/en/calculators/gearing",
  "/en/tire-pressure-calculator", "/en/guides", "/en/blog", "/sitemap.xml", "/robots.txt",
];
const protectedPaths = new Map([["/en/dashboard", "/en/login"], ["/nl/fit", "/nl/login"]]);

for (let attempt = 0; ; attempt++) {
  try {
    await fetch(new URL("/robots.txt", origin), { signal: AbortSignal.timeout(5_000) });
    break;
  } catch (error) {
    if (attempt >= 20) throw error;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

for (const path of [...paths, ...protectedPaths.keys()]) {
  const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(30_000) });
  assert.equal(response.status, 200, path);
  assert.equal(new URL(response.url).pathname, protectedPaths.get(path) ?? path, `${path} destination`);
  const body = await response.text();
  assert(!/Application error:|Internal Server Error/.test(body), `${path} error screen`);
  if (path.endsWith("/login")) {
    const policy = response.headers.get("content-security-policy") ?? "";
    const nonce = policy.match(/'nonce-([^']+)'/)?.[1];
    assert(nonce, "Login requires a script nonce");
    assert(!policy.includes("'unsafe-eval'"), "Run this check against a production build");
    for (const [, attributes] of body.matchAll(/<script\b([^>]*)>/g)) {
      assert(attributes.includes(`nonce="${nonce}"`), "Every login script needs the response nonce");
    }
  }
  console.log(`PASS ${path}`);
}
console.log(`Verified ${paths.length + protectedPaths.size} routes and production login CSP.`);
