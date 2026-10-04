#!/usr/bin/env node
import { readFile, writeFile, access } from "node:fs/promises";
import { createServer } from "node:net";
import { get } from "node:https";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createPreviewCertificate } from "../tests/visual/final-sweep/tls.mjs";
import { parseSitemap, parseHead, metadataIssues, isNoindex } from "./seo-crawl/html.mjs";

// Uses the existing production build. No build, deployment, CMS write or browser JavaScript.
const certificate = await createPreviewCertificate();
const probe = createServer(); probe.listen(0, "127.0.0.1"); await once(probe, "listening");
const port = probe.address().port; await new Promise(done => probe.close(done));
const child = spawn(process.execPath, ["scripts/seo-crawl/server.mjs", String(port), certificate.keyPath, certificate.certPath], {
  stdio: ["ignore", "pipe", "inherit"], env: process.env,
});
const report = { buildId: (await readFile(".next/BUILD_ID", "utf8")).trim(), checkedAt: new Date().toISOString(),
  sitemapUrls: [], documents: [], redirects: [], canonicalPages: [], internalSources: {}, failures: [] };
const check = (condition, message) => { if (!condition) report.failures.push(message); };
const request = input => new Promise((done, reject) => {
  const path = new URL(input, "https://bikefitboost.com");
  const req = get(new URL(path.pathname + path.search, `https://127.0.0.1:${port}`), {
    ca: certificate.cert, servername: "localhost", signal: AbortSignal.timeout(45000),
    headers: { host: "bikefitboost.com", "user-agent": "Screaming Frog SEO Spider/23.0" },
  }, response => {
    let body = ""; response.setEncoding("utf8"); response.on("data", chunk => { body += chunk; });
    response.on("end", () => done({ status: response.statusCode, headers: response.headers, body }));
  });
  req.on("error", reject);
});
try {
  await new Promise((done, reject) => {
    const timer = setTimeout(() => reject(new Error("Local HTTPS startup timed out")), 60000);
    child.once("error", error => { clearTimeout(timer); reject(error); });
    child.once("exit", code => { clearTimeout(timer); reject(new Error(`Local HTTPS exited ${code}`)); });
    child.stdout.on("data", chunk => { if (String(chunk).includes("HTTPS server ready")) { clearTimeout(timer); done(); } });
  });
  const pending = ["/sitemap.xml"];
  const seen = new Set();
  while (pending.length) {
    const path = pending.shift();
    if (seen.has(path)) continue;
    seen.add(path);
    const response = await request(path);
    check(response.status === 200, `Sitemap ${path}: ${response.status}`);
    const sitemap = parseSitemap(response.body);
    if (sitemap.index) pending.push(...sitemap.locations);
    else report.sitemapUrls.push(...sitemap.locations);
  }
  report.sitemapUrls = [...new Set(report.sitemapUrls)].sort();
  const expected = report.sitemapUrls.filter(url => /^\/(nl|en)(\/|$)/.test(new URL(url).pathname));
  const retired = url => /\/fiets-afstellen(?:\/|$)|\/\d+kg-(?:road-bike|gravel-bike|mountain-bike|racefiets|gravelbike|mountainbike)/.test(new URL(url).pathname);
  check(!expected.some(retired), "Sitemap contains retired owner or weight URL");
  for (const path of ["/llms.txt", "/llms-full.txt"]) {
    const response = await request(path);
    const urls = [...new Set([...response.body.matchAll(/\]\((https:\/\/bikefitboost\.com[^\s)]*)\)/g)].map(match => match[1]))].sort();
    const missing = expected.filter(url => !urls.includes(url));
    const extra = urls.filter(url => !expected.includes(url));
    const stalePublicFile = await access(`public${path}`).then(() => true, () => false);
    check(response.status === 200, `${path}: status ${response.status}`);
    check(/^text\/plain\b/.test(response.headers["content-type"] ?? ""), `${path}: wrong content type`);
    check(!stalePublicFile, `${path}: stale static public file shadows route`);
    check(!missing.length && !extra.length, `${path}: ${missing.length} missing / ${extra.length} unexpected sitemap URLs`);
    check(!urls.some(retired), `${path}: retired URLs present`);
    check(path !== "/llms-full.txt" || /(?:answer|antwoord):/i.test(response.body), "Full llms document lacks answer content");
    report.documents.push({ path, status: response.status, contentType: response.headers["content-type"],
      characters: response.body.length, urlCount: urls.length, stalePublicFile, missing, extra });
  }
  const destinations = { nl: "/nl/bikefitting", en: "/en/bike-fitting" };
  for (const path of ["/nl/fiets-afstellen", "/en/fiets-afstellen", "/nl/bike-fitting", "/en/bikefitting"]) {
    const destination = destinations[path.split("/")[1]];
    const response = await request(path);
    const location = response.headers.location ? new URL(response.headers.location, "https://bikefitboost.com").pathname : null;
    const target = await request(destination);
    check(response.status === 301 && location === destination && target.status === 200, `${path}: not a direct 301 to ${destination}`);
    report.redirects.push({ path, status: response.status, destination: location, destinationStatus: target.status });
  }
  for (const [locale, path] of Object.entries(destinations)) {
    const response = await request(path); const parsed = parseHead(response.body);
    const issues = metadataIssues(parsed, `https://bikefitboost.com${path}`);
    check(response.status === 200 && !issues.length && !isNoindex(parsed, response.headers["x-robots-tag"]), `${path}: ${issues.join(",")} or nonindexable`);
    for (const [language, target] of Object.entries(destinations)) {
      check(parsed.alternates.some(link => link.lang === language && link.value === `https://bikefitboost.com${target}`), `${path}: missing reciprocal ${language}`);
    }
    report.canonicalPages.push({ locale, path, status: response.status, issues, canonical: parsed.canonicals[0]?.value, alternates: parsed.alternates });
  }
  const inventory = JSON.parse(await readFile("plans/seo-semrush/audit/S9-internal-links.json", "utf8"));
  for (const [locale, destination] of Object.entries(destinations)) {
    const sources = [];
    for (const path of inventory.locales[locale].contextualSourcePages.slice(0, 6)) {
      const response = await request(path); const parsed = parseHead(response.body);
      const links = parsed.hrefs.filter(href => new URL(href, "https://bikefitboost.com").pathname === destination);
      check(response.status === 200 && links.length > 0, `${path}: no rendered canonical owner link`);
      if (response.status === 200 && links.length) sources.push({ path, destination, links });
    }
    check(new Set(sources.map(source => source.path)).size >= 5, `${locale}: fewer than five actual source pages`);
    report.internalSources[locale] = sources;
  }
} catch (error) { report.failures.push(String(error)); }
finally {
  child.kill("SIGTERM"); await certificate.close();
  await writeFile("plans/seo-semrush/audit/S8-S9-runtime.json", JSON.stringify(report, null, 2) + "\n");
}
console.log(JSON.stringify({ sitemapUrls: report.sitemapUrls.length, documents: report.documents,
  sources: Object.fromEntries(Object.entries(report.internalSources).map(([locale, sources]) => [locale, sources.length])), failures: report.failures }, null, 2));
if (report.failures.length) process.exitCode = 1;
