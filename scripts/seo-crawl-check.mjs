#!/usr/bin/env node
import { mkdir, writeFile, open } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { get } from "node:https";
import { createPreviewCertificate } from "../tests/visual/final-sweep/tls.mjs";
import { once } from "node:events";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseHead, parseSitemap, isNoindex, absoluteHttp, metadataIssues } from "./seo-crawl/html.mjs";

export const USER_AGENTS = {
  Googlebot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Screaming Frog": "Screaming Frog SEO Spider/23.0",
  GPTBot: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.3; +https://openai.com/gptbot)",
  ClaudeBot: "Mozilla/5.0 (compatible; ClaudeBot/1.0; +https://anthropic.com/claudebot)",
  Chrome: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    + "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
};
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
const isPrivateCheck = (url) => /\/(login|email-preferences)$/.test(new URL(url).pathname);
const clean = (url) => { const parsed = new URL(url); parsed.search = ""; parsed.hash = ""; return parsed.href; };
const keyFor = (agent, url) => `${agent} ${url}`;

export function optionsFromArgs(args) {
  const options = { base: "", label: "local-fixed", delay: 150, local: false, build: true };
  for (let index = 0; index < args.length; index += 1) {
    const [name, inline] = args[index].split("=", 2);
    if (name === "--local") { options.local = true; continue; }
    if (name === "--skip-build") { options.build = false; continue; }
    if (!["--base", "--label", "--delay"].includes(name)) throw new Error(`Unknown option: ${name}`);
    const value = inline ?? args[++index];
    if (!value) throw new Error(`Missing value: ${name}`);
    options[name.slice(2)] = name === "--delay" ? Number(value) : value;
  }
  if (!/^[a-z0-9-]+$/.test(options.label)) throw new Error("Label must contain lowercase letters, digits and hyphens");
  if (!Number.isFinite(options.delay) || options.delay < 0) throw new Error("Delay must be nonnegative");
  if (!options.local && !options.base) throw new Error("Use --local or --base https://bestbikefit4u.eu");
  if (options.local && options.base) throw new Error("Use either --local or --base");
  if (options.base) {
    const base = new URL(options.base);
    if (!["http:", "https:"].includes(base.protocol) || base.username || base.password) throw new Error("Invalid base");
    if (!["localhost", "127.0.0.1", "[::1]"].includes(base.hostname)) options.delay = Math.max(150, options.delay);
    options.base = base.origin;
  }
  return options;
}

async function runProcess(command, args, env, log) {
  const file = await open(log, "w");
  const child = spawn(command, args, { env, stdio: ["ignore", file.fd, file.fd] });
  try {
    const [code] = await once(child, "exit");
    if (code !== 0) throw new Error(`${command} exited ${code}; see ${log}`);
  } finally { await file.close(); }
}
async function startLocal(options, audit) {
  const env = {
    ...process.env,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL || "http://127.0.0.1:9",
    NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL || "http://127.0.0.1:9",
  };
  if (options.build) await runProcess("npm", ["run", "build"], env, resolve(audit, `crawl-${options.label}-build.log`));
  const probe = createServer();
  probe.listen(0, "127.0.0.1");
  await once(probe, "listening");
  const port = probe.address().port;
  await new Promise((done) => probe.close(done));
  const file = await open(resolve(audit, `crawl-${options.label}-server.log`), "w");
  const certificate = await createPreviewCertificate();
  const child = spawn(process.execPath, ["scripts/seo-crawl/server.mjs", String(port),
    certificate.keyPath, certificate.certPath], { env, stdio: ["ignore", file.fd, file.fd] });
  const base = `https://127.0.0.1:${port}`;
  const localFetch = (url, options = {}) => new Promise((done, reject) => {
    const request = get(url, { ca: certificate.cert, servername: "localhost", signal: options.signal,
      headers: { ...options.headers, host: "bestbikefit4u.eu" } }, (incoming) => {
      const headers = new Headers();
      for (const [key, value] of Object.entries(incoming.headers)) {
        if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
      }
      const chunks = [];
      incoming.on("data", (chunk) => chunks.push(chunk));
      incoming.on("error", reject);
      incoming.on("end", () => done(new Response(Buffer.concat(chunks), {
        status: incoming.statusCode, headers,
      })));
    });
    request.on("error", reject);
  });
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (child.exitCode !== null) throw new Error("Local production server exited; inspect its log");
    try {
      const response = await localFetch(`${base}/robots.txt`, { signal: AbortSignal.timeout(1000) });
      await response.body?.cancel();
      if (response.ok) return {
        base, fetch: localFetch, offlineConvex: env.NEXT_PUBLIC_CONVEX_URL === "http://127.0.0.1:9",
        stop: async () => {
          child.kill("SIGTERM");
          await once(child, "exit");
          await file.close();
          await certificate.close();
        },
      };
    } catch { /* The server is still starting. */ }
    await pause(500);
  }
  child.kill("SIGTERM");
  await file.close();
  await certificate.close();
  throw new Error("Local production server readiness timed out");
}

export async function crawl(options) {
  const audit = resolve("plans/seo-crawl-fixes/audit");
  await mkdir(audit, { recursive: true });
  const local = options.local ? await startLocal(options, audit) : null;
  const base = local?.base ?? options.base;
  const origin = "https://bestbikefit4u.eu";
  const startedAt = new Date().toISOString();
  const cache = new Map();
  const network = [];
  const sitemapPages = new Set();
  const sitemapReports = [];
  const findings = [];
  const linkChecks = [];
  const skippedLinks = new Set();
  const add = (url, agent, rule, detail) => findings.push({ url, agent, rule, detail });
  const publicUrl = (href, from = origin) => {
    try {
      const url = new URL(href, from);
      if (![origin, base].includes(url.origin) || !["https:", "http:"].includes(url.protocol)) return null;
      url.hash = "";
      return new URL(url.pathname + url.search, origin).href;
    } catch { return null; }
  };
  // A single sequential request path for sitemaps, pages, alternates and internal links.
  async function request(url, agent, retry = 0) {
    const cacheKey = keyFor(agent, url);
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    let current = url;
    const redirects = [];
    let result;
    const start = performance.now();
    try {
      for (let hop = 0; hop <= 8; hop += 1) {
        await pause(options.delay);
        const target = new URL(new URL(current).pathname + new URL(current).search, base);
        const response = await (local?.fetch ?? fetch)(target, {
          method: "GET", redirect: "manual",
          headers: { "user-agent": USER_AGENTS[agent], accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
          signal: AbortSignal.timeout(30000),
        });
        const headersMs = Math.round(performance.now() - start);
        network.push({ url: current, agent, status: response.status });
        if ([301, 302, 303, 307, 308].includes(response.status) && response.headers.get("location")) {
          const location = new URL(response.headers.get("location"), current).href;
          await response.body?.cancel();
          redirects.push({ url: current, status: response.status, location });
          const next = publicUrl(location, current);
          if (!next) {
            result = { url, agent, status: response.status, finalUrl: location, redirects, externalRedirect: true };
            break;
          }
          current = next;
          continue;
        }
        const contentType = response.headers.get("content-type") ?? "";
        const readable = /html|xml|text\//i.test(contentType);
        const html = readable ? await response.text() : "";
        if (!readable) await response.body?.cancel();
        result = {
          url, agent, status: response.status, finalUrl: current, redirects, contentType,
          elapsedToHeadersMs: headersMs, elapsedMs: Math.round(performance.now() - start),
          robotsHeader: response.headers.get("x-robots-tag") ?? "",
          parsed: /html/i.test(contentType) ? parseHead(html) : null,
          xml: /xml/i.test(contentType) ? html : undefined,
          bytes: Buffer.byteLength(html),
        };
        break;
      }
      if (!result) throw new Error("More than eight redirects");
    } catch (error) {
      network.push({ url: current, agent, status: 0, error: error.message, attempt: retry + 1 });
      if (retry < 2) {
        console.log(`Retry ${retry + 1}/2: ${agent} ${url}: ${error.message}`);
        await pause(500 * (retry + 1));
        return request(url, agent, retry + 1);
      }
      result = { url, agent, status: 0, finalUrl: current, redirects, error: error.message };
    }
    cache.set(cacheKey, result);
    return result;
  }
  async function discover(url, seen = new Set()) {
    if (seen.has(url)) return;
    seen.add(url);
    const response = await request(url, "Googlebot");
    if (response.status !== 200 || !response.xml) throw new Error(`Sitemap failed: ${url} (${response.status})`);
    const parsed = parseSitemap(response.xml);
    sitemapReports.push({ url, status: response.status, index: parsed.index, count: parsed.locations.length });
    for (const location of parsed.locations) {
      const absolute = absoluteHttp(location);
      const normalized = absolute && publicUrl(absolute);
      if (!normalized) { add(url, "Googlebot", "invalid-sitemap-url", location); continue; }
      if (parsed.index) await discover(normalized, seen);
      else sitemapPages.add(normalized);
    }
  }
  let fatal;
  const pages = [];
  try {
    await discover(`${origin}/sitemap.xml`);
    const extras = [
      "/nl/login", "/en/login", "/nl/login?src=seo-crawl-check",
      "/nl/email-preferences", "/en/email-preferences",
    ].map((path) => origin + path);
    for (const url of sitemapPages) {
      if (isPrivateCheck(url)) add(url, "all", "private-url-in-sitemap", "");
    }
    const urls = [...new Set([...sitemapPages, ...extras])];
    const queued = new Set(urls);
    for (const [agentIndex, agent] of Object.keys(USER_AGENTS).entries()) {
      for (const [index, url] of urls.entries()) {
        const response = await request(url, agent);
        pages.push(response);
        if (response.status !== 200 || response.redirects.length) {
          add(url, agent, "page-not-direct-200", { status: response.status, redirects: response.redirects });
        }
        if (!response.parsed) { add(url, agent, "missing-html", response.error ?? response.contentType); continue; }
        const parsed = response.parsed;
        for (const rule of metadataIssues(parsed, clean(url))) add(url, agent, rule, "");
        const noindex = isNoindex(parsed, response.robotsHeader, agent);
        if (isPrivateCheck(url)) {
          if (!noindex) add(url, agent, "private-missing-noindex", "");
          if (parsed.alternates.length) add(url, agent, "private-hreflang", parsed.alternates);
        } else {
          if (noindex) add(url, agent, "indexable-url-noindex", "");
          for (const lang of ["nl", "en"]) {
            if (!parsed.alternates.some((item) => item.lang === lang)) add(url, agent, "missing-hreflang-locale", lang);
          }
          const seen = new Set();
          for (const alternate of parsed.alternates) {
            if (seen.has(alternate.lang)) add(url, agent, "duplicate-hreflang", alternate.lang);
            seen.add(alternate.lang);
            const targetUrl = absoluteHttp(alternate.value);
            if (!targetUrl || !publicUrl(targetUrl)) { add(url, agent, "invalid-hreflang-url", alternate); continue; }
            const target = await request(publicUrl(targetUrl), agent);
            if (isPrivateCheck(targetUrl) || target.status !== 200 || target.redirects.length
              || !target.parsed || isNoindex(target.parsed, target.robotsHeader, agent)) {
              add(url, agent, "hreflang-nonindexable-target", { alternate, status: target.status });
              continue;
            }
            if (target.parsed.canonicals.length !== 1 || target.parsed.canonicals[0].value !== targetUrl) {
              add(url, agent, "hreflang-target-not-self-canonical", alternate);
            }
            const sourceSet = parsed.alternates.map((item) => `${item.lang} ${item.value}`).sort();
            const targetSet = target.parsed.alternates.map((item) => `${item.lang} ${item.value}`).sort();
            if (JSON.stringify(sourceSet) !== JSON.stringify(targetSet)) {
              add(url, agent, "hreflang-not-reciprocal", { target: targetUrl, sourceSet, targetSet });
            }
          }
          const ownLocale = new URL(url).pathname.split("/")[1];
          if (!parsed.alternates.some((item) => item.lang === ownLocale && item.value === clean(url))) {
            add(url, agent, "hreflang-missing-self", ownLocale);
          }
        }
        for (const href of parsed.hrefs) {
          const targetUrl = publicUrl(href, url);
          if (!targetUrl) continue;
          // Offline CMS sitemaps omit repository guide leaves; audit their real linked pages too.
          if (/^\/(nl|en)\/guides\/[^/]+$/.test(new URL(targetUrl).pathname) && !queued.has(targetUrl)) {
            queued.add(targetUrl);
            urls.push(targetUrl);
          }
          // Auth/action endpoints are not safe crawl targets. Public navigation pages remain covered.
          if (/^\/api\//.test(new URL(targetUrl).pathname)) { skippedLinks.add(targetUrl); continue; }
          const target = await request(targetUrl, agent);
          if (target.status === 404 || target.status === 0 || target.status >= 500) {
            add(url, agent, target.status === 404 ? "internal-link-404" : "internal-link-unavailable",
              { href, target: targetUrl, status: target.status, redirects: target.redirects });
          }
          if (target.redirects.length || target.status !== 200) {
            linkChecks.push({ source: url, agent, target: targetUrl, status: target.status, redirects: target.redirects });
          }
        }
        if (index % 25 === 0) console.log(`[${agentIndex + 1}/5 ${agent}] ${index + 1}/${urls.length}; ${findings.length} findings`);
      }
    }
  } catch (error) {
    fatal = error.message;
    add(base, "all", "crawl-incomplete", fatal);
  } finally {
    await local?.stop();
  }
  const counts = {};
  for (const finding of findings) counts[finding.rule] = (counts[finding.rule] ?? 0) + 1;
  const report = {
    label: options.label, startedAt, finishedAt: new Date().toISOString(), base, canonicalOrigin: origin,
    userAgents: USER_AGENTS, delayMs: options.delay, concurrency: 1, javascript: false,
    offlineConvex: local?.offlineConvex ?? null, fatal,
    sitemapUrlCount: sitemapPages.size, pageChecks: pages.length, requestCount: network.length,
    passed: findings.length === 0, counts, sitemaps: sitemapReports, findings, linkChecks,
    skippedActionLinks: [...skippedLinks], pages: pages.map(({ xml: _xml, ...page }) => page),
    network,
  };
  await writeFile(resolve(audit, `crawl-${options.label}.json`), JSON.stringify(report, null, 2) + "\n");
  const summary = [
    `# Crawl: ${options.label}`, "", `- Base: ${base}`,
    `- UTC: ${startedAt} → ${report.finishedAt}`,
    `- ${sitemapPages.size} sitemap URLs; ${pages.length} page/UA checks; ${network.length} sequential GET requests.`,
    `- Five raw-HTML user agents; no JavaScript; ${options.delay} ms minimum delay between requests.`,
    `- Result: ${report.passed ? "PASS" : "FAIL"}; ${findings.length} findings.`,
    ...(local?.offlineConvex ? ["- Offline Convex fallback: repository guides render; live-only CMS/blog coverage is unavailable."] : []),
    "", "| Finding | Count |", "| --- | ---: |",
    ...Object.entries(counts).map(([rule, count]) => `| ${rule} | ${count} |`),
    "", "## Examples", ...findings.slice(0, 20).map((item) => `- ${item.agent}: ${item.url} — ${item.rule}`),
    "", "Complete source offsets, metadata values, reciprocal pairs and inlinks are in the sibling JSON.",
    "Links are HTML navigation anchors/areas; authenticated API/action links are listed but not requested.",
  ];
  await writeFile(resolve(audit, `crawl-${options.label}.md`), summary.join("\n") + "\n");
  console.log(JSON.stringify({ label: options.label, passed: report.passed, pages: pages.length, counts }, null, 2));
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  crawl(optionsFromArgs(process.argv.slice(2))).then((report) => {
    if (!report.passed) process.exitCode = 1;
  }).catch((error) => { console.error(error); process.exitCode = 1; });
}
