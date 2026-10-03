import { createServer } from "node:https";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import next from "next";
import { createPreviewCertificate } from "../../tests/visual/final-sweep/tls.mjs";
const port = 3197;
if (process.argv[2] === "--serve") {
  const app = next({ dev: false, dir: process.cwd(), hostname: "localhost", port });
  await app.prepare();
  const server = createServer({ key: await readFile(process.argv[3]), cert: await readFile(process.argv[4]) }, app.getRequestHandler());
  await new Promise((done, reject) => { server.once("error", reject); server.listen(port, "127.0.0.1", done); });
  console.log("PERFORMANCE_SERVER_READY");
  process.on("SIGTERM", async () => { server.closeAllConnections(); await app.close(); process.exit(0); });
} else {
  const certificate = await createPreviewCertificate();
  const env = { ...process.env, NODE_EXTRA_CA_CERTS: certificate.certPath };
  const server = spawn(process.execPath, ["scripts/performance/local.mjs", "--serve", certificate.keyPath, certificate.certPath], {
    env, stdio: ["ignore", "pipe", "inherit"],
  });
  try {
    await new Promise((done, reject) => {
      server.on("error", reject); server.on("exit", code => reject(new Error(`Local HTTPS exited ${code}`)));
      server.stdout.on("data", chunk => { process.stdout.write(chunk); if (String(chunk).includes("PERFORMANCE_SERVER_READY")) done(); });
    });
    const child = spawn(process.execPath, [process.argv.includes("--debug") ? "scripts/performance/debug.mjs"
      : process.argv.includes("--answers") ? "scripts/performance/check-answers.mjs" : "scripts/performance/run.mjs", `--base=https://localhost:${port}`, ...process.argv.slice(2)], {
      stdio: "inherit", env,
    });
    process.exitCode = await new Promise((done, reject) => { child.on("error", reject); child.on("close", done); });
  } finally { server.kill("SIGTERM"); await certificate.close(); }
}
