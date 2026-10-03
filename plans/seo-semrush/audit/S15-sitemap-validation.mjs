import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import { writeFile } from "node:fs/promises";
import { createPreviewCertificate } from "../../../tests/visual/final-sweep/tls.mjs";

const certificate = await createPreviewCertificate();
const probe = createServer();
probe.listen(0, "127.0.0.1");
await once(probe, "listening");
const port = probe.address().port;
await new Promise(done => probe.close(done));
const env = {
  ...process.env,
  NEXT_PUBLIC_CONVEX_URL: "http://127.0.0.1:9",
  NEXT_PUBLIC_CONVEX_SITE_URL: "http://127.0.0.1:9",
};
const server = spawn(process.execPath, ["scripts/seo-crawl/server.mjs", String(port),
  certificate.keyPath, certificate.certPath], { env, stdio: ["ignore", "pipe", "inherit"] });
try {
  await new Promise((done, reject) => {
    const timer = setTimeout(() => reject(new Error("Preview startup timed out")), 60000);
    server.once("error", error => { clearTimeout(timer); reject(error); });
    server.once("exit", code => { clearTimeout(timer); reject(new Error(`Preview exited ${code}`)); });
    server.stdout.on("data", data => {
      if (String(data).includes("HTTPS server ready")) { clearTimeout(timer); done(); }
    });
  });
  const validator = spawn("npm", ["run", "seo:validate-sitemaps"], {
    env: { ...env, SITEMAP_BASE_URL: `https://127.0.0.1:${port}`, NODE_EXTRA_CA_CERTS: certificate.certPath },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  for (const stream of [validator.stdout, validator.stderr]) stream.on("data", data => { output += data; });
  const [code] = await once(validator, "close");
  await writeFile("plans/seo-semrush/audit/S15-sitemap-validation.log", output);
  process.stdout.write(output);
  if (code !== 0) throw new Error(`Sitemap validator exited ${code}`);
} finally {
  const closed = once(server, "exit");
  server.kill("SIGTERM");
  await closed;
  await certificate.close();
}
