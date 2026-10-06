import { test } from "node:test";
import assert from "node:assert/strict";
import { localOrigin, parseOptions } from "./options.mjs";

test("refuses remote production and private-network origins", () => {
  for (const value of ["https://bikefitboost.com", "http://192.168.1.1", "https://localhost.evil.test",
    "http://user:pass@localhost", "http://localhost/path", "file:///tmp/test"]) {
    assert.throws(() => localOrigin(value));
  }
  assert.equal(localOrigin("http://127.0.0.1:3240"), "http://127.0.0.1:3240");
});
test("scope, filtering and automation-only are explicit", () => {
  assert.deepEqual(parseOptions(["--local", "--scope=U1", "--filter=/login", "--automated-only"]),
    { local: true, scope: "U1", filter: "/login", port: 3240, automatedOnly: true });
  assert.throws(() => parseOptions(["--local", "--scope=whatever"]));
  assert.throws(() => parseOptions([]));
});
