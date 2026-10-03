import { cp, mkdir, readFile, writeFile, symlink } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import https from "node:https";
import { copyBuildInputs, fingerprint } from "../../../tests/visual/final-sweep/production.mjs";
import { createPreviewCertificate } from "../../../tests/visual/final-sweep/tls.mjs";

const phase = process.argv[2];
if (!["before", "after"].includes(phase)) throw new Error("Expected before or after");
process.env.NEXT_PUBLIC_CONVEX_URL ||= "https://seo-test.convex.cloud";
const outputDir = resolve(`plans/seo-crawl-fixes/audit/local-${phase}`);
const root = process.cwd();
const source = phase === "before" ? (process.argv[3] ?? "/private/tmp/bbf-final-sweep-0ebf91d9f65960f7") : root;
const snapshot = `/private/tmp/bbf-seo-metadata-${phase}`;
const env = { ...process.env, NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1" };
await mkdir(snapshot, { recursive: true });
await mkdir(outputDir, { recursive: true });
if (process.env.SEO_SKIP_BUILD !== "1") {
await copyBuildInputs(source, snapshot);
await cp(resolve(root, "scripts"), resolve(snapshot, "scripts"), { recursive: true });
await symlink(resolve(root, "node_modules"), resolve(snapshot, "node_modules"), "dir")
  .catch(error => { if (error.code !== "EEXIST") throw error; });
const configPath = resolve(snapshot, "next.config.ts");
const config = (await readFile(configPath, "utf8")).replace('  distDir: ".next-final-sweep",\n', "");
await writeFile(configPath, config.replace("const nextConfig: NextConfig = {",
  'const nextConfig: NextConfig = {\n  distDir: ".next-final-sweep",'));
const log = createWriteStream(resolve(outputDir, "build.log"));
const build = spawn(process.execPath, [resolve(root, "node_modules/next/dist/bin/next"), "build", "--webpack"],
  { cwd: snapshot, env, stdio: ["ignore", "pipe", "pipe"] });
build.stdout.pipe(log); build.stderr.pipe(log);
await new Promise((done, reject) => {
  build.once("error", reject);
  build.once("exit", code => code === 0 ? done() : reject(new Error(`Build failed: ${code}; ${outputDir}/build.log`)));
});
}
const sourceHash = await fingerprint(snapshot, env);
const certificate = await createPreviewCertificate();
const origin = "https://127.0.0.1:4391";
async function fetchPreview(url, options = {}, redirects = 0) {
  const response = await new Promise((done, reject) => {
    const request = https.get(url, { ca: certificate.cert, headers: options.headers }, incoming => {
      const body = new Promise((resolveBody, rejectBody) => {
        const chunks = [];
        incoming.on("data", chunk => chunks.push(chunk));
        incoming.on("error", rejectBody);
        incoming.on("end", () => resolveBody(Buffer.concat(chunks).toString("utf8")));
      });
      const headers = new Headers();
      for (const [name, value] of Object.entries(incoming.headers)) {
        if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(", ") : value);
      }
      done({ status: incoming.statusCode, headers, text: () => body });
    });
    request.on("error", reject);
  });
  if ([301, 302, 307, 308].includes(response.status) && options.redirect !== "manual") {
    if (redirects >= 5) throw new Error("Redirect loop");
    await response.text();
    return fetchPreview(new URL(response.headers.get("location"), url), options, redirects + 1);
  }
  return response;
}
const serverLog = createWriteStream(resolve(outputDir, "server.log"));
const server = spawn(process.execPath, [resolve(root, "tests/visual/final-sweep/server.mjs"),
  snapshot, "4391", certificate.keyPath, certificate.certPath], { cwd: snapshot, env, stdio: ["ignore", "pipe", "pipe"] });
server.stdout.pipe(serverLog); server.stderr.pipe(serverLog);
await new Promise((done, reject) => {
  server.once("error", reject);
  server.once("exit", code => reject(new Error(`Server exited: ${code}`)));
  server.stdout.on("data", data => { if (String(data).includes("server listening")) done(); });
});
const production = { origin, fetch: fetchPreview, sourceHash, close: async () => {
  server.kill("SIGTERM");
  await new Promise(done => server.once("exit", done));
} };
const rows = [];
const routes = [];
try {
  for (const path of ["/en/guides/fit-science", "/nl/guides/saddle-height-guide"]) {
    for (const userAgent of ["Googlebot", "Screaming Frog SEO Spider", "GPTBot", "ClaudeBot", "Mozilla/5.0 Chrome/130.0.0.0"]) {
      for (let iteration = 0; iteration < 6; iteration += 1) {
        const start = performance.now();
        const response = await production.fetch(`${production.origin}${path}`, { headers: { "user-agent": userAgent } });
        const headersMs = performance.now() - start;
        const html = await response.text();
        const head = html.slice(0, html.indexOf("</head>"));
        const tags = {
          title: (head.match(/<title[ >]/g) ?? []).length,
          description: (head.match(/<meta name="description"/g) ?? []).length,
          canonical: (head.match(/<link rel="canonical"/g) ?? []).length,
          hreflang: (head.match(/<link rel="alternate" hrefLang=/gi) ?? []).length,
        };
        rows.push({ path, userAgent, iteration, warmup: iteration === 0, status: response.status, headersMs, tags });
      }
    }
  }
  if (phase === "after") {
    for (const path of ["/en/bikefitting?src=header", "/nl/bike-fitting?src=header"]) {
      const response = await production.fetch(`${production.origin}${path}`, { redirect: "manual" });
      routes.push({ path, status: response.status, location: response.headers.get("location") });
      await response.text();
    }
    for (const path of ["/en/bike-fitting", "/nl/bikefitting", "/en/tire-pressure/75kg-road-bike", "/nl/bandenspanning/75kg-racefiets"]) {
      const response = await production.fetch(`${production.origin}${path}`, { headers: { "user-agent": "GPTBot" } });
      const html = await response.text();
      const head = html.slice(0, html.indexOf("</head>"));
      routes.push({ path, status: response.status,
        alternates: head.match(/<link rel="(?:canonical|alternate)"[^>]+>/g),
        brokenSwitchLinks: /href="\/(?:en\/bikefitting|nl\/bike-fitting)(?:["?])/.test(html) });
    }
  }
  await writeFile(resolve(`plans/seo-crawl-fixes/audit/S1-${phase}.json`), JSON.stringify({
    phase, sourceHash: production.sourceHash, measurement: "fetch response-header latency, local HTTPS; first request per UA/path excluded from warm statistics",
    rows, routes,
  }, null, 2) + "\n");
  console.log(JSON.stringify({ phase, requests: rows.length, missingHead: rows.filter(row =>
    row.tags.title !== 1 || row.tags.description !== 1 || row.tags.canonical !== 1 || row.tags.hreflang !== 3).length }));
} finally {
  await production.close();
}
