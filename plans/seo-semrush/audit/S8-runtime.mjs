import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { writeFile } from "node:fs/promises";

const probe = createServer();
probe.listen(0, "127.0.0.1");
await once(probe, "listening");
const port = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  env: { ...process.env, NEXT_PUBLIC_CONVEX_URL: "http://127.0.0.1:9",
    NEXT_PUBLIC_CONVEX_SITE_URL: "http://127.0.0.1:9", NEXT_TELEMETRY_DISABLED: "1" },
  stdio: "ignore",
});
const origin = `http://127.0.0.1:${port}`;
const results = [];
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${origin}/llms.txt`, { method: "HEAD", signal: AbortSignal.timeout(1000) });
      if (response.ok) { ready = true; break; }
    } catch { ready = false; }
    if (server.exitCode !== null) throw new Error("Local server exited before readiness");
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert.ok(ready, "local production server ready");
  for (const path of ["/llms.txt", "/llms-full.txt"]) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /^text\/plain/);
    const body = await response.text();
    assert.match(body, /BestBikeFit4U/);
    assert.ok(body.includes("https://bestbikefit4u.eu/nl/guides/"));
    assert.ok(body.includes("https://bestbikefit4u.eu/en/guides/"));
    assert.ok(body.includes("https://bestbikefit4u.eu/en/tire-pressure/road-bike"));
    assert.ok(body.includes("https://bestbikefit4u.eu/nl/bandenspanning/racefiets"));
    assert.doesNotMatch(body, /https:\/\/bestbikefit4u\.eu\/(?:en|nl)\/(?:login|dashboard|profile)(?:[)\s/]|$)/);
    assert.doesNotMatch(body, /\/(?:tire-pressure|bandenspanning)\/\d+kg-/);
    const head = await fetch(origin + path, { method: "HEAD" });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), "");
    results.push({ path, status: response.status, contentType: response.headers.get("content-type"),
      bytes: Buffer.byteLength(body), headStatus: head.status });
  }
  await writeFile("plans/seo-semrush/audit/S8-runtime.json", JSON.stringify({ passed: true, results }, null, 2) + "\n");
  console.log(JSON.stringify({ passed: true, results }));
} finally {
  if (server.exitCode === null) {
    server.kill("SIGTERM");
    await once(server, "exit");
  }
}
