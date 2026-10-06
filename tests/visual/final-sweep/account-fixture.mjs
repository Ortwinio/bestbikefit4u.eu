import { sendFixtureError } from "../lib/http-errors.mjs";
import { serveQaAsset } from "./assets.mjs";
import { build } from "esbuild";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { extendRiderRuntime } from "./rider-fixtures.mjs";
import { extendUsabilityAccountRuntime } from "../usability/extend-runtime.mjs";

/** Actual account components with deterministic read-only Convex/auth fixtures from batch 20. */
export async function prepareAccountFixtures({
  root = process.cwd(), origin, fetch: previewFetch = fetch, port = 0, bikeRuntime, paidAccessEnforced = false,
  staticDir = resolve(root, ".next-final-sweep/static"),
} = {}) {
  if (!origin) throw new Error("Account fixtures require the running production origin");
  const loginResponse = await previewFetch(new URL("/nl/login", origin));
  if (!loginResponse.ok) throw new Error(`Cannot load production CSS: login HTTP ${loginResponse.status}`);
  const loginHtml = await loginResponse.text();
  const cssPaths = [
    ...new Set([...loginHtml.matchAll(/href="([^" ]+\.css(?:\?[^" ]*)?)"/g)].map((match) => match[1])),
  ];
  if (!cssPaths.length) throw new Error("No production Next CSS found on /nl/login");
  const pressureStyles = loginHtml.match(/<style\b[^>]*\bid="pressure-display-styles"[^>]*>([\s\S]*?)<\/style>/)?.[1] ?? "";
  const styles = (
    await Promise.all(
      cssPaths.map(async (path) => {
        const response = await previewFetch(new URL(path, origin));
        if (!response.ok) throw new Error(`Production CSS returned ${response.status}: ${path}`);
        return response.text();
      }),
    )
  ).concat(pressureStyles).join("\n");
  const htmlClass = loginHtml.match(/<html[^>]*class="([^"]+)"/)?.[1] || "";
  const bodyClass = loginHtml.match(/<body[^>]*class="([^"]+)"/)?.[1] || "font-sans";
  const folder = resolve(root, "tests/visual/final-sweep");
  const batches = {
    profile: { folder: resolve(root, "tests/visual/account-batch1") },
    fit: { folder: resolve(root, "tests/visual/account-batch2") },
    tools: { folder: resolve(root, "tests/visual/account-batch4") },
    bikes: { folder, entry: "account-fixture-bikes-entry.jsx", runtime: "account-fixture-bikes-runtime.jsx" },
  };
  const link = resolve(root, "tests/visual/account-batch1/link.jsx");
  const image = resolve(root, "tests/visual/account-batch1/image.jsx");
  for (const [key, batch] of Object.entries(batches)) {
    const runtime = key === "bikes" && bikeRuntime
      ? resolve(root, bikeRuntime) : resolve(batch.folder, batch.runtime || "runtime.jsx");
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
        "process.env.PAID_ACCESS_ENFORCED": JSON.stringify(String(paidAccessEnforced)),
        "process.env.NEXT_PUBLIC_PAID_ACCESS_ENFORCED": JSON.stringify(String(paidAccessEnforced)),
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
            builder.onLoad({ filter: /account-batch1\/entry\.jsx$/ }, async ({ path }) => {
              const contents = await readFile(path, "utf8");
              return { loader: "jsx", resolveDir: batch.folder, contents:
                'import Welcome from "@/app/welcome/page";\nimport Score from "@/app/(dashboard)/profile/score/page";\nimport Advice from "@/app/(dashboard)/profile/advice/page";\n' +
                contents.replace('const content = ', 'const content = pathname === "/welcome" ? <Welcome /> : pathname === "/profile/score" ? await Score() : pathname === "/profile/advice" ? await Advice() : ')
                  .replace('const tree = ', 'const tree = pathname === "/welcome" ? content : ') };
            });
            builder.onLoad({ filter: /runtime\.jsx$/ }, async ({ path }) => {
              if (path !== runtime) return;
              let contents = extendRiderRuntime(await readFile(path, "utf8"), resolve(folder, "rider-fixtures.mjs"));
              contents = extendUsabilityAccountRuntime(contents, { root, batch: key });
              const queryFallback = 'if (!(name in values)) {';
              if (!contents.includes(queryFallback)) throw new Error(`Missing read-only query adapter in ${path}`);
              contents = `import { getAccess as fixtureAccess } from ${JSON.stringify(resolve(root, "shared/pricing/access.ts"))};\n`
                + contents.replace(queryFallback,
                  'if (name === "pricing/queries:getAccess" && !(name in values)) return fixtureAccess({ entitlements: [] }, args?.bikeId, { enforced: false, now: 1790985600000 });\n'
                  + queryFallback);
              if (/export (?:function|const) usePaginatedQuery\b/.test(contents)) {
                return { loader: "jsx", resolveDir: batch.folder, contents };
              }
              // A closed deletion dialog requests "skip". Never fabricate its destructive preview data.
              return { loader: "jsx", resolveDir: batch.folder, contents: contents + `
export function usePaginatedQuery(_reference, args) {
  if (args !== "skip") throw new Error("Paginated query is outside this read-only fixture coverage");
  return { results: [], status: "LoadingFirstPage", loadMore: () => {} };
}
` };
            });
            builder.onResolve(
              {
                filter:
                  /^(convex\/react|@convex-dev\/auth\/react|next\/navigation|@\/i18n\/request|@sentry\/nextjs)$/,
              },
              () => ({ path: runtime }),
            );
            builder.onResolve({ filter: /^server-only$/ }, () => ({
              path: resolve(root, "tests/visual/marketing-batch3/empty.js"),
            }));
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
    if (/^\/(?:profile(?:\/(?:score|advice))?|dashboard|login|welcome)$/.test(path)) return "profile";
    if (/^\/profile\/improve\/(body-measurements|flexibility|core-stability|comfort)$/.test(path)) return "profile";
    const calculatorRoutes = ["bike-fit", "saddle-height", "frame-size", "crank-length",
      "power-speed", "climb-planner", "ftp-wkg", "fuel-hydration"];
    if (calculatorRoutes.some((tool) => path === `/tools/${tool}`)) return "tools";
    if (/^\/(pressure-calculator|gearing|saddle-selector|shoe-cleat-fit|settings|feedback|app)$/.test(path)) {
      return "tools";
    }
    return null;
  }
  const server = createServer(async (request, response) => {
    try {
      if (await serveQaAsset(request, response, { staticDir })) return;
      const url = new URL(request.url, "http://127.0.0.1");
      const asset = url.pathname.match(/^\/__account-fixture\/(profile|fit|tools|bikes)\.(js|css)$/);
      if (asset) {
        const batch = batches[asset[1]];
        response.setHeader("content-type", asset[2] === "js" ? "text/javascript" : "text/css");
        response.end(asset[2] === "js" ? batch.script : batch.styles);
        return;
      }
      if (url.pathname.startsWith("/_next/")) {
        response.statusCode = 404;
        response.end("Unknown build asset");
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
      sendFixtureError(response, error);
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
      "Production global CSS/fonts plus bundled actual CSS Modules are used; only default filled states are covered.",
      "Feedback panel provider is mocked on account tool routes; " +
        "batch-20 overlay differences remain fixture limitations.",
    ],
  };
}
