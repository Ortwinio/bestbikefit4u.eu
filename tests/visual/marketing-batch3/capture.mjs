import { sendFixtureError } from "../lib/http-errors.mjs";
import { serveQaAsset } from "../final-sweep/assets.mjs";
import { build } from "esbuild";
import { createServer } from "node:http";
import { readFile, mkdir, copyFile, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";
import { inspectTheme } from "../dark-b/inspect.mjs";

const theme = process.env.VISUAL_THEME || "light";
const prefix = process.env.VISUAL_PREFIX || "";
const root = process.cwd();
const folder = resolve(root, "tests/visual/marketing-batch3");
const origin = process.env.VISUAL_DEV_ORIGIN || "http://localhost:3000";
const output = resolve(root, process.env.VISUAL_OUTPUT || "plans/redesign-canvas/code-renders");
let port = Number(process.env.VISUAL_PORT || 0);
const loginHtml = await (await fetch(`${origin}/nl/login`)).text();
const cssPaths = [...new Set([...loginHtml.matchAll(/href="([^" ]+\.css)"/g)].map((match) => match[1]))];
if (!cssPaths.length) throw new Error("No real Next CSS found on local login route");
const styles = (await Promise.all(cssPaths.map(async (path) => (await fetch(new URL(path, origin))).text()))).join("\n");
const htmlClass = loginHtml.match(/<html[^>]*class="([^"]+)"/)?.[1] || "";
const bodyClass = loginHtml.match(/<body[^>]*class="([^"]+)"/)?.[1] || "font-sans";
const aliases = {
  "convex/nextjs": "runtime.jsx", "server-only": "empty.js",
  "convex/react": "runtime.jsx", "@convex-dev/auth/react": "runtime.jsx",
  "next/navigation": "runtime.jsx", "@/i18n/request": "runtime.jsx",
  "next/link": "../account-batch1/link.jsx", "next/image": "../account-batch1/image.jsx",
  "@sentry/nextjs": "runtime.jsx",
};
const bundle = await build({
  absWorkingDir: root, entryPoints: [resolve(folder, "entry.jsx")], bundle: true,
  write: false, outdir: "/tmp/marketing-batch3-memory", format: "esm", platform: "browser",
  jsx: "automatic", sourcemap: "inline", logLevel: "error",
  define: {
    "process.env": "{}",
    "process.env.STRIPE_BILLING_ENABLED": '"false"',
    "process.env.NEXT_PUBLIC_STRIPE_BILLING_ENABLED": '"false"',
    "process.env.NODE_ENV": '"development"',
    "process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED": '"true"',
    "process.env.NEXT_PUBLIC_ENABLE_LOCALHOST_DEV_LOGIN": '"false"',
    "process.env.NEXT_PUBLIC_LOCALHOST_DEV_LOGIN_EMAIL": '""',
    "process.env.NEXT_PUBLIC_LOCALHOST_DEV_LOGIN_NAME": '""',
    "process.env.NEXT_PUBLIC_LOCALHOST_DEV_LOGIN_ROLE": '""',
  },
  plugins: [{ name: "isolated-visual-runtime", setup(builder) {
    builder.onResolve({ filter: /^@\/components\/seo\/JsonLd$/ }, () => ({ path: resolve(folder, "runtime.jsx") }));
    builder.onResolve({ filter: /^@\/lib\/guides\/backlog$/ }, () => ({ path: resolve(folder, "runtime.jsx") }));
    builder.onResolve({ filter: /^(server-only|convex\/nextjs)$/ }, (args) => ({ path: resolve(folder, aliases[args.path]) }));
    builder.onResolve({ filter: /^@sentry\/nextjs$/ }, () => ({ path: resolve(folder, "runtime.jsx") }));
    builder.onResolve({ filter: /^(convex\/react|@convex-dev\/auth\/react|next\/(navigation|link|image)|@\/i18n\/request)$/ }, (args) => ({ path: resolve(folder, aliases[args.path]) }));
  } }],
});
const script = bundle.outputFiles.find((file) => file.path.endsWith(".js")).contents;
const moduleCss = bundle.outputFiles.filter((file) => file.path.endsWith(".css")).map((file) => file.text).join("\n");
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, `http://127.0.0.1:${port}`).pathname;
    if (pathname === "/fixture.js") {
      response.setHeader("content-type", "text/javascript"); response.end(script); return;
    }
    if (pathname === "/fixture.css") {
      response.setHeader("content-type", "text/css"); response.end(styles + "\n" + moduleCss); return;
    }
    if (pathname.startsWith("/_next/")) {
      if (await serveQaAsset(request, response, {
        staticDir: resolve(root, ".next/static"),
        fallbackStaticDirs: [resolve(root, ".next/dev/static"), resolve(root, ".next-final-sweep/static")],
      })) return;
      response.statusCode = 404;
      response.end("Unknown build asset");
      return;
    }
    if (extname(pathname)) {
      const asset = resolve(root, "public", `.${decodeURIComponent(pathname)}`);
      if (!asset.startsWith(resolve(root, "public") + "/")) throw new Error("Invalid asset path");
      const types = { ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg" };
      response.setHeader("content-type", types[extname(pathname)] || "application/octet-stream");
      response.end(await readFile(asset)); return;
    }
    response.setHeader("content-type", "text/html");
    response.end(`<!doctype html><html lang="nl" class="${htmlClass}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Batch 2 isolated visual fixture</title><link rel="stylesheet" href="/fixture.css"></head><body class="${bodyClass}"><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>`);
  } catch (error) { sendFixtureError(response, error); }
});
await new Promise((done) => server.listen(port, "127.0.0.1", done));
port = server.address().port;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
const cases = [
  { name: "guides", path: "/guides" },
  { name: "guide-detail", path: "/guides/saddle-height-guide" },
  { name: "guide-leaf", path: "/guides/handlebar-width-and-hood-position-guide" },
  { name: "guide-hub", path: "/guides/bike-size-and-geometry" },
  { name: "blog-empty", path: "/blog" },
  { name: "blog-filled-fixture", path: "/blog", fixture: true },
  { name: "blog-filter-fixture", path: "/blog?category=comfort", fixture: true },
  { name: "blog-page2-fixture", path: "/blog?page=2", fixture: true },
  { name: "blog-article-fixture", path: "/blog/visual-article-1", fixture: true },
];
try {
  for (const locale of (process.env.VISUAL_LOCALES || "nl,en").split(",")) {
    for (const entry of cases.filter((item) => !process.env.VISUAL_FILTER || item.name.includes(process.env.VISUAL_FILTER))) {
      for (const width of [1440, 390]) {
        const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 1000 }, colorScheme: theme });
        await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.route("https://**/*", (route) => route.abort());
        const name = (prefix || "19-3-") + locale + "-" + entry.name + "-" + width;
        try {
          const response = await page.goto((entry.fixture ? "http://127.0.0.1:" + port : origin) + "/" + locale + entry.path, { waitUntil: "load", timeout: 90000 });
          if (entry.fixture) await page.waitForFunction(() => window.__visualReady);
          await page.locator("h1").waitFor();
          await page.waitForFunction(
            (value) => document.documentElement.classList.contains("dark") === (value === "dark"), theme,
          );
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(700);
          const consent = page.getByRole("button", { name: locale === "nl" ? "Alleen essentieel" : "Essential only", exact: true });
          if (await consent.isVisible()) {
            await consent.click();
            await consent.waitFor({ state: "hidden" });
          }
          await page.evaluate(async () => {
            for (const picture of document.images) picture.loading = "eager";
            await Promise.all([...document.images].map((picture) => picture.decode().catch(() => {})));
          });
          await inspectTheme(page, output, name);
          await page.screenshot({ path: resolve(output, name + ".png"), fullPage: true, style: "nextjs-portal { visibility: hidden; }" });
          if (width === 390) await page.screenshot({ path: resolve(output, name + "-viewport.png"), style: "nextjs-portal { visibility: hidden; }" });
          const metrics = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth > innerWidth,
            h1: [...document.querySelectorAll("h1")].map((node) => node.textContent),
            canonical: document.querySelector('link[rel="canonical"]')?.href,
            jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((node) => JSON.parse(node.textContent)),
            brokenImages: [...document.images].filter((picture) => !picture.complete || !picture.naturalWidth).map((picture) => picture.src),
            tocTargets: [...document.querySelectorAll('main nav a[href^="#"]')].map((link) => ({ href: link.getAttribute("href"), exists: !!document.getElementById(link.hash.slice(1)) })),
          }));
          if (metrics.tocTargets.some((target) => !target.exists)) throw new Error("Missing TOC target");
          if (response.status() !== 200 || metrics.overflow || metrics.h1.length !== 1 || metrics.brokenImages.length || errors.length) throw new Error("Page validation failed: " + JSON.stringify(metrics) + JSON.stringify(errors));
          results.push({ name, status: response.status(), ...metrics, errors });
        } catch (error) { results.push({ name, error: String(error), errors }); }
        finally { await page.close(); }
        console.log(JSON.stringify(results.at(-1)));
      }
    }
  }
  for (const board of ["Guides", "GuideDetail", "BlogIndex", "BlogArticle"]) {
    await copyFile(resolve(root, "plans/redesign-canvas/drafts/_renders/" + board + ".png"), resolve(output, "19-3-" + board + "-board.png"));
  }
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
await writeFile(resolve(output, (prefix || "19-3-") + "results.json"), JSON.stringify({ capturedAt: new Date().toISOString(), cssSha256: createHash("sha256").update(styles + moduleCss).digest("hex"), bundleSha256: createHash("sha256").update(script).digest("hex"), results }, null, 2) + "\n");
console.log(JSON.stringify({ cases: results.length, failed: results.filter((result) => result.error).map((result) => result.name) }));
if (results.some((result) => result.error)) process.exitCode = 1;
