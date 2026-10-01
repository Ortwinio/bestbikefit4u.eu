import { sendFixtureError } from "../lib/http-errors.mjs";
import { serveQaAsset } from "../final-sweep/assets.mjs";
import { build } from "esbuild";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";
import { inspectTheme } from "../dark-b/inspect.mjs";

const theme = process.env.VISUAL_THEME || "light";
const prefix = process.env.VISUAL_PREFIX || "";
const root = process.cwd();
const folder = resolve(root, "tests/visual/account-batch2");
const origin = process.env.VISUAL_DEV_ORIGIN || "http://localhost:3000";
const output = resolve(root, process.env.VISUAL_OUTPUT || "plans/redesign-canvas/audit/20.2-renders");
let port = Number(process.env.VISUAL_PORT || 0);
const loginHtml = await (await fetch(`${origin}/nl/login`)).text();
const cssPaths = [...new Set([...loginHtml.matchAll(/href="([^" ]+\.css)"/g)].map((match) => match[1]))];
if (!cssPaths.length) throw new Error("No real Next CSS found on local login route");
const styles = (await Promise.all(cssPaths.map(async (path) => (await fetch(new URL(path, origin))).text()))).join("\n");
const htmlClass = loginHtml.match(/<html[^>]*class="([^"]+)"/)?.[1] || "";
const bodyClass = loginHtml.match(/<body[^>]*class="([^"]+)"/)?.[1] || "font-sans";
const aliases = {
  "convex/react": "runtime.jsx", "@convex-dev/auth/react": "runtime.jsx",
  "next/navigation": "runtime.jsx", "@/i18n/request": "runtime.jsx",
  "next/link": "../account-batch1/link.jsx", "next/image": "../account-batch1/image.jsx",
  "@sentry/nextjs": "runtime.jsx",
};
const bundle = await build({
  absWorkingDir: root, entryPoints: [resolve(folder, "entry.jsx")], bundle: true,
  write: false, outdir: "/tmp/account-batch2-memory", format: "esm", platform: "browser",
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
  { route: "dashboard", state: "filled" },
  { route: "fit", state: "filled", query: "bikeId=visual-bike" },
  { route: "fit", state: "empty" },
  { route: "fit", state: "missing-profile" },
  { route: "fit", state: "loading" },
  { route: "fit/visual-session/questionnaire", state: "intro" },
  { route: "fit/visual-session/questionnaire", state: "filled" },
  { route: "fit/visual-session/questionnaire", state: "loading" },
  { route: "fit/visual-session/questionnaire", state: "missing" },
  { route: "fit/visual-session/results", state: "filled" },
  { route: "fit/visual-session/results", state: "climbing" },
  { route: "fit/visual-session/results", state: "details" },
  { route: "fit/visual-session/results", state: "email" },
  { route: "fit/visual-session/results", state: "email-error" },
  { route: "fit/visual-session/results", state: "processing" },
  { route: "fit/visual-session/results", state: "generate-error" },
  { route: "fit/visual-session/results", state: "incomplete" },
  { route: "fit/visual-session/results", state: "loading" },
  { route: "fit/visual-session/results", state: "missing" },
  { route: "fit/how-it-works", state: "filled" },
  { route: "fit-history", state: "filled" },
  { route: "fit-history", state: "empty" },
  { route: "fit-history", state: "loading" },
];
const filter = process.argv.find((argument) => argument.startsWith("--filter="))?.slice(9) || process.env.VISUAL_FILTER;
const selected = filter ? cases.filter((entry) => `${entry.route}:${entry.state}`.includes(filter)) : cases;
try {
  for (const locale of (process.env.VISUAL_LOCALES || "nl,en").split(",")) {
    for (const width of [1440, 390]) {
      for (const entry of selected) {
        const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, deviceScaleFactor: 1, colorScheme: theme, reducedMotion: "reduce", locale: locale === "nl" ? "nl-NL" : "en-GB" });
        await context.route("**/*", (route) => new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort());
        await context.addInitScript((value) => localStorage.setItem("theme", value), theme);
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        const name = `${prefix}${locale}-${entry.route.replaceAll("/", "-")}-${entry.state}-${width}`;
        try {
          await page.goto(`http://127.0.0.1:${port}/${locale}/${entry.route}?fixture=${entry.state}&${entry.query || ""}`);
          await page.waitForFunction(() => window.__visualReady && document.querySelector("#root")?.childElementCount > 0, undefined, { timeout: 15000 });
          await page.waitForFunction(
            (value) => document.documentElement.classList.contains("dark") === (value === "dark"), theme,
          );
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(350);
          if (entry.route.endsWith("/results")) {
            if (entry.state === "climbing") await page.getByRole("button", { name: locale === "nl" ? "Klimprofiel" : "Climbing fit", exact: true }).click();
            if (entry.state === "details") await page.locator("main details summary").first().click();
            if (entry.state === "email" || entry.state === "email-error") {
              await page.getByRole("button", { name: locale === "nl" ? "Rapport e-mailen" : "Email Report", exact: true }).click();
              await page.getByRole("dialog").waitFor({ state: "visible" });
              if (entry.state === "email-error") await page.getByRole("dialog").getByRole("button", { name: locale === "nl" ? "Rapport verzenden" : "Send Report", exact: true }).click();
            }
            await page.waitForTimeout(150);
          }
          const metrics = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth > window.innerWidth,
            sidebarRailCoversContent: window.innerWidth < 768 || document.querySelector("aside").parentElement.getBoundingClientRect().bottom >= document.querySelector("main").getBoundingClientRect().bottom - 1,
            width: document.documentElement.scrollWidth,
            headings: [...document.querySelectorAll("h1")].map((node) => node.textContent),
            fonts: { body: getComputedStyle(document.body).fontFamily, heading: document.querySelector("h1") && getComputedStyle(document.querySelector("h1")).fontFamily },
            queries: window.__visualQueries,
            unknownQueries: window.__visualUnknownQueries,
            sliderControls: [...document.querySelectorAll('[data-slot="slider-control"]')].map((node) => ({ width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })),
            sidebarPlanVisible: [...document.querySelectorAll('aside section')].some((node) => {
              const bounds = node.getBoundingClientRect();
              return /fit-sessie|fit.session/.test(node.textContent) && bounds.width > 0 && bounds.top >= 0 && bounds.bottom <= window.innerHeight;
            }),
            smallControls: [...document.querySelectorAll("a,button,input:not([type=hidden])")].filter((node) => {
              const rect = node.getBoundingClientRect();
              if (getComputedStyle(node).opacity === "0") return false;
              return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
            }).map((node) => ({ text: (node.textContent || node.getAttribute("aria-label") || node.getAttribute("type") || "").trim().slice(0, 90), width: Math.round(node.getBoundingClientRect().width), height: Math.round(node.getBoundingClientRect().height) })),
          }));
          if (entry.route === "dashboard" && entry.state === "filled") {
            if (locale === "nl") {
              const body = await page.locator("main").innerText();
              if (["Intermediate", "hrs/week", "Medium (30", "Balanced", "Group rides", "Lower back"].some((label) => body.includes(label))) throw new Error("Dashboard enum localization regression");
            }
            if (width === 1440) {
              await page.evaluate(() => window.scrollTo(0, 400));
              const stickyTop = await page.locator("aside").evaluate((node) => node.getBoundingClientRect().top);
              if (Math.abs(stickyTop) > 1 || !metrics.sidebarRailCoversContent) throw new Error("Full-height sticky sidebar regression");
              await page.evaluate(() => window.scrollTo(0, 0));
            }
          }
          await inspectTheme(page, output, name);
          await page.screenshot({ path: resolve(output, `${name}.png`), fullPage: true, animations: "disabled" });
          if (width === 390) await page.screenshot({ path: resolve(output, `${name}-viewport.png`), animations: "disabled" });
          results.push({ name, ...metrics, errors });
          console.log(JSON.stringify(results.at(-1)));
          if (entry.route === "dashboard" && entry.state === "filled" && width === 390) {
            const menuChecks = [];
            for (const opener of ["header", "more"]) {
              const trigger = opener === "header" ? page.locator('button[aria-expanded]').first() : page.getByRole("button", { name: locale === "nl" ? "Meer" : "More", exact: true });
              await trigger.focus();
              await page.keyboard.press("Enter");
              const dialog = page.getByRole("dialog");
              await dialog.waitFor({ state: "visible" });
              await page.screenshot({ path: resolve(output, name + "-menu-" + opener + ".png"), animations: "disabled" });
              let trapped = true;
              for (let index = 0; index < 35; index++) {
                await page.keyboard.press("Tab");
                await page.waitForTimeout(40);
                trapped = trapped && await dialog.evaluate((node) => node.contains(document.activeElement));
              }
              await page.keyboard.press("Escape");
              await dialog.waitFor({ state: "hidden" });
              const returnedFocus = await trigger.evaluate((node) => node === document.activeElement);
              menuChecks.push({ opener, trapped, returnedFocus });
            }
            await page.getByRole("button", { name: locale === "nl" ? "Meer" : "More", exact: true }).click();
            await page.getByRole("dialog").waitFor({ state: "visible" });
            await page.setViewportSize({ width: 1440, height: 1000 });
            await page.getByRole("dialog").waitFor({ state: "hidden" });
            await page.waitForTimeout(350);
            const resizeUnblocked = await page.evaluate(() => !document.querySelector('[role="dialog"]') && !document.body.hasAttribute("data-scroll-locked"));
            console.log(JSON.stringify({ name: name + "-menu-checks", menuChecks, resizeUnblocked }));
          }
        } catch (error) {
          results.push({ name, error: String(error), errors });
          console.log(JSON.stringify(results.at(-1)));
        } finally { await context.close(); }
      }
    }
  }
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
console.log(JSON.stringify({ summary: true, capturedAt: new Date().toISOString(), cases: results.length, failed: results.filter((result) => result.error || result.errors?.length).map((result) => result.name), overflows: results.filter((result) => result.overflow).map((result) => result.name), smallControls: results.filter((result) => result.smallControls?.length).map((result) => ({ name: result.name, controls: result.smallControls })), cssSha256: createHash("sha256").update(styles + moduleCss).digest("hex"), bundleSha256: createHash("sha256").update(script).digest("hex") }));
if (results.some((result) => result.error || result.errors?.length || result.overflow || result.sidebarRailCoversContent === false)) process.exitCode = 1;
