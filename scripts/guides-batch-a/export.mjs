import { mkdir, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const root = new URL("../../src/lib/guides/content/batch-a/", import.meta.url);
const entries = (await readdir(root)).filter((name) => name.endsWith(".ts")
  && name !== "index.ts" && !name.endsWith(".test.ts"));
const locales = ["nl", "en"];
const bilingual = (guide, key) => Object.fromEntries(locales.map((locale) => [locale, guide[locale][key]]));
const faqs = (markdown) => {
  const body = markdown.split(/^## (?:Veelgestelde vragen|Frequently asked questions)\s*$/m)[1];
  return [...body.matchAll(/^### (.+)\n+([\s\S]*?)(?=^### |$(?![\s\S]))/gm)]
    .map(([, question, answer]) => ({ q: question.trim(), a: answer.trim().replace(/\s+/g, " ") }));
};
const backlog = JSON.parse(execFileSync("python3", ["-c",
  'import csv,json;print(json.dumps(list(csv.DictReader(open("docs/bestbikefit4u_guides_cms_backlog_v1_en.csv")))))'],
{ encoding: "utf8" }));
const output = "plans/redesign-canvas/guides-import";
await mkdir(output, { recursive: true });
const documents = [];
const selectedSlug = process.argv.find((value) => value.startsWith("--slug="))?.slice(7);
for (const entry of entries) {
  const guide = Object.values(await import(new URL(entry, root).href))[0];
  if (selectedSlug && guide.slug !== selectedSlug) continue;
  const old = backlog.find((row) => row.Slug.replace(/^guides\//, "") === guide.slug);
  if (!old) throw new Error(`Missing backlog slug: ${guide.slug}`);
  const timestamp = Date.parse(`${guide.updatedAt}T00:00:00Z`);
  const hero = `/illustrations/guides/${guide.illustration}.webp`;
  const links = [...new Set([...guide.en.markdown.matchAll(/\]\(\/en(\/guides\/[^)]+)\)/g)]
    .map((match) => match[1]))];
  const record = {
    slug: guide.slug, path: `/guides/${guide.slug}`, cluster: old.Cluster, backlogOrder: Number(old.Order),
    status: "in_review", importStatus: "44b",
    importNotes: "Batch A 44b: review artifact only; production publishing requires separate approval.",
    pageTitle: bilingual(guide, "title"), h1: bilingual(guide, "title"),
    metaTitle: bilingual(guide, "metaTitle"), metaDescription: bilingual(guide, "metaDescription"),
    pageBrief: bilingual(guide, "quickAnswer"), libraryBody: bilingual(guide, "markdown"),
    body: Object.fromEntries(locales.map((locale) => [locale, [...guide[locale].markdown.split(/^## /m).slice(1)
      .map((section) => ({ title: section.split("\n")[0], type: "prose",
        items: section.slice(section.indexOf("\n")).trim().split(/\n\n/) })),
      { title: locale === "nl" ? "Afsluiter" : "Closing CTA", type: "prose", items: [guide[locale].cta] },
    ]])),
    faqs: Object.fromEntries(locales.map((locale) => [locale, faqs(guide[locale].markdown)])),
    quickAnswer: { keyTakeaway: bilingual(guide, "quickAnswer"),
      commonMistake: { nl: "", en: "" }, payAttention: { nl: "", en: "" } },
    heroImageFileName: `${guide.illustration}.webp`, heroImagePublicPath: hero,
    featuredImageUrl: hero, featuredImageAlt: bilingual(guide, "alt"),
    ogTitle: bilingual(guide, "metaTitle"), ogDescription: bilingual(guide, "metaDescription"),
    ogImageUrl: `https://bestbikefit4u.eu/og${hero.replace(/\.webp$/, ".jpg")}`, ogImageAlt: bilingual(guide, "alt"),
    relatedGuidePaths: links, relatedGuides: links.map((path) => path.replace("/guides/", "")),
    relatedKeywords: locales.flatMap((locale) => [guide[locale].keyword, ...guide[locale].relatedKeywords]),
    primaryCtaTarget: guide.nl.ctaTarget, primaryCtaLabel: bilingual(guide, "ctaLabel"),
    robotsIndex: true, tableOfContents: false, lastUpdatedAt: timestamp,
    createdAt: timestamp, updatedAt: timestamp, createdBy: "import-json", updatedBy: "import-json", version: 1,
  };
  documents.push({ path: `${output}/${guide.slug}.json`, content: `${JSON.stringify(record, null, 2)}\n` });
}
process.stdout.write(JSON.stringify(documents));
