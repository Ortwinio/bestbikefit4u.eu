import https from "node:https";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import next from "next";
import { serveQaAsset } from "../../../tests/visual/final-sweep/assets.mjs";

const [source, portValue, keyPath, certPath] = process.argv.slice(2);
const port = Number(portValue);
if (!source || !port || !keyPath || !certPath) throw new Error("Expected source, port, key and certificate");
const app = next({ dev: false, dir: source, hostname: "bestbikefit4u.eu", port: 443 });
await app.prepare();
const handler = app.getRequestHandler();
const server = https.createServer({ key: await readFile(keyPath), cert: await readFile(certPath) }, async (request, response) => {
  if (await serveQaAsset(request, response, { staticDir: resolve(source, ".next/static") })) return;
  await handler(request, response);
});
await new Promise((done, reject) => { server.once("error", reject); server.listen(port, "127.0.0.1", done); });
console.log(`S15 preview ready: https://127.0.0.1:${port}`);
process.on("SIGTERM", async () => {
  server.closeIdleConnections();
  await new Promise(done => server.close(done));
  await app.close();
  process.exit(0);
});
