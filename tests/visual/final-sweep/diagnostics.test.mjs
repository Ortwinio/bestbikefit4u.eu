import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyExpectedDiagnostic, localConvexSyncOrigin } from "./diagnostics.mjs";
const message = (url) => `Connecting to '${url}' violates the following Content Security Policy directive: `
  + '"connect-src self https://*.convex.cloud". The action has been blocked.';
const options = { configuredConvexUrl: "http://127.0.0.1:3210", pageUrl: "http://127.0.0.1:4321/nl" };
const error = { type: "console", message: message("ws://127.0.0.1:3210/api/1.42.1/sync") };
test("only a matching configured loopback Convex CSP connection is an expected diagnostic", () => {
  assert.equal(classifyExpectedDiagnostic(error, options).kind, "local-dev-convex-csp");
  for (const configuredConvexUrl of [undefined, "https://app.convex.cloud", "http://192.168.1.1:3210",
    "http://127.0.0.1:3211"]) {
    assert.equal(classifyExpectedDiagnostic(error, { ...options, configuredConvexUrl }), null);
  }
  for (const url of ["wss://app.convex.cloud/api/1.42.1/sync", "ws://127.0.0.1:3210/other",
    "ws://localhost:3210/api/1.42.1/sync", "ws://127.0.0.1:3210/api/1.42.1/sync?secret=x"]) {
    assert.equal(classifyExpectedDiagnostic({ ...error, message: message(url) }, options), null);
  }
  assert.equal(classifyExpectedDiagnostic({ ...error, type: "pageerror" }, options), null);
  assert.equal(classifyExpectedDiagnostic(error, { ...options, pageUrl: "https://preview.vercel.app/nl" }), null);
  assert.equal(classifyExpectedDiagnostic({ ...error, message: "WebSocket connection failed" }, options), null);
  assert.equal(localConvexSyncOrigin("https://localhost:3210"), "wss://localhost:3210");
});
