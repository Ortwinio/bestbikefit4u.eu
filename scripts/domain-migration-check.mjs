#!/usr/bin/env node
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { DEFAULT_SITE_ORIGIN, LEGACY_SITE_HOSTS, isLegacySiteHost } from '../shared/brand.ts';
import { parseHead, parseSitemap, metadataIssues } from './seo-crawl/html.mjs';
import { startLocal } from './domain-migration/local.mjs';

export function validateOrigins(origin, legacy) {
  for (const value of [origin, legacy]) {
    const url = new URL(value);
    if (url.origin !== value || url.protocol !== 'https:' || url.username || url.password) {
      throw new Error('Pass clean HTTPS origins without paths, credentials or trailing slash');
    }
  }
  if (origin !== DEFAULT_SITE_ORIGIN || !isLegacySiteHost(new URL(legacy).hostname)) {
    throw new Error('Only the canonical apex and a configured legacy host may be checked');
  }
}

export function inspectHtml(html, expected) {
  const parsed = parseHead(html);
  const origin = new URL(expected).origin;
  const issues = metadataIssues(parsed, expected);
  for (const lang of ['en', 'nl']) {
    if (!parsed.alternates.some((node) => node.lang === lang)) issues.push(`hreflang-missing:${lang}`);
  }
  for (const node of parsed.alternates) {
    try { if (new URL(node.value).origin !== origin) issues.push('hreflang-origin'); }
    catch { issues.push('hreflang-invalid'); }
  }
  const dom = new JSDOM(html);
  const og = [...dom.window.document.querySelectorAll('meta[property="og:url"]')];
  if (og.length !== 1 || og[0].getAttribute('content') !== expected) issues.push('og-url-not-self');
  for (const node of dom.window.document.querySelectorAll('[src], [href], [srcset], [style], style')) {
    const values = ['src', 'srcset', 'style'].map((key) => node.getAttribute(key) ?? '');
    if (node.tagName === 'LINK' && /stylesheet|preload|icon/.test(node.getAttribute('rel') ?? '')) {
      values.push(node.getAttribute('href') ?? '');
    }
    if (node.tagName === 'STYLE') values.push(node.textContent);
    if (values.some((value) => /\bhttp:\/\//i.test(value))) issues.push('mixed-content');
  }
  dom.window.close();
  return [...new Set(issues)];
}

export async function checkRedirect(fetcher, origin, legacy, path, oauth = false) {
  const expected = new URL(path, origin).href;
  const response = await fetcher(new URL(path, legacy).href);
  const issues = [];
  if (response.status !== 301) issues.push(`redirect-status:${response.status}`);
  if (response.headers.get('location') !== expected) issues.push('redirect-path-query-or-origin');
  await response.body?.cancel();
  // Never initiate OAuth or consume callback codes. Its domain hop is independently testable.
  if (!issues.length && !oauth) {
    const destination = await fetcher(expected);
    if (destination.status !== 200) issues.push(`destination-status:${destination.status}`);
    if (/^\/og\/illustrations\/guides\/[^/]+\.jpg$/.test(new URL(expected).pathname)
      && destination.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'image/jpeg') {
      issues.push('guide-image-content-type');
    }
    await destination.body?.cancel();
  }
  return { path, legacy, expected, oauthDestinationSkipped: oauth, issues };
}

export async function readSitemaps(fetcher, origin) {
  const queue = [`${origin}/sitemap.xml`];
  const seen = new Set();
  const urls = new Set();
  const issues = [];
  while (queue.length) {
    const url = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);
    if (new URL(url).origin !== origin) { issues.push(`sitemap-origin:${url}`); continue; }
    const response = await fetcher(url);
    if (response.status !== 200) { issues.push(`sitemap-status:${url}:${response.status}`); continue; }
    const parsed = parseSitemap(await response.text());
    for (const location of parsed.locations) {
      if (new URL(location).origin !== origin) issues.push(`sitemap-origin:${location}`);
      else if (parsed.index) queue.push(location);
      else urls.add(location);
    }
  }
  if (!urls.size) issues.push('sitemap-empty');
  return { urls: [...urls], maps: [...seen], issues };
}

export function inspectRobots(text, origin) {
  const issues = [];
  const maps = [...text.matchAll(/^sitemap:\s*(\S+)/gim)].map((match) => match[1]);
  if (!maps.length) issues.push('robots-missing-sitemap');
  for (const value of maps) {
    try { if (new URL(value).origin !== origin) issues.push('robots-sitemap-origin'); }
    catch { issues.push('robots-sitemap-invalid'); }
  }
  for (const [, value] of text.matchAll(/^host:\s*(\S+)/gim)) {
    if (![new URL(origin).host, origin].includes(value)) issues.push('robots-host-origin');
  }
  return issues;
}

export async function main(args) {
  const [origin, legacy, ...flags] = args;
  validateOrigins(origin, legacy);
  const local = flags.includes('--local');
  const label = flags.find((flag) => flag.startsWith('--label='))?.slice(8) ?? (local ? 'local' : 'production');
  if (!/^[a-z0-9-]+$/.test(label)) throw new Error('Invalid label');
  if (flags.some((flag) => !['--local', '--skip-build'].includes(flag) && !flag.startsWith('--label='))) {
    throw new Error('Unknown flag');
  }
  const audit = 'plans/migratie/audit';
  await mkdir(audit, { recursive: true });
  const server = local ? await startLocal(!flags.includes('--skip-build'), audit, label) : null;
  const fetcher = async (url) => {
    const parsed = new URL(url);
    if (parsed.origin !== origin && !isLegacySiteHost(parsed.hostname)) throw new Error('Unapproved request origin');
    if (!local) await new Promise((done) => setTimeout(done, 175));
    const options = { redirect: 'manual', signal: AbortSignal.timeout(30000),
      headers: { 'user-agent': 'Googlebot (BikeFitBoost domain migration verification)' } };
    return server ? server.fetch(url, options) : fetch(url, options);
  };
  try {
    const sitemap = await readSitemaps(fetcher, origin);
    const pages = sitemap.urls;
    const paths = new Set(pages.map((url) => new URL(url).pathname));
    paths.add('/en?src=migration&campaign=a%2Fb');
    paths.add('/nl/login?src=saddle-height&handoff=1');
    paths.add('/robots.txt');
    for (const url of sitemap.maps) paths.add(new URL(url).pathname);
    const images = (await readdir('public/og/illustrations/guides')).filter((name) => name.endsWith('.jpg'));
    for (const name of images) paths.add(`/og/illustrations/guides/${name}`);
    paths.add('/api/auth/signin/google?callbackUrl=%2Fnl');
    paths.add('/api/auth/callback/google?error=access_denied');
    const redirects = [];
    const hosts = [legacy, ...LEGACY_SITE_HOSTS.map((host) => `https://${host}`),
      `https://migration-probe.${LEGACY_SITE_HOSTS[0]}`];
    for (const host of new Set(hosts)) {
      for (const path of paths) redirects.push(await checkRedirect(fetcher, origin, host, path, path.startsWith('/api/auth/')));
    }
    const metadata = [];
    for (const url of pages) {
      const response = await fetcher(url);
      metadata.push({ url, issues: response.status === 200 ? inspectHtml(await response.text(), url)
        : [`status:${response.status}`] });
    }
    const robots = await fetcher(`${origin}/robots.txt`);
    const robotsText = await robots.text();
    const robotsIssues = robots.status === 200 ? [] : [`robots-status:${robots.status}`];
    robotsIssues.push(...inspectRobots(robotsText, origin));
    const findings = [...sitemap.issues, ...robotsIssues,
      ...redirects.flatMap((row) => row.issues.map((issue) => `${row.legacy}${row.path}: ${issue}`)),
      ...metadata.flatMap((row) => row.issues.map((issue) => `${row.url}: ${issue}`))];
    if (paths.size < 25) findings.push('Fewer than 25 distinct paths checked');
    const report = { at: new Date().toISOString(), origin, legacy, local, paths: paths.size,
      guideImages: images.length, redirects, metadata, sitemap, robotsIssues, findings,
      limits: 'OAuth destinations deliberately not fetched. Local CMS uses build fallback data; no production data changes.' };
    await writeFile(`${audit}/domain-migration-${label}.json`, `${JSON.stringify(report, null, 2)}\n`);
    await writeFile(`${audit}/domain-migration-${label}.md`,
      `# Domain migration ${label}\n\n${findings.length ? 'FAIL' : 'PASS'}: ${findings.length} findings.\n\n`
      + `${paths.size} paths; ${redirects.length} legacy redirects; ${metadata.length} HTML pages; `
      + `${images.length} guide JPGs.\n\n${report.limits}\n\n`
      + findings.map((finding) => `- ${finding}`).join('\n') + '\n');
    console.log(`${findings.length ? 'FAIL' : 'PASS'}: ${findings.length} findings; ${redirects.length} redirects`);
    if (findings.length) process.exitCode = 1;
  } finally { await server?.stop(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => { console.error(error); process.exitCode = 1; });
}
