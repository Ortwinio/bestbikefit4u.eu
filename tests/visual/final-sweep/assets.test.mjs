import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { serveQaAsset } from "./assets.mjs";

function response() {
  return { headers: {}, setHeader(key, value) { this.headers[key] = value; }, end(body) { this.body = body; } };
}
test("build JS/CSS/fonts are served with real bytes and MIME types; missing files remain 404", async () => {
  const staticDir = await mkdtemp(join(tmpdir(), "qa-assets-"));
  try {
    await mkdir(join(staticDir, "chunks"));
    for (const [name, body, type] of [["app.js", "window.ok=true", "javascript"],
      ["app.css", "body{}", "text/css"], ["font.woff2", "font-fixture", "font/woff2"]]) {
      await writeFile(join(staticDir, "chunks", name), body);
      const res = response();
      assert.equal(await serveQaAsset({ url: `/_next/static/chunks/${name}?v=1`, headers: { host: "localhost" } },
        res, { staticDir }), true);
      assert.equal(res.statusCode, 200);
      assert.ok(res.headers["content-type"].includes(type));
      assert.equal(res.body.toString(), body);
    }
    const missing = response();
    await serveQaAsset({ url: "/_next/static/missing.js", headers: { host: "localhost" } }, missing, { staticDir });
    assert.equal(missing.statusCode, 404);
    const traversal = response();
    await serveQaAsset({ url: "/_next/static/%2e%2e%2fsecret", headers: { host: "localhost" } },
      traversal, { staticDir });
    assert.equal(traversal.statusCode, 400);
  } finally { await rm(staticDir, { recursive: true, force: true }); }
});
test("only the two exact Vercel scripts on loopback are local no-ops", async () => {
  const res = response();
  const request = { url: "/_vercel/insights/script.js", headers: { host: "127.0.0.1:4321" } };
  assert.equal(await serveQaAsset(request, res, { staticDir: "/unused" }), true);
  assert.match(res.headers["content-type"], /javascript/);
  assert.equal(res.headers["x-qa-diagnostic"], "local-vercel-analytics-disabled");
  assert.equal(await serveQaAsset({ ...request, headers: { host: "bikefitboost.com" } }, response(),
    { staticDir: "/unused" }), false);
  assert.equal(await serveQaAsset({ ...request, url: "/_vercel/other.js" }, response(),
    { staticDir: "/unused" }), false);
});
test("serves only bounded local assets across dev/build directories and never invokes fetch", async () => {
  const root = await mkdtemp(join(tmpdir(), "qa-assets-fallback-"));
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("Network access is forbidden in asset requests"); };
  try {
    const staticDir = join(root, "primary");
    const fallback = join(root, "fallback");
    await mkdir(staticDir); await mkdir(fallback);
    await writeFile(join(fallback, "font.woff2"), "font-data");
    for (const url of ["/_next/static/font.woff2", "http://attacker.invalid/_next/static/font.woff2"]) {
      const res = response();
      await serveQaAsset({ url, headers: { host: "localhost" } }, res,
        { staticDir, fallbackStaticDirs: [fallback] });
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.toString(), "font-data");
    }
    const traversal = response();
    await serveQaAsset({ url: "/_next/static/%2e%2e%2fsecret", headers: {} }, traversal,
      { staticDir, fallbackStaticDirs: [fallback] });
    assert.equal(traversal.statusCode, 400);
    const optimizer = response();
    assert.equal(await serveQaAsset({ url: "/_next/image?url=http://private.invalid", headers: {} }, optimizer,
      { staticDir }), false);
  } finally {
    globalThis.fetch = originalFetch;
    await rm(root, { recursive: true, force: true });
  }
});
