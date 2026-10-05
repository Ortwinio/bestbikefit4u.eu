import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { createPreviewCertificate } from "../final-sweep/tls.mjs";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const certificate = await createPreviewCertificate();
const port = Number(process.argv.slice(2).find(argument => /^\d+$/.test(argument)) ?? 3214);
const env = { ...process.env, NEXT_PUBLIC_SITE_URL: "https://bikefitboost.com",
  NEXT_PUBLIC_CONVEX_URL: "http://127.0.0.1:9", NEXT_PUBLIC_CONVEX_SITE_URL: "http://127.0.0.1:9",
  CONVEX_SITE_URL: "http://127.0.0.1:9", NEXT_TELEMETRY_DISABLED: "1", NODE_EXTRA_CA_CERTS: certificate.certPath };
const server = spawn(process.execPath, [resolve(root, "scripts/seo-crawl/server.mjs"), String(port), certificate.keyPath, certificate.certPath],
  { cwd: root, env, stdio: ["ignore", "pipe", "inherit"] });
try {
  await new Promise((done, reject) => {
    const timeout = setTimeout(() => reject(new Error("Local TLS server startup timed out")), 30000);
    server.once("error", reject);
    server.once("exit", code => { clearTimeout(timeout); reject(new Error(`Server exited ${code}`)); });
    server.stdout.on("data", data => {
      process.stdout.write(data);
      if (String(data).includes("HTTPS server ready")) { clearTimeout(timeout); done(); }
    });
  });
  const script = process.argv.includes("--headline-fixture") ? "headline-fixture.mjs" : "capture.mjs";
  const child = spawn(process.execPath, [resolve(root, `tests/visual/reliability/${script}`), `https://127.0.0.1:${port}`,
    ...(process.argv.includes("--home") ? ["--home"] : [])],
    { cwd: root, env, stdio: "inherit" });
  process.exitCode = await new Promise((done, reject) => { child.once("exit", code => done(code ?? 1)); child.once("error", reject); });
} finally {
  server.kill("SIGTERM");
  await new Promise(done => { if (server.exitCode !== null) done(); else server.once("exit", done); });
  await certificate.close();
}
