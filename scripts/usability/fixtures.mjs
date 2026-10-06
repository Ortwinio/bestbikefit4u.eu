import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { build } from "esbuild";
import { prepareAccountFixtures } from "../../tests/visual/final-sweep/account-fixture.mjs";
import { prepareBlogFixture } from "../../tests/visual/final-sweep/blog-fixture.mjs";
import { isLoopback, serveQaAsset } from "../../tests/visual/final-sweep/assets.mjs";

const escapeAttribute = value => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");

export function welcomeHandoffFixture(now) {
  if (!Number.isSafeInteger(now) || now <= 0) throw new Error("Welcome fixture needs a valid observation timestamp");
  return { version: 1, entries: [
    { field: "heightCm", value: 184, unit: "cm", calculator: "saddle-height", method: "declared", touchedAt: now },
    { field: "inseamCm", value: 86, unit: "cm", calculator: "saddle-height", method: "measured", touchedAt: now },
  ] };
}

export const checkoutFixtureEntry = `
import React from "react";
import { createRoot } from "react-dom/client";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { checkoutCopy } from "@/i18n/marketing/checkout";
const locale = location.pathname.startsWith('/nl/') ? 'nl' : 'en';
const state = new URLSearchParams(location.search).get('state') || 'choice';
const text = checkoutCopy[locale];
const rejectSideEffect = async () => { throw new Error('Offline presentation fixture: authentication and payment are unavailable'); };
createRoot(document.getElementById('root')).render(<CheckoutFlow locale={locale}
  authenticated={state === 'review' || state === 'success'} accountId="fixture-rider"
  accountEmail="rider@example.test" bikes={[{id:'fixture-bike',name:'Fixture bike'}]}
  initialSelection={{product:'annual',bikeId:''}}
  preview={state === 'success' ? 'success' : state === 'failure' ? 'failure' : null}
  signIn={rejectSideEffect} startCheckout={rejectSideEffect} />);
async function waitFor(predicate) {
  for (let attempt = 0; attempt < 250; attempt++) {
    const value = predicate();
    if (value) return value;
    await new Promise(done => setTimeout(done,20));
  }
  throw new Error('Checkout fixture did not reach requested state: ' + state);
}
window.__usabilityFixtureReady = (async () => {
  await waitFor(() => document.querySelector('h1'));
  if (state === 'success') await waitFor(() => document.querySelector('h1')?.textContent === text.annualSuccess);
  if (state === 'failure') await waitFor(() => document.querySelector('h1')?.textContent === text.failureTitle);
  if (state === 'account' || state === 'review') {
    const choice = await waitFor(() => [...document.querySelectorAll('button')].find(button =>
      !button.disabled && button.textContent.startsWith(text.continue + ' ·')));
    choice.click();
    await waitFor(() => document.querySelector('h1')?.textContent === text.accountTitle);
    if (state === 'review') {
      const next = await waitFor(() => [...document.querySelectorAll('button')].find(button =>
        !button.disabled && button.textContent === text.continue));
      next.click();
      await waitFor(() => document.querySelector('h1')?.textContent === text.confirmTitle);
    }
  }
  document.documentElement.dataset.usabilityFixtureState = state;
  window.__visualReady = true;
  return state;
})();
`;

export async function prepareCheckoutFixture({ root, origin, fetch: previewFetch, staticDir }) {
  const login = await previewFetch(new URL("/nl/login", origin));
  if (!login.ok) throw new Error(`Checkout fixture production styles: HTTP ${login.status}`);
  const loginHtml = await login.text();
  const stylesheets = [...new Set([...loginHtml.matchAll(/href="([^" ]+\.css(?:\?[^" ]*)?)"/g)].map(match => match[1]))];
  if (!stylesheets.length) throw new Error("Checkout fixture requires production CSS");
  const styles = await Promise.all(stylesheets.map(async path => {
    const url = new URL(path, origin);
    if (url.origin !== new URL(origin).origin) throw new Error("External fixture stylesheet rejected");
    const response = await previewFetch(url);
    if (!response.ok) throw new Error(`Checkout stylesheet unavailable: ${response.status}`);
    return response.text();
  }));
  const bundle = await build({
    absWorkingDir: root, stdin: { contents: checkoutFixtureEntry, resolveDir: root, loader: "jsx" },
    bundle: true, write: false, outdir: resolve(root, "scripts/usability/.memory-checkout"),
    platform: "browser", format: "esm", jsx: "automatic", logLevel: "error",
    define: { "process.env.NODE_ENV": '"production"' },
    plugins: [{ name: "offline-checkout", setup(builder) {
      builder.onResolve({ filter: /^next\/link$/ }, () => ({ path: resolve(root, "tests/visual/account-batch1/link.jsx") }));
      builder.onResolve({ filter: /^next\/image$/ }, () => ({ path: resolve(root, "tests/visual/account-batch1/image.jsx") }));
    } }],
  });
  const script = bundle.outputFiles.find(file => file.path.endsWith(".js"));
  if (!script) throw new Error("Checkout fixture produced no script");
  const css = [...styles, ...bundle.outputFiles.filter(file => file.path.endsWith(".css")).map(file => file.text)].join("\n");
  const htmlClass = escapeAttribute(loginHtml.match(/<html[^>]*class="([^"]+)"/)?.[1] ?? "");
  const bodyClass = escapeAttribute(loginHtml.match(/<body[^>]*class="([^"]+)"/)?.[1] ?? "");
  const server = createServer(async (request, response) => {
    try {
      if (request.method !== "GET" && request.method !== "HEAD") {
        response.writeHead(405); response.end("Read-only fixture"); return;
      }
      if (await serveQaAsset(request, response, { staticDir })) return;
      const url = new URL(request.url, "http://127.0.0.1");
      if (url.pathname === "/fixture.js" || url.pathname === "/fixture.css") {
        response.setHeader("content-type", url.pathname.endsWith(".js") ? "text/javascript" : "text/css");
        response.end(url.pathname.endsWith(".js") ? script.contents : css); return;
      }
      if (extname(url.pathname)) {
        const base = resolve(root, "public");
        const file = resolve(base, `.${decodeURIComponent(url.pathname)}`);
        if (!file.startsWith(base + sep)) { response.writeHead(400); response.end(); return; }
        const types = { ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp" };
        response.setHeader("content-type", types[extname(file)] ?? "application/octet-stream");
        response.end(await readFile(file)); return;
      }
      const state = url.searchParams.get("state") ?? "choice";
      if (!/^\/(nl|en)\/checkout$/.test(url.pathname) || !["choice", "account", "review", "success", "failure"].includes(state)) {
        response.writeHead(404); response.end("Unknown checkout fixture state"); return;
      }
      const locale = url.pathname.startsWith("/nl/") ? "nl" : "en";
      response.setHeader("content-type", "text/html; charset=utf-8");
      response.setHeader("x-qa-fixture", "checkout-presentation-only");
      response.end(`<!doctype html><html lang="${locale}" class="${htmlClass}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline checkout presentation fixture</title><link rel="stylesheet" href="/fixture.css"></head><body class="${bodyClass}"><aside role="note">Offline QA fixture · no authentication or payment</aside><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>`);
    } catch (error) {
      response.statusCode = error.code === "ENOENT" ? 404 : 500;
      response.end("Checkout fixture unavailable");
    }
  });
  await new Promise((done, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", done); });
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((done, reject) => server.close(error => error ? reject(error) : done())),
    limitations: ["Checkout uses the actual CheckoutFlow with explicit deterministic presentation props; authentication, payment and email callbacks throw. Account/review steps advance through real buttons. Success is labelled fixture data, not a completed transaction."],
  };
}

const defaultFactories = { account: prepareAccountFixtures, "account-enforced": prepareAccountFixtures,
  blog: prepareBlogFixture, checkout: prepareCheckoutFixture };

export const fixtureManifest = {
  account: { mode: "presentation", serverRenderedContent: false, states: ["filled"], readiness: "window.__visualReady" },
  "account-enforced": { mode: "presentation", serverRenderedContent: false, states: ["free-enforced", "paid"],
    readiness: "document.documentElement.dataset.usabilityAccess matches requested scenario" },
  blog: { mode: "presentation", serverRenderedContent: true, states: ["visual-article-1"], readiness: "rendered article" },
  checkout: { mode: "presentation", serverRenderedContent: false, states: ["choice", "account", "review", "success", "failure"],
    readiness: "await window.__usabilityFixtureReady; assert document.documentElement.dataset.usabilityFixtureState equals requested state" },
};

export async function prepareUsabilityFixtures({ root, origin, fetch: previewFetch = fetch, needed = [], factories = defaultFactories }) {
  const source = new URL(origin);
  if (!["http:", "https:"].includes(source.protocol) || !isLoopback(source.hostname)) throw new Error("Local production origin required");
  const names = [...new Set(needed)];
  for (const name of names) {
    if (!Object.hasOwn(defaultFactories, name) || typeof factories[name] !== "function") throw new Error(`Unknown or missing usability fixture: ${name}`);
  }
  const instances = [];
  const origins = {};
  const limitations = [];
  async function close() {
    const outcomes = await Promise.allSettled(instances.splice(0).reverse().map(instance => instance.close()));
    const failures = outcomes.filter(outcome => outcome.status === "rejected");
    if (failures.length) throw new AggregateError(failures.map(outcome => outcome.reason), "Fixture cleanup failed");
  }
  try {
    for (const name of names) {
      const instance = await factories[name]({ root, origin, fetch: previewFetch, staticDir: resolve(root, ".next/static"),
        paidAccessEnforced: name === "account-enforced", ...(name === "blog" ? { serverRenderedContent: true } : {}) });
      instances.push(instance);
      if (!instance.origin || !isLoopback(new URL(instance.origin).hostname)) throw new Error(`Invalid ${name} fixture origin`);
      if (name === "blog" && instance.serverRenderedContent !== true) throw new Error("Blog fixture did not provide required server-rendered article content");
      origins[name] = instance.origin;
      limitations.push(...(instance.limitations ?? []).map(message => `${name}: ${message}`));
    }
  } catch (error) {
    await close();
    throw error;
  }
  return { origins, close, limitations, manifest: Object.fromEntries(names.map(name => [name, fixtureManifest[name]])) };
}
