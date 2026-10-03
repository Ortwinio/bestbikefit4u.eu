import { createServer as createProbe } from "node:net";
import { createServer } from "node:http";
import { request as httpsRequest } from "node:https";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { SITE_ORIGIN } from "../../../shared/brand.ts";
import { createPreviewCertificate } from "../../../tests/visual/final-sweep/tls.mjs";
import { sendFixtureError } from "../../../tests/visual/lib/http-errors.mjs";

// Actual production HTML/CSS over local TLS, presented as HTTP to the existing fixture harness.
const certificate = await createPreviewCertificate();
const probe = createProbe();
probe.listen(0, "127.0.0.1");
await once(probe, "listening");
const tlsPort = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const child = spawn(process.execPath, ["scripts/seo-crawl/server.mjs", String(tlsPort),
  certificate.keyPath, certificate.certPath], { stdio: ["ignore", "pipe", "inherit"] });
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error("Production TLS startup timeout")), 60000);
  child.once("error", reject);
  child.once("exit", code => reject(new Error(`Production TLS server exited ${code}`)));
  child.stdout.on("data", chunk => {
    if (String(chunk).includes("HTTPS server ready")) { clearTimeout(timer); resolve(); }
  });
});
const proxy = createServer((request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405); response.end("Method not allowed"); return;
  }
  const upstream = httpsRequest({ hostname: "127.0.0.1", port: tlsPort, path: request.url,
    method: request.method, ca: certificate.cert, servername: "localhost",
    headers: { ...request.headers, host: new URL(SITE_ORIGIN).host, "x-forwarded-proto": "https" },
  }, result => {
    response.writeHead(result.statusCode, result.headers);
    result.pipe(response);
  });
  upstream.on("error", error => {
    if (response.headersSent) { console.error(error); response.destroy(); }
    else sendFixtureError(response, error);
  });
  upstream.end();
});
proxy.listen(0, "127.0.0.1");
await once(proxy, "listening");
console.log(JSON.stringify({ origin: `http://127.0.0.1:${proxy.address().port}`, tlsPort }));
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  proxy.closeAllConnections();
  await new Promise(resolve => proxy.close(resolve));
  child.kill("SIGTERM");
  await once(child, "exit");
  await certificate.close();
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
