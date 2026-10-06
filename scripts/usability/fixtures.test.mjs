import assert from "node:assert/strict";
import test from "node:test";
import { prepareUsabilityFixtures, welcomeHandoffFixture } from "./fixtures.mjs";

test("Welcome filled-state fixture includes real numeric fields and distinct declared/measured provenance", () => {
  const now = 1791288000000;
  const fixture = welcomeHandoffFixture(now);
  assert.equal(fixture.version, 1);
  assert.deepEqual(fixture.entries.map(entry => [entry.field, entry.value, entry.unit, entry.method]), [
    ["heightCm", 184, "cm", "declared"], ["inseamCm", 86, "cm", "measured"],
  ]);
  assert.ok(fixture.entries.every(entry => entry.touchedAt === now && entry.calculator === "saddle-height"));
  assert.throws(() => welcomeHandoffFixture(NaN), /timestamp/);
  fixture.entries[0].value = 1;
  assert.equal(welcomeHandoffFixture(now).entries[0].value, 184);
});

test("fixture preparation rejects external origins and unknown names", async () => {
  await assert.rejects(prepareUsabilityFixtures({ root: "/tmp", origin: "https://example.test" }), /Local production/);
  await assert.rejects(prepareUsabilityFixtures({ root: "/tmp", origin: "http://127.0.0.1", needed: ["unknown"] }), /Unknown or missing/);
});

test("only required adapters start, use production assets, and close once", async () => {
  const calls = [];
  let closed = 0;
  const fixture = await prepareUsabilityFixtures({ root: "/tmp/usability", origin: "http://localhost:3000", needed: ["account", "account"], factories: {
    account: async options => { calls.push(options); return { origin: "http://127.0.0.1:4000", limitations: ["presentation only"], close: async () => { closed++; } }; },
  } });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].staticDir, "/tmp/usability/.next/static");
  assert.deepEqual(fixture.origins, { account: "http://127.0.0.1:4000" });
  assert.deepEqual(fixture.limitations, ["account: presentation only"]);
  await fixture.close();
  await fixture.close();
  assert.equal(closed, 1);
});

test("adapter failure closes already running fixtures and remains a failure", async () => {
  let closed = false;
  await assert.rejects(prepareUsabilityFixtures({ root: "/tmp", origin: "http://localhost:3000", needed: ["account", "checkout"], factories: {
    account: async () => ({ origin: "http://127.0.0.1:4000", close: async () => { closed = true; } }),
    checkout: async () => { throw new Error("Cannot bundle actual checkout"); },
  } }), /Cannot bundle actual checkout/);
  assert.equal(closed, true);
});

test("blog manifest cannot claim SSR from a client-only fixture", async () => {
  let closed = false;
  await assert.rejects(prepareUsabilityFixtures({ root: "/tmp", origin: "http://localhost:3000", needed: ["blog"], factories: {
    blog: async options => {
      assert.equal(options.serverRenderedContent, true);
      return { origin: "http://127.0.0.1:4000", serverRenderedContent: false, close: async () => { closed = true; } };
    },
  } }), /required server-rendered article content/);
  assert.equal(closed, true);
});
test("open and enforced account servers receive explicit distinct compile flags", async () => {
  const flags = [];
  const factory = async options => {
    flags.push(options.paidAccessEnforced);
    return { origin: `http://127.0.0.1:${options.paidAccessEnforced ? 4001 : 4000}`, close: async () => {} };
  };
  const fixtures = await prepareUsabilityFixtures({ root: "/tmp", origin: "http://localhost:3000",
    needed: ["account", "account-enforced"], factories: { account: factory, "account-enforced": factory } });
  assert.deepEqual(flags, [false, true]);
  assert.notEqual(fixtures.origins.account, fixtures.origins["account-enforced"]);
  await fixtures.close();
});
