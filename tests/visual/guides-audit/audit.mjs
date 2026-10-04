import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeDutchText } from '../final-sweep/nl-language.mjs';

export async function runGuideAudit({
  base = 'https://bikefitboost.com',
  canonicalOrigin = 'https://bikefitboost.com',
  output = 'plans/redesign-canvas/audit/44a-guides-audit',
  filter = [],
  fetchImpl = fetch,
} = {}) {
  base = base.replace(/\/$/, '');
  canonicalOrigin = canonicalOrigin.replace(/\/$/, '');
  if ((base !== 'https://bikefitboost.com' || filter.length)
    && output === 'plans/redesign-canvas/audit/44a-guides-audit') {
    throw new Error('Local or filtered audits require a separate output to preserve the 44a baseline.');
  }
const get = async (url) => {
  const response = await fetchImpl(url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response;
};
const sitemap = await (await get(`${base}/sitemap-guides.xml`)).text();
const sitemapUrls = [...new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]))]
  .filter((url) => /\/(nl|en)\/guides\//.test(url))
  .map((url) => new URL(new URL(url).pathname, base).href).sort();
const backlog = await readFile('docs/bestbikefit4u_guides_cms_backlog_v1_nl.csv', 'utf8');
const slugs = [...new Set([...backlog.matchAll(/,\/nl\/guides\/([^,]+),/g)].map((match) => match[1]))];
const urls = [...new Set([...sitemapUrls, ...slugs.flatMap((slug) =>
  ['nl', 'en'].map((locale) => `${base}/${locale}/guides/${slug}`))])]
  .filter((url) => !filter.length || filter.some((part) => new URL(url).pathname.includes(part))).sort();
const browser = await chromium.launch();
const rows = process.env.AUDIT_APPEND
  ? JSON.parse(await readFile(`${output}.json`, 'utf8')).rows : [];
const images = new Map();
const socialImages = JSON.parse(await readFile("src/lib/seo/social-images.json", "utf8"));
try {
  for (const url of urls) {
    if (rows.some((row) => row.url === url)) continue;
    const html = await (await get(url)).text();
    const page = await browser.newPage({ javaScriptEnabled: false });
    const data = await page.evaluate((html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const text = (node) => node?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      const article = doc.querySelector('#guide-content');
      const main = doc.querySelector('main') ?? doc.body;
      const hero = main.querySelector('header');
      const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].flatMap((el) => {
        try { const value = JSON.parse(el.textContent); return Array.isArray(value) ? value : [value]; }
        catch { return []; }
      }).flatMap((item) => item['@graph'] ?? item);
      const headings = [...(article?.querySelectorAll('h2') ?? [])];
      const sections = headings.map((heading, index) => {
        const nodes = [...article.querySelectorAll('p, li, td, th')];
        const following = nodes.filter((node) => {
          const after = heading.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING;
          const before = !headings[index + 1]
            || node.compareDocumentPosition(headings[index + 1]) & Node.DOCUMENT_POSITION_FOLLOWING;
          return after && before && !node.parentElement.closest('li');
        });
        return { title: text(heading), text: following.map(text).join(' ') };
      });
      const links = [...(article?.querySelectorAll('a[href]') ?? [])].map((a) => ({
        href: a.getAttribute('href'), text: text(a), context: text(a.parentElement),
      }));
      const image = hero?.querySelector('img');
      const quick = doc.querySelector('#guide-quick-title')?.parentElement;
      const paragraphs = [...(article?.querySelectorAll('p') ?? [])].map(text);
      return {
        hasArticle: !!article,
        sourceMarker: doc.querySelector('[data-guide-source]')?.getAttribute('data-guide-source'),
        title: text(doc.querySelector('title')),
        description: doc.querySelector('meta[name="description"]')?.content ?? '',
        keywordMeta: doc.querySelector('meta[name="keywords"]')?.content ?? '',
        h1: [...doc.querySelectorAll('h1')].map(text),
        canonical: doc.querySelector('link[rel="canonical"]')?.href,
        hreflang: [...doc.querySelectorAll('link[hreflang]')].map((el) => ({
          lang: el.hreflang, href: el.href,
        })),
        heroIntro: [...(hero?.querySelectorAll('p') ?? [])]
          .filter((node) => !quick?.contains(node)).map(text).join(' '),
        quick: text(quick), article: text(article), paragraphs, sections, links, schemas,
        numberedSteps: article?.querySelectorAll('ol li').length ?? 0,
        image: image ? { src: image.getAttribute('src'), alt: image.alt,
          width: image.width, height: image.height } : null,
        ogImage: doc.querySelector('meta[property="og:image"]')?.content ?? '',
        updatedText: text(main).match(/(?:Laatst bijgewerkt|Last updated|Updated on)[^.!?]{0,80}/i)?.[0],
        cmsMarkdown: !!article?.querySelector('div.space-y-6.text-base.leading-8.text-muted-foreground'),
      };
    }, html);
    await page.close();
    if (!data.hasArticle) throw new Error(`No real guide article: ${url}`);
    const locale = new URL(url).pathname.split('/')[1];
    const slug = new URL(url).pathname.split('/').at(-1);
    const words = (text) => text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? [];
    const count = (text) => words(text).length;
    const sentences = data.paragraphs.flatMap((text) => text.split(/[.!?]+/).filter((s) => count(s)));
    const faq = data.schemas.find((s) => s['@type'] === 'FAQPage')?.mainEntity ?? [];
    const keyword = data.keywordMeta.split(',')[0].trim() || data.h1[0] || slug;
    const contains = (text, needle) => text.toLowerCase().includes(needle.toLowerCase());
    const first100 = words(`${data.heroIntro} ${data.quick} ${data.article}`).slice(0, 100).join(' ');
    const english = locale === 'nl' ? [data.title, data.description, ...data.sections.flatMap((s) =>
      [s.title, s.text]), ...data.links.map((l) => l.text), data.image?.alt ?? '']
      .map((text) => ({ text, evidence: analyzeDutchText(text) })).filter((item) => item.evidence) : [];
    const range = (value, min, max) => value >= min && value <= max;
    const sectionRules = locale === 'nl'
      ? [/probleem|klacht|symptom/i, /achtergrond|waarom|oorzaak/i, /zo pak|bikefitting|aanpak|stappen/i,
        /verder lezen|gerelateerde gids|verder verkennen/i]
      : [/problem|symptom/i, /background|why|cause/i, /how to|bike fitting|steps|approach/i,
        /further reading|related guides|explore next/i];
    let previousSection = -1;
    const sectionMatches = sectionRules.map((rule) => {
      const index = data.sections.findIndex((section, i) => i > previousSection && rule.test(section.title));
      if (index >= 0) previousSection = index;
      return index;
    });
    const lengthRanges = [[120, 200], [200, 350], [300, 500], [60, 120]];
    const required = sectionMatches.map((index, i) => ({ index, name: ['problem', 'background', 'tips', 'links'][i],
      words: index < 0 ? 0 : count(data.sections[index].text),
      pass: index >= 0 && range(count(data.sections[index].text), ...lengthRanges[i]) }));
    const guideLinks = data.links.filter((link) => /\/(?:nl\/|en\/)?guides\/[^/#?]+/.test(link.href));
    const calculatorLinks = data.links.filter((link) => /\/calculators\//.test(link.href));
    let imageInfo = null;
    if (data.image) {
      const imageUrl = new URL(data.image.src, base);
      const original = imageUrl.searchParams.get('url') ?? data.image.src;
      const resolved = new URL(original, base).href;
      if (!images.has(resolved)) {
        try {
          const response = await get(resolved);
          const bytes = Buffer.from(await response.arrayBuffer());
          const sharp = (await import('sharp')).default;
          const metadata = await sharp(bytes).metadata();
          images.set(resolved, { url: resolved, bytes: bytes.length, width: metadata.width,
            height: metadata.height, format: metadata.format });
        } catch (error) { images.set(resolved, { url: resolved, error: error.message }); }
      }
      imageInfo = images.get(resolved);
    }
    const checks = {
      structure: required.every((s) => s.pass) && sectionMatches.every((v, i) => v === i),
      totalWords: range(count(`${data.heroIntro} ${data.quick} ${data.article}`), 900, 1500),
      quickLength: range(count(data.quick), 40, 70),
      tipsNumbered: data.numberedSteps > 0,
      warningSigns: /(?:arts|fitter|doctor|clinician)/i.test(data.article)
        && /(?:zwelling|rust|nacht|swelling|rest|night)/i.test(data.article),
      faqCountLength: range(faq.length, 3, 5) && faq.every((q) => count(q.acceptedAnswer?.text ?? '') <= 60)
        && range(faq.reduce((sum, q) => sum + count(`${q.name} ${q.acceptedAnswer?.text ?? ''}`), 0), 150, 300),
      guideCalculatorLinks: range(new Set(guideLinks.map((l) => l.href)).size, 3, 5) && calculatorLinks.length > 0,
      title: data.title.length <= 60 && data.title.endsWith(' | BestBikeFit4U'),
      description: range(data.description.length, 140, 155),
      oneH1: data.h1.length === 1,
      keywordH1: contains(data.h1.join(' '), keyword),
      keywordOpening: contains(first100, keyword),
      keywordH2: data.sections.some((s) => contains(s.title, keyword)),
      language: english.length === 0,
      personalTone: locale === 'nl' ? /\b(je|jij|jouw)\b/i.test(data.article) && !/\b(uw|u)\b/.test(data.article) : true,
      sentenceLength: sentences.length > 0 && sentences.reduce((n, s) => n + count(s), 0) / sentences.length < 18,
      paragraphLength: data.paragraphs.every((p) => p.split(/[.!?]+/).filter((s) => count(s)).length <= 4),
      noHype: !/revolutionair|gegarandeerd pijnvrij|revolutionary|guaranteed pain.free|!{2,}/i.test(data.article),
      schema: ['Article', 'FAQPage', 'BreadcrumbList'].every((type) => data.schemas.some((s) => s['@type'] === type)),
      dateModified: !!data.schemas.find((s) => s['@type'] === 'Article')?.dateModified && !!data.updatedText,
      canonical: data.canonical === new URL(new URL(url).pathname, canonicalOrigin).href,
      hreflang: ['nl', 'en'].every((lang) => data.hreflang.some((h) => h.lang === lang
        && h.href === new URL(new URL(url).pathname.replace(/\/(nl|en)\//, `/${lang}/`), canonicalOrigin).href)),
      imageSpec: !!imageInfo && imageInfo.format === 'webp' && imageInfo.bytes < 200000
        && imageInfo.width === 1600 && imageInfo.height === 1000,
      imageAlt: !!data.image?.alt && (locale !== 'nl' || !analyzeDutchText(data.image.alt)),
      imageOg: !!imageInfo && !!data.ogImage
        && new URL(data.ogImage).pathname === (socialImages[new URL(imageInfo.url).pathname]?.path
          ?? new URL(imageInfo.url).pathname)
        && new URL(data.ogImage).origin === canonicalOrigin,
    };
    rows.push({ url, locale, slug, source: data.sourceMarker ?? (data.cmsMarkdown ? 'CMS libraryBody (render marker)'
      : 'CMS body or code fallback unresolved from public HTML'),
    sourceEvidence: data.sourceMarker ? `Explicit source marker: ${data.sourceMarker}` : data.cmsMarkdown ? 'Markdown wrapper is only rendered when dbGuide.libraryBody[locale] exists.'
      : 'No public source marker. A CMS body may equal fallback; public HTML cannot prove record absence.',
    keyword, counts: { words: count(`${data.heroIntro} ${data.quick} ${data.article}`),
      title: data.title.length, description: data.description.length, quick: count(data.quick),
      faq: faq.length, guideLinks: new Set(guideLinks.map((l) => l.href)).size,
      calculatorLinks: calculatorLinks.length, averageSentence: sentences.reduce((n, s) => n + count(s), 0)
        / Math.max(1, sentences.length) }, required, checks, english, imageInfo, ...data });
    console.log(`${rows.length}/${urls.length} ${locale}/${slug}`);
  }
} finally { await browser.close(); }

for (const row of rows) {
  row.sitemapListed = sitemapUrls.includes(row.url);
  row.inbound = rows.filter((other) => other.locale === row.locale && other.url !== row.url
    && other.links.some((l) => new URL(l.href, other.url).href.replace(/[#?].*$/, '') === row.url))
    .map((other) => other.slug);
  row.checks.inbound = row.inbound.length >= 2;
  row.checks.uniqueTitle = rows.filter((r) => r.locale === row.locale && r.title === row.title).length === 1;
  row.checks.uniqueDescription = rows.filter((r) => r.locale === row.locale
    && r.description === row.description).length === 1;
  const counterpart = rows.find((other) => other.slug === row.slug && other.locale !== row.locale);
  row.parity = { counterpart: counterpart?.url, sectionCounts: [row.sections.length, counterpart?.sections.length],
    faqCounts: [row.counts.faq, counterpart?.counts.faq], semanticParity: 'manual review required' };
  row.numericClaims = [...row.article.matchAll(/\b\d+(?:[.,–-]\d+)?\s*(?:mm|cm|%|graden|degrees|ritten|rides|minuten|minutes)\b/g)]
    .map((match) => match[0]);
  row.claimVerification = 'Numbers extracted for editorial source review; no invented-number verdict without sources.';
}
await mkdir(dirname(output), { recursive: true });
const result = { scannedAt: new Date().toISOString(), base, canonicalOrigin, filter,
  inboundScope: filter.length ? 'Filtered routes only; cross-batch links require the complete audit.' : 'Complete inventory',
  inventory: 'public sitemap + code backlog guide routes',
  localCodeReferenceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  count: rows.length, rows };
await writeFile(`${output}.json`, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Saved ${output}.json`);

return result;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const argument = (name) => process.argv.find((value) => value.startsWith(`--${name}=`))
    ?.split('=').slice(1).join('=');
  await runGuideAudit({
    base: argument('base'),
    canonicalOrigin: argument('canonical-origin'),
    output: argument('output'),
    filter: (argument('filter') ?? '').split(',').filter(Boolean),
  });
}
