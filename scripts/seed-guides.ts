import { getGuideBacklog, getGuideChildren, type GuideBacklogEntry } from "../src/lib/guides/backlog";
import {
  buildFaqs,
  buildHubIntro,
  buildLeafSections,
  buildQuickAnswer,
} from "../src/lib/guides/content";
import { stripGuidePrefix } from "./lib/locale-strip";

type Locale = "en" | "nl";

type SeedGuideRecord = {
  slug: string;
  path: string;
  cluster: string;
  status: "published";
  pageTitle: { en: string; nl: string };
  h1: { en: string; nl: string };
  metaTitle: { en: string; nl: string };
  metaDescription: { en: string; nl: string };
  pageBrief: { en: string; nl: string };
  body: {
    en: ReturnType<typeof buildLeafSections>;
    nl: ReturnType<typeof buildLeafSections>;
  };
  faqs: {
    en: ReturnType<typeof buildFaqs>;
    nl: ReturnType<typeof buildFaqs>;
  };
  quickAnswer: ReturnType<typeof buildQuickAnswer> extends infer T
    ? { en: T; nl: T }
    : never;
  libraryBody: { en: string; nl: string };
  relatedGuides: string[];
  primaryCtaTarget: string;
  primaryCtaLabel: { en: string; nl: string };
  robotsIndex: true;
  tableOfContents: false;
  publishedAt: number;
  lastUpdatedAt: number;
  createdAt: number;
  updatedAt: number;
  version: 1;
};

function parseArgs(argv: string[]) {
  const flags = new Set(argv.slice(2));
  return {
    dryRun: !flags.has("--write"),
  };
}

function markdownEscapeCell(value: string) {
  return value.replace(/\|/g, "\\|");
}

function renderSectionMarkdown(section: ReturnType<typeof buildLeafSections>[number]) {
  const lines = [`## ${section.title}`];

  if (section.type === "table" && section.tableHeaders && section.tableRows) {
    lines.push(
      `| ${section.tableHeaders.map(markdownEscapeCell).join(" | ")} |`,
      `| ${section.tableHeaders.map(() => "---").join(" | ")} |`,
      ...section.tableRows.map((row) => `| ${row.map(markdownEscapeCell).join(" | ")} |`)
    );
    return lines.join("\n");
  }

  if (section.type === "steps") {
    lines.push(...section.items.map((item, index) => `${index + 1}. ${item}`));
    return lines.join("\n");
  }

  lines.push(...section.items.map((item) => `- ${item}`));
  return lines.join("\n");
}

function renderFaqMarkdown(faqs: ReturnType<typeof buildFaqs>) {
  if (faqs.length === 0) {
    return "";
  }

  const lines = ["## FAQ"];
  for (const faq of faqs) {
    lines.push(`### ${faq.q}`, faq.a);
  }
  return lines.join("\n\n");
}

function renderLibraryBody(
  entry: GuideBacklogEntry,
  locale: Locale,
  body: ReturnType<typeof buildLeafSections>,
  faqs: ReturnType<typeof buildFaqs>
) {
  const parts = [`# ${entry.h1}`, entry.pageBrief, ...body.map(renderSectionMarkdown)];
  const faqMarkdown = renderFaqMarkdown(faqs);
  if (faqMarkdown) {
    parts.push(faqMarkdown);
  }
  return parts.filter(Boolean).join("\n\n");
}

function buildSeedBody(entry: GuideBacklogEntry, locale: Locale) {
  const isHub = getGuideChildren(entry.slug, locale).length > 0;
  if (!isHub) {
    return buildLeafSections(entry, locale);
  }

  return [
    {
      title: locale === "nl" ? "Waar deze hub voor is" : "What this hub covers",
      type: "prose" as const,
      items: buildHubIntro(entry, locale),
    },
  ];
}

function buildSeedRecord(slug: string, now: number): SeedGuideRecord {
  const enEntry = getGuideBacklog("en").find((entry) => entry.slug === slug);
  const nlEntry = getGuideBacklog("nl").find((entry) => entry.slug === slug);

  if (!enEntry || !nlEntry) {
    throw new Error(`Missing bilingual backlog entry for slug: ${slug}`);
  }

  const bodyEn = buildSeedBody(enEntry, "en");
  const bodyNl = buildSeedBody(nlEntry, "nl");
  const faqsEn = buildFaqs(enEntry, "en");
  const faqsNl = buildFaqs(nlEntry, "nl");

  return {
    slug,
    path: `/guides/${slug}`,
    cluster: enEntry.cluster,
    status: "published",
    pageTitle: { en: enEntry.pageTitle, nl: nlEntry.pageTitle },
    h1: { en: enEntry.h1, nl: nlEntry.h1 },
    metaTitle: { en: enEntry.metaTitle, nl: nlEntry.metaTitle },
    metaDescription: { en: enEntry.pageBrief, nl: nlEntry.pageBrief },
    pageBrief: { en: enEntry.pageBrief, nl: nlEntry.pageBrief },
    body: { en: bodyEn, nl: bodyNl },
    faqs: { en: faqsEn, nl: faqsNl },
    quickAnswer: {
      en: buildQuickAnswer(enEntry, "en"),
      nl: buildQuickAnswer(nlEntry, "nl"),
    },
    libraryBody: {
      en: renderLibraryBody(enEntry, "en", bodyEn, faqsEn),
      nl: renderLibraryBody(nlEntry, "nl", bodyNl, faqsNl),
    },
    relatedGuides: enEntry.internalLinkTargets.map(stripGuidePrefix),
    primaryCtaTarget: enEntry.primaryCtaTarget,
    primaryCtaLabel: {
      en: enEntry.primaryCtaLabel,
      nl: nlEntry.primaryCtaLabel,
    },
    robotsIndex: true,
    tableOfContents: false,
    publishedAt: now,
    lastUpdatedAt: now,
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
}

async function main() {
  const { dryRun } = parseArgs(process.argv);
  const now = Date.now();
  const uniqueSlugs = Array.from(new Set(getGuideBacklog("en").map((entry) => entry.slug)));
  const records = uniqueSlugs.map((slug) => buildSeedRecord(slug, now));

  for (const record of records) {
    const summary = {
      slug: record.slug,
      cluster: record.cluster,
      path: record.path,
      relatedGuides: record.relatedGuides.length,
      bodySectionsEn: record.body.en.length,
      bodySectionsNl: record.body.nl.length,
      faqsEn: record.faqs.en.length,
      faqsNl: record.faqs.nl.length,
      mode: dryRun ? "dry-run" : "write-not-implemented",
    };
    console.log(JSON.stringify(summary));
  }

  if (!dryRun) {
    throw new Error(
      "Write mode is not implemented in this repository yet. Use --dry-run to validate the seed payload."
    );
  }

  console.log(
    JSON.stringify({
      total: records.length,
      created: 0,
      skipped: 0,
      errors: 0,
      dryRun: true,
    })
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
