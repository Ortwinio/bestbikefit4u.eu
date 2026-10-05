import { createServer } from "node:http";
import { build } from "esbuild";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const folder = resolve(root, "tests/visual/reliability");

export async function prepareSignedinFixtures({ origin, fetch: localFetch = fetch, signup = false }) {
  if (!["127.0.0.1", "localhost", "[::1]"].includes(new URL(origin).hostname)) throw new Error("Local production origin required");
  const response = await localFetch(`${origin}/nl/calculators/saddle-height`, { redirect: "error" });
  if (!response.ok) throw new Error(`Production CSS page returned ${response.status}`);
  const html = await response.text();
  const cssPaths = [...new Set([...html.matchAll(/href="([^" ]+\.css(?:\?[^" ]*)?)"/g)].map(match => match[1]))];
  if (!cssPaths.length) throw new Error("Production CSS not found; build candidate first");
  const css = await Promise.all(cssPaths.map(async path => {
    const url = new URL(path, origin);
    if (url.origin !== origin) throw new Error("External stylesheet not allowed");
    const stylesheet = await localFetch(url, { redirect: "error" });
    if (!stylesheet.ok) throw new Error(`CSS ${path}: ${stylesheet.status}`);
    return stylesheet.text();
  }));
  const bundle = await build({ absWorkingDir: root, entryPoints: [resolve(folder, signup ? "full-signup-entry.jsx" : "full-signedin-entry.jsx")], bundle: true,
    write: false, outdir: resolve(folder, ".full-signedin-memory"), format: "esm", platform: "browser", jsx: "automatic",
    logLevel: "error", define: { "process.env": "{}", "process.env.NODE_ENV": '"production"' },
    plugins: [{ name: "offline-profile-context", setup(builder) {
      builder.onResolve({ filter: /^(convex\/react|next\/navigation|@sentry\/nextjs)$/ },
        () => ({ path: resolve(folder, signup ? "full-signup-runtime.jsx" : "full-signedin-runtime.jsx") }));
      if (signup) builder.onResolve({ filter: /ThemeProvider$/ },
        () => ({ path: resolve(folder, "full-signup-runtime.jsx") }));
      builder.onResolve({ filter: /^next\/link$/ }, () => ({ path: resolve(root, "tests/visual/account-batch1/link.jsx") }));
      builder.onResolve({ filter: /^next\/image$/ }, () => ({ path: resolve(root, "tests/visual/account-batch1/image.jsx") }));
    } }],
  });
  const script = bundle.outputFiles.find(file => file.path.endsWith(".js")).contents;
  const styles = css.join("\n") + "\n" + bundle.outputFiles.filter(file => file.path.endsWith(".css")).map(file => file.text).join("\n");
  const htmlClass = html.match(/<html[^>]*class="([^"]+)"/)?.[1] ?? "";
  const bodyClass = html.match(/<body[^>]*class="([^"]+)"/)?.[1] ?? "";
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      if (url.pathname === "/fixture.js") { response.setHeader("Content-Type", "text/javascript"); response.end(script); return; }
      if (url.pathname === "/fixture.css") { response.setHeader("Content-Type", "text/css"); response.end(styles); return; }
      if (url.pathname.startsWith("/_next/static/")) {
        const asset = await localFetch(new URL(url.pathname, origin), { redirect: "error" });
        response.statusCode = asset.status;
        response.setHeader("Content-Type", asset.headers.get("Content-Type") ?? "application/octet-stream");
        response.end(Buffer.from(await asset.arrayBuffer())); return;
      }
      if (extname(url.pathname)) {
        const path = resolve(root, "public", `.${decodeURIComponent(url.pathname)}`);
        if (!path.startsWith(resolve(root, "public") + "/")) throw new Error("Invalid asset path");
        const types = { ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png", ".webp": "image/webp" };
        response.setHeader("Content-Type", types[extname(path)] ?? "application/octet-stream");
        response.end(await readFile(path)); return;
      }
      response.setHeader("Content-Type", "text/html");
      response.end(`<!doctype html><html lang="${url.pathname.startsWith("/nl/") ? "nl" : "en"}" class="${htmlClass}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Signed-in calculator fixture</title><link rel="stylesheet" href="/fixture.css"></head><body class="${bodyClass}"><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>`);
    } catch (error) { response.statusCode = 500; response.end(String(error)); }
  });
  await new Promise(done => server.listen(0, "127.0.0.1", done));
  return { origin: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(done => server.close(done)) };
}
