import { build } from "esbuild";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";
import { inspectContrast, inspectGaugeContrast } from "./contrast.mjs";

const root = process.cwd();
const folder = resolve(root, "tests/visual/account-dark-c");
const origin = process.env.VISUAL_DEV_ORIGIN || "http://localhost:3000";
const output = resolve(root, "plans/redesign-canvas/code-renders");
const port = Number(process.env.VISUAL_PORT || 4322);
const loginHtml = await (await fetch(`${origin}/nl/login`)).text();
const cssPaths = [...new Set([...loginHtml.matchAll(/href="([^" ]+\.css)"/g)].map((match) => match[1]))];
if (!cssPaths.length) throw new Error("No real Next CSS found on local login route");
const styles = (
  await Promise.all(cssPaths.map(async (path) => (await fetch(new URL(path, origin))).text()))
).join("\n");
const htmlClass = loginHtml.match(/<html[^>]*class="([^"]+)"/)?.[1] || "";
const bodyClass = loginHtml.match(/<body[^>]*class="([^"]+)"/)?.[1] || "font-sans";
const aliases = {
  "convex/react": "runtime.jsx",
  "@convex-dev/auth/react": "runtime.jsx",
  "next/navigation": "runtime.jsx",
  "@/i18n/request": "runtime.jsx",
  "next/link": "../account-batch1/link.jsx",
  "next/image": "../account-batch1/image.jsx",
  "@sentry/nextjs": "runtime.jsx",
};
const bundle = await build({
  absWorkingDir: root,
  entryPoints: [resolve(folder, "entry.jsx")],
  bundle: true,
  write: false,
  outdir: "/tmp/account-dark-c-memory",
  format: "esm",
  platform: "browser",
  jsx: "automatic",
  sourcemap: "inline",
  logLevel: "error",
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
  plugins: [
    {
      name: "isolated-visual-runtime",
      setup(builder) {
        builder.onResolve({ filter: /^@\/components\/feedback\/FeedbackPanelProvider$/ }, () => ({
          path: resolve(folder, "runtime.jsx"),
        }));
        builder.onResolve({ filter: /^@sentry\/nextjs$/ }, () => ({ path: resolve(folder, "runtime.jsx") }));
        builder.onResolve(
          {
            filter:
              /^(convex\/react|@convex-dev\/auth\/react|next\/(navigation|link|image)|@\/i18n\/request)$/,
          },
          (args) => ({ path: resolve(folder, aliases[args.path]) }),
        );
      },
    },
  ],
});
const script = bundle.outputFiles.find((file) => file.path.endsWith(".js")).contents;
const moduleCss = bundle.outputFiles
  .filter((file) => file.path.endsWith(".css"))
  .map((file) => file.text)
  .join("\n");
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, `http://127.0.0.1:${port}`).pathname;
    if (pathname === "/fixture.js") {
      response.setHeader("content-type", "text/javascript");
      response.end(script);
      return;
    }
    if (pathname === "/fixture.css") {
      response.setHeader("content-type", "text/css");
      response.end(styles + "\n" + moduleCss);
      return;
    }
    if (pathname.startsWith("/_next/")) {
      const remote = await fetch(new URL(pathname, origin));
      response.statusCode = remote.status;
      response.setHeader("content-type", remote.headers.get("content-type") || "application/octet-stream");
      response.end(Buffer.from(await remote.arrayBuffer()));
      return;
    }
    if (extname(pathname)) {
      const asset = resolve(root, "public", `.${decodeURIComponent(pathname)}`);
      if (!asset.startsWith(resolve(root, "public") + "/")) throw new Error("Invalid asset path");
      const types = {
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".webp": "image/webp",
        ".jpg": "image/jpeg",
      };
      response.setHeader("content-type", types[extname(pathname)] || "application/octet-stream");
      response.end(await readFile(asset));
      return;
    }
    response.setHeader("content-type", "text/html");
    response.end(
      `<!doctype html><html lang="nl" class="${htmlClass}"><head><meta charset="utf-8">` +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>Batch 4 isolated visual fixture</title><link rel="stylesheet" href="/fixture.css"></head>' +
        `<body class="${bodyClass}"><div id="root"></div>` +
        '<script type="module" src="/fixture.js"></script></body></html>',
    );
  } catch (error) {
    response.statusCode = 500;
    response.end(String(error));
  }
});
await new Promise((done) => server.listen(port, "127.0.0.1", done));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
const cases = [
  ...[
    "pressure-calculator",
    "gearing",
    "saddle-selector",
    "shoe-cleat-fit",
    "settings",
    "feedback",
    "app",
  ].map((route) => ({ route, state: "filled", query: route === "gearing" ? "bikeId=bike1" : "" })),
  { route: "pressure-calculator", state: "filled", suffix: "result" },
  { route: "pressure-calculator", state: "loading" },
  { route: "pressure-calculator", state: "empty" },
  { route: "saddle-selector", state: "empty" },
  { route: "feedback", state: "loading" },
  { route: "feedback", state: "empty" },
  { route: "feedback", state: "filled", query: "tab=board", suffix: "board" },
  { route: "feedback", state: "filled", query: "tab=changelog", suffix: "changelog" },
  { route: "settings", state: "filled", suffix: "delete-dialog" },
  { route: "app", state: "filled", suffix: "android" },
  { route: "app", state: "filled", suffix: "desktop-platform" },
];
const filter = process.env.VISUAL_FILTER;
const selected = filter
  ? cases.filter((entry) => `${entry.route}:${entry.state}:${entry.suffix || ""}`.includes(filter))
  : cases;
try {
  for (const theme of (process.env.VISUAL_THEMES || "light,dark").split(",")) {
    const locale = "nl";
    for (const width of (process.env.VISUAL_WIDTHS || "1440,390").split(",").map(Number)) {
      for (const entry of selected) {
        if (locale === "en" && (entry.state !== "filled" || entry.suffix)) continue;
        const context = await browser.newContext({
          viewport: { width, height: width === 390 ? 844 : 1000 },
          deviceScaleFactor: 1,
          colorScheme: theme,
          reducedMotion: "reduce",
          locale: locale === "nl" ? "nl-NL" : "en-GB",
        });
        await context.route("**/*", (route) =>
          new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort(),
        );
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        const name =
          `20-dark-account-${theme}-${entry.route}-${entry.state}` +
          `${entry.suffix ? `-${entry.suffix}` : ""}-${width}`;
        try {
          await page.goto(
            `http://127.0.0.1:${port}/${locale}/${entry.route}` +
              `?fixture=${entry.state}&theme=${theme}&${entry.query || ""}`,
          );
          await page.waitForFunction(
            () => window.__visualReady && document.querySelector("#root")?.childElementCount > 0,
            undefined,
            { timeout: 5000 },
          );
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(500);
          if (entry.suffix === "result") {
            const next = () => page.getByRole("button", { name: "Volgende", exact: true }).click();
            await next();
            await page.getByRole("button", { name: "hooked", exact: true }).click();
            await next();
            await next();
            await next();
          }
          if (entry.suffix === "delete-dialog") {
            await page
              .getByRole("button", {
                name: locale === "nl" ? "Account verwijderen" : "Delete account",
                exact: true,
              })
              .click();
            await page.getByRole("dialog").waitFor();
          }
          if (entry.route === "app" && entry.suffix) {
            await page
              .getByRole("radio", { name: entry.suffix === "android" ? "Android" : "Computer" })
              .click();
          }
          await page.evaluate(() => window.scrollTo(0, 0));
          const metrics = await page.evaluate(() => ({
            theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
            width: document.documentElement.scrollWidth,
            overflow: document.documentElement.scrollWidth > innerWidth,
            headings: [...document.querySelectorAll("h1")].map((node) => node.textContent),
            unknownQueries: window.__visualUnknownQueries,
            queries: window.__visualQueries,
            actions: window.__visualActions,
            wide: [...document.querySelectorAll("main *")]
              .filter((node) => node.getBoundingClientRect().right > innerWidth + 1)
              .slice(0, 12)
              .map((node) => ({
                tag: node.tagName,
                className: node.className,
                right: node.getBoundingClientRect().right,
              })),
          }));
          await page.screenshot({
            path: resolve(output, `${name}.png`),
            fullPage: true,
            animations: "disabled",
          });
          if (width === 390 || entry.suffix === "delete-dialog") {
            await page.screenshot({ path: resolve(output, `${name}-viewport.png`), animations: "disabled" });
          }
          metrics.contrast = await page.evaluate(inspectContrast);
          metrics.gauges = await page.evaluate(inspectGaugeContrast);
          if (metrics.gauges.some((gauge) => !gauge.pass)) errors.push("Gauge arc contrast below 3:1");
          if (metrics.theme !== theme) errors.push(`Theme mismatch: expected ${theme}`);
          const focusTarget = page.locator("main button:not([disabled]), main a[href]").first();
          if (await focusTarget.count()) {
            await page.keyboard.press("Tab");
            await focusTarget.focus();
            metrics.focus = await focusTarget.evaluate((node) => {
              const style = getComputedStyle(node);
              return {
                visible: node.matches(":focus-visible"),
                outlineStyle: style.outlineStyle,
                outlineColor: style.outlineColor,
                boxShadow: style.boxShadow,
              };
            });
          }
          results.push({ name, ...metrics, errors });
        } catch (error) {
          results.push({ name, error: String(error), errors });
        }
        console.log(JSON.stringify(results.at(-1)));
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
const summary = {
  contrastFailures: results.flatMap((result) =>
    (result.contrast?.failures || []).map((failure) => ({
      name: result.name,
      ...failure,
    })),
  ),
  summary: true,
  cases: results.length,
  failed: results
    .filter((result) => result.error || result.errors?.length || result.unknownQueries?.length)
    .map((r) => r.name),
  overflows: results.filter((result) => result.overflow).map((r) => r.name),
  cssSha256: createHash("sha256")
    .update(styles + moduleCss)
    .digest("hex"),
  bundleSha256: createHash("sha256").update(script).digest("hex"),
};
summary.knownSharedContrastFailures = summary.contrastFailures.filter(
  (failure) =>
    failure.name.includes("settings") && failure.className.includes("text-[color:var(--primary-foreground)]"),
);
summary.unexpectedContrastFailures = summary.contrastFailures.filter(
  (failure) => !summary.knownSharedContrastFailures.includes(failure),
);
console.log(JSON.stringify(summary));
await import("node:fs/promises").then((fs) =>
  fs.writeFile(
    resolve(root, "plans/redesign-canvas/audit/22-account-browser.json"),
    JSON.stringify({ summary, results }, null, 2),
  ),
);
if (summary.failed.length || summary.overflows.length || summary.unexpectedContrastFailures.length) {
  process.exitCode = 1;
}
