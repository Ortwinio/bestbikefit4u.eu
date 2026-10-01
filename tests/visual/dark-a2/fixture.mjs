import { build } from "esbuild";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";

export async function prepareAccountFixtures({ root = process.cwd(), origin, port = 0 } = {}) {
  if (!origin) throw new Error("Account fixtures require the running production origin");
  const loginResponse = await fetch(new URL("/nl/login", origin));
  if (!loginResponse.ok) throw new Error(`Cannot load production CSS: login HTTP ${loginResponse.status}`);
  const loginHtml = await loginResponse.text();
  const cssPaths = [
    ...new Set([...loginHtml.matchAll(/href="([^" ]+\.css(?:\?[^" ]*)?)"/g)].map((match) => match[1])),
  ];
  if (!cssPaths.length) throw new Error("No production Next CSS found on /nl/login");
  const styles = (
    await Promise.all(
      cssPaths.map(async (path) => {
        const response = await fetch(new URL(path, origin));
        if (!response.ok) throw new Error(`Production CSS returned ${response.status}: ${path}`);
        return response.text();
      }),
    )
  ).join("\n");
  const htmlClass = loginHtml.match(/<html[^>]*class="([^"]+)"/)?.[1] || "";
  const bodyClass = loginHtml.match(/<body[^>]*class="([^"]+)"/)?.[1] || "font-sans";
  const folder = resolve(root, "tests/visual/final-sweep");
  const batches = {
    bikes: { folder, entry: "account-fixture-bikes-entry.jsx",
      runtime: resolve(root, "tests/visual/dark-a2/runtime.jsx") },
  };
  const link = resolve(root, "tests/visual/account-batch1/link.jsx");
  const image = resolve(root, "tests/visual/account-batch1/image.jsx");
  for (const [key, batch] of Object.entries(batches)) {
    const runtime = resolve(batch.folder, batch.runtime || "runtime.jsx");
    const bundle = await build({
      absWorkingDir: root,
      entryPoints: [resolve(batch.folder, batch.entry || "entry.jsx")],
      bundle: true,
      write: false,
      outdir: resolve(folder, `.memory-${key}`),
      format: "esm",
      platform: "browser",
      jsx: "automatic",
      logLevel: "error",
      define: {
        "process.env": "{}",
        "process.env.NODE_ENV": '"production"',
        "process.env.STRIPE_BILLING_ENABLED": '"false"',
        "process.env.NEXT_PUBLIC_STRIPE_BILLING_ENABLED": '"false"',
        "process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED": '"true"',
        "process.env.NEXT_PUBLIC_ENABLE_LOCALHOST_DEV_LOGIN": '"false"',
        "process.env.NEXT_PUBLIC_LOCALHOST_DEV_LOGIN_EMAIL": '""',
        "process.env.NEXT_PUBLIC_LOCALHOST_DEV_LOGIN_NAME": '""',
        "process.env.NEXT_PUBLIC_LOCALHOST_DEV_LOGIN_ROLE": '""',
      },
      plugins: [
        {
          name: "final-account-fixture",
          setup(builder) {
            builder.onResolve(
              {
                filter:
                  /^(convex\/react|@convex-dev\/auth\/react|next\/navigation|@\/i18n\/request|@sentry\/nextjs)$/,
              },
              () => ({ path: runtime }),
            );
            builder.onResolve({ filter: /^next\/link$/ }, () => ({ path: link }));
            builder.onResolve({ filter: /^next\/image$/ }, () => ({ path: image }));
            if (key === "tools") {
              builder.onResolve({ filter: /^@\/components\/feedback\/FeedbackPanelProvider$/ }, () => ({
                path: runtime,
              }));
            }
          },
        },
      ],
    });
    batch.script = bundle.outputFiles.find((file) => file.path.endsWith(".js")).contents;
    batch.styles =
      styles +
      "\n" +
      bundle.outputFiles
        .filter((file) => file.path.endsWith(".css"))
        .map((file) => file.text)
        .join("\n");
  }
  function batchFor(pathname) {
    const path = pathname.replace(/^\/(nl|en)(?=\/|$)/, "");
    const bikesPattern =
      /^\/bikes(?:\/(?:new(?:\/manual)?|import\/passport|compare-fit|[^/]+(?:\/edit)?))?$/;
    if (bikesPattern.test(path)) {
      return "bikes";
    }
    if (/^\/(?:fit(?:\/(?:how-it-works|[^/]+\/(?:questionnaire|results)))?|fit-history)$/.test(path)) return "fit";
    if (/^\/(?:profile|dashboard|login)$/.test(path)) return "profile";
    if (/^\/profile\/improve\/(body-measurements|flexibility|core-stability|comfort)$/.test(path)) return "profile";
    if (/^\/(pressure-calculator|gearing|saddle-selector|shoe-cleat-fit|settings|feedback|app)$/.test(path)) {
      return "tools";
    }
    return null;
  }
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://127.0.0.1");
      const asset = url.pathname.match(/^\/__account-fixture\/(profile|fit|tools|bikes)\.(js|css)$/);
      if (asset) {
        const batch = batches[asset[1]];
        response.setHeader("content-type", asset[2] === "js" ? "text/javascript" : "text/css");
        response.end(asset[2] === "js" ? batch.script : batch.styles);
        return;
      }
      if (url.pathname.startsWith("/_next/")) {
        const remote = await fetch(new URL(url.pathname + url.search, origin));
        response.statusCode = remote.status;
        response.setHeader("content-type", remote.headers.get("content-type") || "application/octet-stream");
        response.end(Buffer.from(await remote.arrayBuffer()));
        return;
      }
      if (extname(url.pathname)) {
        const file = resolve(root, "public", `.${decodeURIComponent(url.pathname)}`);
        if (!file.startsWith(resolve(root, "public") + "/")) throw new Error("Invalid asset path");
        const types = {
          ".svg": "image/svg+xml",
          ".png": "image/png",
          ".webp": "image/webp",
          ".jpg": "image/jpeg",
        };
        response.setHeader("content-type", types[extname(file)] || "application/octet-stream");
        response.end(await readFile(file));
        return;
      }
      const batch = batchFor(url.pathname);
      if (!batch) {
        response.statusCode = 404;
        response.end("Unknown account fixture route");
        return;
      }
      const locale = url.pathname.startsWith("/en/") ? "en" : "nl";
      response.setHeader("content-type", "text/html; charset=utf-8");
      response.setHeader("x-qa-fixture", "account-read-only");
      response.end(`<!doctype html><html lang="${locale}" class="${htmlClass}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Account QA fixture</title><link rel="stylesheet" href="/__account-fixture/${batch}.css">
</head><body class="${bodyClass}"><div id="root"></div>
<script type="module" src="/__account-fixture/${batch}.js"></script></body></html>`);
    } catch (error) {
      response.statusCode = error.code === "ENOENT" ? 404 : 500;
      response.end(String(error));
    }
  });
  await new Promise((done, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", done);
  });
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((done, reject) => server.close((error) => (error ? reject(error) : done()))),
    limitations: [
      "Account HTTP status belongs to the fixture server; " +
        "authentication, middleware and server metadata are not exercised.",
      "Actual account pages and dashboard shell use deterministic batch-20 Convex/auth fixtures; mutations are mocked.",
      "Next Link/Image use anchor/img adapters; image optimization and Next navigation behavior are not exercised.",
      "Current Next global CSS/fonts plus bundled actual CSS Modules are used; read-only bike states are exercised.",
      "Feedback panel provider is mocked on account tool routes; " +
        "batch-20 overlay differences remain fixture limitations.",
    ],
  };
}
