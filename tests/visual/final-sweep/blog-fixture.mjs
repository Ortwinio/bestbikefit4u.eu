import { serveQaAsset } from "./assets.mjs";
import { build } from "esbuild";
import { createServer } from "node:http";
import { resolve, extname } from "node:path";

const escapeAttribute = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");

/** Runs the existing article components with the established CMS fixture, without editing app files. */
export async function prepareBlogFixture({ root, origin, fetch: previewFetch = fetch, port = 0 }) {
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
    "@/lib/guides/backlog": "runtime.jsx",
  };
  const bundle = await build({
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
    plugins: [{
      name: "final-sweep-blog-runtime",
      setup(builder) {
        builder.onResolve({ filter: /.*/ }, ({ path }) => {
          if (Object.hasOwn(aliases, path)) return { path: resolve(folder, aliases[path]) };
        });
      },
    }],
  });
  const script = bundle.outputFiles.find((file) => file.path.endsWith(".js"))?.contents;
  if (!script) throw new Error("Blog fixture bundle did not produce JavaScript");
  const css = styles + "\n" + bundle.outputFiles.filter((file) => file.path.endsWith(".css"))
    .map((file) => file.text).join("\n");
  const server = createServer(async (request, response) => {
    try {
      if (await serveQaAsset(request, response, { staticDir: resolve(root, ".next-final-sweep/static") })) return;
      const url = new URL(request.url, "http://127.0.0.1");
      const pathname = url.pathname;
      if (pathname === "/fixture.js" || pathname === "/fixture.css") {
        response.setHeader("content-type", pathname.endsWith(".js") ? "text/javascript" : "text/css");
        response.end(pathname.endsWith(".js") ? script : css);
        return;
      }
      if (pathname.startsWith("/_next/") || extname(pathname)) {
        const remote = await previewFetch(new URL(pathname + url.search, origin));
        response.statusCode = remote.status;
        response.setHeader("content-type", remote.headers.get("content-type") || "application/octet-stream");
        response.end(Buffer.from(await remote.arrayBuffer()));
        return;
      }
      if (!/^\/(nl|en)\/blog(?:\/visual-article-\d+)?\/?$/.test(pathname)) {
        response.statusCode = 404;
        response.end("Unknown blog fixture route");
        return;
      }
      const locale = pathname.startsWith("/en/") ? "en" : "nl";
      response.setHeader("content-type", "text/html; charset=utf-8");
      // No canonical/hreflang is fabricated: generateMetadata is outside this browser fixture.
      response.end(`<!doctype html><html lang="${locale}" class="${htmlClass}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Final sweep — blog fixture</title><link rel="stylesheet" href="/fixture.css"></head>
<body class="${bodyClass}"><div id="root"></div>
<script type="module" src="/fixture.js"></script></body></html>`);
    } catch (error) {
      response.statusCode = 500;
      response.end(String(error));
    }
  });
  await new Promise((done, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", done);
  });
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
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
