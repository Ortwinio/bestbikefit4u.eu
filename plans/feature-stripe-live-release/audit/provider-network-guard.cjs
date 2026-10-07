const http = process.getBuiltinModule("node:http");
const https = process.getBuiltinModule("node:https");
const { syncBuiltinESMExports } = process.getBuiltinModule("node:module");

function assertOfflineProvider(input) {
  const host = typeof input === "string" || input instanceof URL
    ? new URL(input).hostname : input?.hostname ?? input?.host ?? "";
  if (/(^|\.)(stripe\.com|resend\.com)$/i.test(host.split(":")[0])) {
    throw new Error("RELEASE_GATE_PROVIDER_NETWORK_BLOCKED");
  }
}

for (const transport of [http, https]) {
  for (const method of ["request", "get"]) {
    const original = transport[method];
    transport[method] = function (...args) {
      assertOfflineProvider(args[0]);
      return original.apply(this, args);
    };
  }
}
const originalFetch = globalThis.fetch;
globalThis.fetch = function (input, ...args) {
  assertOfflineProvider(input instanceof Request ? input.url : input);
  return originalFetch.call(this, input, ...args);
};
syncBuiltinESMExports();
