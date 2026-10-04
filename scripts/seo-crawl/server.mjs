import { createServer } from "node:https";
import { readFile } from "node:fs/promises";
import next from "next";
import { SITE_ORIGIN } from "../../shared/brand.ts";

const [portValue, keyPath, certPath] = process.argv.slice(2);
const port = Number(portValue);
if (!Number.isInteger(port) || port < 1 || !keyPath || !certPath) throw new Error("Missing local TLS server arguments");
// Same production build as next start; TLS avoids Next 16's loopback middleware rewrite loop.
// Production Host is supplied by the crawler to exercise real indexing policy, not preview noindex.
const app = next({ dev: false, dir: process.cwd(), hostname: new URL(SITE_ORIGIN).hostname, port: 443 });
await app.prepare();
const handler = app.getRequestHandler();
const server = createServer({ key: await readFile(keyPath), cert: await readFile(certPath) }, handler);
await new Promise((done, reject) => {
  server.once("error", reject);
  server.listen(port, "127.0.0.1", done);
});
console.log(`SEO production HTTPS server ready on ${port}`);
process.on("SIGTERM", async () => {
  server.closeIdleConnections();
  await new Promise((done) => server.close(done));
  await app.close();
  process.exit(0);
});
