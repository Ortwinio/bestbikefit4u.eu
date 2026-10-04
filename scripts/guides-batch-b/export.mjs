import { mkdir, readdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const root = new URL("../../src/lib/guides/content/batch-b/", import.meta.url);
const names = (await readdir(root)).filter((name) => name.endsWith(".ts")
  && name !== "index.ts" && !name.endsWith(".test.ts"));
const locales = ["nl", "en"];
const bilingual = (guide, key) => Object.fromEntries(locales.map((locale) => [locale, guide[locale][key]]));
const backlog = JSON.parse(execFileSync("python3", ["-c",
  'import csv,json;print(json.dumps(list(csv.DictReader(open("docs/bestbikefit4u_guides_cms_backlog_v1_en.csv")))))'],
{ encoding: "utf8" }));
const output = "plans/redesign-canvas/guides-import";
await mkdir(output, { recursive: true });
const titles = {};

for (const name of names) {
  const guide = Object.values(await import(new URL(name, root).href))[0];
  const old = backlog.find((row) => row.Slug.replace(/^guides\//, "") === guide.slug);
  if (!old) throw new Error(`Missing backlog slug: ${guide.slug}`);
  const timestamp = Date.parse(`${guide.updatedAt}T00:00:00Z`);
  const hero = `/illustrations/guides/${guide.illustration}.webp`;
  const links = [...new Set([...guide.en.markdown.matchAll(/\]\(\/en(\/guides\/[^)]+)\)/g)]
    .map((match) => match[1]))];
  const faqs = Object.fromEntries(locales.map((locale) => {
    const body = guide[locale].markdown.split(/^## (?:Veelgestelde vragen|Frequently asked questions)\s*$/m)[1];
    if (!body) throw new Error(`Missing FAQ: ${guide.slug}/${locale}`);
    return [locale, [...body.matchAll(/^### (.+)\n+([\s\S]*?)(?=^### |$(?![\s\S]))/gm)]
      .map(([, question, answer]) => ({ q: question.trim(), a: answer.trim().replace(/\s+/g, " ") }))];
  }));
  const record = {
    slug: guide.slug, path: `/guides/${guide.slug}`, cluster: old.Cluster, backlogOrder: Number(old.Order),
    status: "in_review", importStatus: "44b",
    importNotes: "Batch B 44b review artifact only. Publishing requires separate approval; no database writes.",
    pageTitle: bilingual(guide, "title"), h1: bilingual(guide, "title"),
    metaTitle: bilingual(guide, "metaTitle"), metaDescription: bilingual(guide, "metaDescription"),
    pageBrief: bilingual(guide, "quickAnswer"), libraryBody: bilingual(guide, "markdown"),
    body: Object.fromEntries(locales.map((locale) => [locale, [
      ...guide[locale].markdown.split(/^## /m).slice(1).map((section) => ({
        title: section.split("\n")[0], type: "prose",
        items: section.slice(section.indexOf("\n")).trim().split(/\n\n/),
      })),
      { title: locale === "nl" ? "Afsluiter" : "Closing CTA", type: "prose", items: [guide[locale].cta] },
    ]])),
    faqs,
    quickAnswer: { keyTakeaway: bilingual(guide, "quickAnswer"),
      commonMistake: { nl: "", en: "" }, payAttention: { nl: "", en: "" } },
    heroImageFileName: `${guide.illustration}.webp`, heroImagePublicPath: hero,
    featuredImageUrl: hero, featuredImageAlt: bilingual(guide, "alt"),
    ogTitle: bilingual(guide, "metaTitle"), ogDescription: bilingual(guide, "metaDescription"),
    ogImageUrl: `${SITE_ORIGIN}/og${hero.replace(/\.webp$/, ".jpg")}`, ogImageAlt: bilingual(guide, "alt"),
    relatedGuidePaths: links, relatedGuides: links.map((path) => path.replace("/guides/", "")),
    relatedKeywords: locales.flatMap((locale) => [guide[locale].keyword, ...guide[locale].relatedKeywords]),
    primaryCtaTarget: guide.nl.ctaTarget, primaryCtaLabel: bilingual(guide, "ctaLabel"),
    robotsIndex: true, tableOfContents: false, lastUpdatedAt: timestamp,
    createdAt: timestamp, updatedAt: timestamp, createdBy: "import-json", updatedBy: "import-json", version: 1,
  };
  await writeFile(`${output}/${guide.slug}.json`, `${JSON.stringify(record, null, 2)}\n`);
  titles[guide.slug] = bilingual(guide, "title");
}

await writeFile("src/i18n/marketing/guideRewriteTitlesB.ts",
  "export const guideRewriteTitlesB: Readonly<Record<string, { nl: string; en: string }>> = "
  + JSON.stringify(titles, null, 2) + ";\n");
console.log(`Wrote ${names.length} Batch B review documents and title records. No database connection.`);
import { SITE_ORIGIN } from "../../shared/brand.ts";
