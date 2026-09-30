import http from "node:http";
import next from "next";
import { resolve } from "node:path";
import { serveQaAsset } from "./assets.mjs";

const [snapshot, portValue] = process.argv.slice(2);
const port = Number(portValue);
if (!snapshot || !Number.isInteger(port) || port < 1) throw new Error("Usage: server.mjs <snapshot> <port>");

// Load the snapshot's unchanged app, proxy and built configuration, including its isolated distDir.
const app = next({ dev: false, dir: snapshot });
await app.prepare();
const nextHandler = app.getRequestHandler();
const server = http.createServer(async (request, response) => {
  if (await serveQaAsset(request, response, { staticDir: resolve(snapshot, ".next-final-sweep/static") })) return;
  await nextHandler(request, response);
});
await new Promise((done, reject) => {
  server.once("error", reject);
  server.listen(port, "127.0.0.1", done);
});
console.log(`Final sweep production server listening at http://127.0.0.1:${port}`);

let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  server.closeIdleConnections();
  await new Promise((done) => server.close(done));
  await app.close();
  process.exit(0);
}
process.on("SIGTERM", close);
process.on("SIGINT", close);
