import { sendFixtureError } from "../lib/http-errors.mjs";
import { guideBacklogFixture } from "./guide-backlog-fixture.mjs";
import { serveQaAsset } from "./assets.mjs";
import { readFile } from "node:fs/promises";
import { build } from "esbuild";
import { createServer } from "node:http";
import { resolve, extname } from "node:path";
import { Worker } from "node:worker_threads";

const escapeAttribute = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");

/** Runs the existing article components with the established CMS fixture, without editing app files. */
export async function prepareBlogFixture({ root, origin, fetch: previewFetch = fetch, port = 0, staticDir = resolve(root, ".next-final-sweep/static"), serverRenderedContent = false }) {
  const folder = resolve(root, "tests/visual/marketing-batch3");
  const login = await previewFetch(new URL("/nl/login", origin));
  if (!login.ok) throw new Error(`Cannot load production styles: login returned ${login.status}`);
  const loginHtml = await login.text();
  const cssPaths = [...new Set([...loginHtml.matchAll(/href="([^" ]+\.css(?:\?[^" ]*)?)"/g)]
    .map((match) => match[1]))];
  if (!cssPaths.length) throw new Error("No Next CSS found for the blog visual fixture");
  const styles = (await Promise.all(cssPaths.map(async (path) => {
    const response = await previewFetch(new URL(path, origin));
    if (!response.ok) throw new Error(`Production stylesheet returned ${response.status}: ${path}`);
    return response.text();
  }))).join("\n");
  const htmlClass = escapeAttribute(loginHtml.match(/<html[^>]*class="([^"]+)"/)?.[1] || "");
  const bodyClass = escapeAttribute(loginHtml.match(/<body[^>]*class="([^"]+)"/)?.[1] || "font-sans");
  const aliases = {
    "convex/nextjs": "runtime.jsx",
    "server-only": "empty.js",
    "convex/react": "runtime.jsx",
    "@convex-dev/auth/react": "runtime.jsx",
    "next/navigation": "runtime.jsx",
    "@/i18n/request": "runtime.jsx",
    "next/link": "../account-batch1/link.jsx",
    "next/image": "../account-batch1/image.jsx",
    "@sentry/nextjs": "runtime.jsx",
    "@/components/seo/JsonLd": "runtime.jsx",
  };
  const buildOptions = {
    absWorkingDir: root,
    entryPoints: [resolve(folder, "entry.jsx")],
    bundle: true,
    write: false,
    outdir: "/tmp/final-sweep-blog-memory",
    format: "esm",
    platform: "browser",
    jsx: "automatic",
    sourcemap: "inline",
    logLevel: "error",
    define: {
      "process.env": "{}",
      "process.env.NODE_ENV": '"production"',
      "process.env.STRIPE_BILLING_ENABLED": '"false"',
      "process.env.NEXT_PUBLIC_STRIPE_BILLING_ENABLED": '"false"',
      "process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED": '"true"',
      "process.env.NEXT_PUBLIC_ENABLE_LOCALHOST_DEV_LOGIN": '"false"',
    },
    plugins: [guideBacklogFixture(root), {
      name: "final-sweep-blog-runtime",
      setup(builder) {
        builder.onResolve({ filter: /^@convex-dev\/auth\/nextjs\/server$/ }, () => ({
          path: "anonymous-auth", namespace: "blog-fixture",
        }));
        builder.onLoad({ filter: /.*/, namespace: "blog-fixture" }, () => ({
          contents: "export const convexAuthNextjsToken = async () => undefined;", loader: "js",
        }));
        builder.onResolve({ filter: /.*/ }, ({ path }) => {
          if (Object.hasOwn(aliases, path)) return { path: resolve(folder, aliases[path]) };
        });
      },
    }],
  };
  const renderedArticles = {};
  if (serverRenderedContent) {
    for (const locale of ["nl", "en"]) {
      const location = JSON.stringify({ pathname: `/${locale}/blog/visual-article-1`, search: "" });
      const serverBundle = await build({ ...buildOptions, platform: "node", sourcemap: false,
        plugins: [{ name: "blog-fixture-server-render", setup(builder) {
          builder.onLoad({ filter: /marketing-batch3\/entry\.jsx$/ }, async ({ path }) => ({ loader: "jsx", resolveDir: folder,
            contents: (await readFile(path, "utf8"))
              .replace('import { createRoot } from "react-dom/client";', 'import { renderToString } from "react-dom/server.browser";')
              .replaceAll("window.location", `(${location})`)
              .replace("document.documentElement.lang = locale;", "")
              .replace('createRoot(document.getElementById("root")).render(', 'export const serverHTML = renderToString(')
              .replace("window.__visualReady = true;", ""),
          }));
          builder.onLoad({ filter: /marketing-batch3\/runtime\.jsx$/ }, async ({ path }) => ({ loader: "jsx", resolveDir: folder,
            contents: (await readFile(path, "utf8")).replaceAll("window.location", `(${location})`),
          }));
        } }, ...buildOptions.plugins],
      });
      const serverScript = serverBundle.outputFiles.find(file => file.path.endsWith(".js"));
      if (!serverScript) throw new Error("Blog fixture server bundle missing");
      const worker = new Worker(`
        const { parentPort, workerData } = require('node:worker_threads');
        import(workerData).then(rendered => parentPort.postMessage({ html: rendered.serverHTML }),
          error => parentPort.postMessage({ error: error.message }));
      `, { eval: true, workerData: `data:text/javascript;base64,${Buffer.from(serverScript.contents).toString("base64")}`, execArgv: [] });
      let timeout;
      try {
        renderedArticles[locale] = await new Promise((done, reject) => {
          timeout = setTimeout(() => reject(new Error("Blog fixture server rendering timed out")), 30000);
          worker.once("error", error => reject(new Error(`Blog fixture server rendering failed: ${error.message}`)));
          worker.once("exit", code => reject(new Error(`Blog fixture renderer exited before producing HTML: ${code}`)));
          worker.once("message", result => {
            if (result.error) reject(new Error(`Blog fixture server rendering failed: ${result.error}`));
            else if (!result.html?.includes("<main")) reject(new Error("Blog fixture server HTML missing article tree"));
            else done(result.html);
          });
        });
      } finally {
        clearTimeout(timeout);
        await worker.terminate();
      }
    }
  }
  const bundle = await build({ ...buildOptions, plugins: [
    ...(serverRenderedContent ? [{ name: "hydrate-blog-fixture", setup(builder) {
      builder.onLoad({ filter: /marketing-batch3\/entry\.jsx$/ }, async ({ path }) => ({ loader: "jsx", resolveDir: folder,
        contents: (await readFile(path, "utf8"))
          .replace('import { createRoot } from "react-dom/client";', 'import { createRoot, hydrateRoot } from "react-dom/client";')
          .replace('createRoot(document.getElementById("root")).render(', 'const renderFixture = tree => document.getElementById("root").hasChildNodes() ? hydrateRoot(document.getElementById("root"), tree) : createRoot(document.getElementById("root")).render(tree);\nrenderFixture('),
      }));
    } }] : []), ...buildOptions.plugins,
  ] });
  const script = bundle.outputFiles.find((file) => file.path.endsWith(".js"))?.contents;
  if (!script) throw new Error("Blog fixture bundle did not produce JavaScript");
  const css = styles + "\n" + bundle.outputFiles.filter((file) => file.path.endsWith(".css"))
    .map((file) => file.text).join("\n");
  const server = createServer(async (request, response) => {
    try {
      if (await serveQaAsset(request, response, { staticDir })) return;
      const url = new URL(request.url, "http://127.0.0.1");
      const pathname = url.pathname;
      if (pathname === "/fixture.js" || pathname === "/fixture.css") {
        response.setHeader("content-type", pathname.endsWith(".js") ? "text/javascript" : "text/css");
        response.end(pathname.endsWith(".js") ? script : css);
        return;
      }
      if (pathname.startsWith("/_next/")) {
        response.statusCode = 404;
        response.end("Unknown build asset");
        return;
      }
      if (extname(pathname)) {
        const base = resolve(root, "public");
        const file = resolve(base, `.${decodeURIComponent(pathname)}`);
        if (!file.startsWith(base + "/")) throw new Error("Invalid asset path");
        const types = { ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp",
          ".jpg": "image/jpeg", ".woff2": "font/woff2" };
        response.setHeader("content-type", types[extname(file)] || "application/octet-stream");
        response.end(await readFile(file));
        return;
      }
      if (!/^\/(nl|en)\/blog(?:\/visual-article-\d+)?\/?$/.test(pathname)) {
        response.statusCode = 404;
        response.end("Unknown blog fixture route");
        return;
      }
      const locale = pathname.startsWith("/en/") ? "en" : "nl";
      const serverHTML = pathname.endsWith("/visual-article-1") ? renderedArticles[locale] ?? "" : "";
      response.setHeader("content-type", "text/html; charset=utf-8");
      response.setHeader("x-qa-fixture", serverHTML ? "blog-server-rendered-presentation" : "blog-client-rendered-presentation");
      // No canonical/hreflang is fabricated: generateMetadata is outside this browser fixture.
      response.end(`<!doctype html><html lang="${locale}" class="${htmlClass}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Final sweep — blog fixture</title><link rel="stylesheet" href="/fixture.css"></head>
<body class="${bodyClass}"><div id="root">${serverHTML}</div>
<script type="module" src="/fixture.js"></script></body></html>`);
    } catch (error) {
      sendFixtureError(response, error);
    }
  });
  await new Promise((done, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", done);
  });
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    serverRenderedContent: Boolean(serverRenderedContent),
    close: () => new Promise((done, reject) => {
      server.close((error) => error ? reject(error) : done());
      server.closeAllConnections();
    }),
    limitations: [
      "Blog detail uses existing visual-article-1 CMS fixture; no published production article was available.",
      "HTTP 200 is the fixture server response, not proof of production CMS lookup or routing.",
      "Next generateMetadata is not run: canonical/hreflang and production article title remain unverified.",
      "Existing JsonLd adapter renders actual page schema without the production server nonce wrapper.",
      "Header, Footer, and article components use production CSS; Next Image/Link use existing visual adapters.",
    ],
  };
}
