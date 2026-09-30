import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { routes, resolveRoutes, locales, viewports } from "./routes.mjs";

test("the sweep includes 70 concrete source routes and 280 unique capture cases", async () => {
  assert.equal(routes.length, 70);
  assert.equal(new Set(routes.map((route) => route.sourceRoute)).size, 70);
  assert.equal(routes.length * locales.length * viewports.length, 280);
  for (const route of routes) {
    assert.ok((await stat(route.sourceFile)).isFile(), route.sourceFile);
    for (const locale of locales) {
      assert.ok(route.paths[locale].startsWith(`/${locale}`));
      assert.ok(!route.paths[locale].includes("["), route.paths[locale]);
    }
  }
  const audit = await readFile("plans/redesign-canvas/audit/route-map.md", "utf8");
  for (const route of routes) assert.ok(audit.includes(route.sourceRoute), route.sourceRoute);
});

test("expected locale exceptions and CMS fallback are explicit", () => {
  assert.equal(routes.find((route) => route.sourceRoute === "/bike-fitting").expected.nl.status, 404);
  assert.equal(routes.find((route) => route.sourceRoute === "/bikefitting").expected.en.status, 404);
  assert.equal(routes.find((route) => route.sourceRoute === "/use-cases").expected.nl.redirectTo, "/nl/guides");
  assert.equal(routes.find((route) => route.sourceRoute === "/blog/[slug]").fixture, "blog");
  const live = resolveRoutes({ blogSlug: "published-example" }).find((route) => route.sourceRoute === "/blog/[slug]");
  assert.equal(live.fixture, undefined);
  assert.equal(live.paths.nl, "/nl/blog/published-example");
});
