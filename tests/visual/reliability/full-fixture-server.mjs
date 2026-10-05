import { build } from "esbuild";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { serveQaAsset } from "../final-sweep/assets.mjs";

export async function prepareReliabilityFixtures({ origin, fetch: previewFetch = fetch }) {
  if (!["127.0.0.1", "localhost", "[::1]"].includes(new URL(origin).hostname)) throw new Error("Local production origin required");
  const root = fileURLToPath(new URL("../../../", import.meta.url));
  const page = await previewFetch(new URL("/nl/login", origin));
  if (!page.ok) throw new Error(`Production login: ${page.status}`);
  const html = await page.text();
  const paths = [...new Set([...html.matchAll(/href="([^" ]+\.css(?:\?[^" ]*)?)"/g)].map(match => match[1]))];
  if (!paths.length) throw new Error("Production CSS missing");
  const css = await Promise.all(paths.map(async path => {
    const response = await previewFetch(new URL(path, origin));
    if (!response.ok) throw new Error(`CSS unavailable: ${path}`);
    return response.text();
  }));
  const bundle = await build({
    absWorkingDir: root,
    entryPoints: [resolve(root, "tests/visual/reliability/full-fixture-entry.jsx")],
    bundle: true, write: false, outdir: resolve(root, "tests/visual/reliability/.memory-full-fixture"),
    format: "esm", platform: "browser", jsx: "automatic", logLevel: "error",
    define: { "process.env.NODE_ENV": '"production"' },
    plugins: [{ name: "offline-reliability", setup(builder) {
      builder.onResolve({ filter: /^next\/link$/ }, () => ({ path: resolve(root, "tests/visual/account-batch1/link.jsx") }));
      builder.onResolve({ filter: /^next\/navigation$/ }, () => ({ path: "navigation", namespace: "fixture" }));
      builder.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({ contents: `
        export const usePathname = () => '/' + (new URLSearchParams(location.search).get('locale') || 'en') + '/tools/saddle-height';
        export const useRouter = () => ({push(){},replace(){}});
        export const useSearchParams = () => new URLSearchParams(location.search);
      `, loader: "js" }));
    } }],
  });
  const script = bundle.outputFiles.find(file => file.path.endsWith(".js")).contents;
  const styles = css.join("\n") + "\n" + bundle.outputFiles.filter(file => file.path.endsWith(".css")).map(file => file.text).join("\n");
  const htmlClass = html.match(/<html[^>]*class="([^"]+)"/)?.[1] ?? "";
  const bodyClass = html.match(/<body[^>]*class="([^"]+)"/)?.[1] ?? "font-sans";
  const server = createServer(async (request, response) => {
    try {
      if (await serveQaAsset(request, response, { staticDir: resolve(root, ".next/static") })) return;
      const url = new URL(request.url, "http://127.0.0.1");
      if (url.pathname === "/fixture.js" || url.pathname === "/fixture.css") {
        response.setHeader("content-type", url.pathname.endsWith(".js") ? "text/javascript" : "text/css");
        response.end(url.pathname.endsWith(".js") ? script : styles);
        return;
      }
      if (url.pathname !== "/") { response.statusCode = 404; response.end(); return; }
      const locale = url.searchParams.get("locale") === "nl" ? "nl" : "en";
      const dark = url.searchParams.get("theme") === "dark";
      response.setHeader("content-type", "text/html; charset=utf-8");
      response.end(`<!doctype html><html lang="${locale}" class="${htmlClass} ${dark ? "dark" : ""}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline reliability fixture</title><link rel="stylesheet" href="/fixture.css"></head><body class="${bodyClass}"><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>`);
    } catch (error) { response.statusCode = 500; response.end(String(error)); }
  });
  await new Promise((done, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", done); });
  return { origin: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(done => server.close(done)) };
}
