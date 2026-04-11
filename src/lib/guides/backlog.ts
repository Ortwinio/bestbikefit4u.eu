import { readFileSync } from "node:fs";
import path from "node:path";
import type { Locale } from "@/i18n/config";

export type GuideBacklogEntry = {
  order: number;
  cluster: string;
  status: string;
  path: string;
  slug: string;
  pageTitle: string;
  metaTitle: string;
  h1: string;
  pageBrief: string;
  primaryCtaLabel: string;
  primaryCtaTarget: string;
  internalLinkTargets: string[];
  notes: string;
};

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentCell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }

      currentRow.push(currentCell);
      currentCell = "";
      if (currentRow.some((value) => value.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      continue;
    }

    currentCell += char;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows;
}

function getCsvPath(locale: Locale) {
  return path.join(
    process.cwd(),
    "docs",
    `bestbikefit4u_guides_cms_backlog_v1_${locale}.csv`
  );
}

function loadGuideBacklog(locale: Locale): GuideBacklogEntry[] {
  const rows = parseCsv(readFileSync(getCsvPath(locale), "utf8"));
  const [, ...dataRows] = rows;

  return dataRows.map((row) => ({
    order: Number(row[0]),
    cluster: row[1],
    status: row[2],
    path: row[3].replace(/^\/(en|nl)/, ""),
    slug: row[4].replace(/^guides\//, ""),
    pageTitle: row[5],
    metaTitle: row[6],
    h1: row[7],
    pageBrief: row[8],
    primaryCtaLabel: row[9],
    primaryCtaTarget: row[10].replace(/^\/(en|nl)/, ""),
    internalLinkTargets: row[11]
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.replace(/^\/(en|nl)/, "")),
    notes: row[12] ?? "",
  }));
}

const CACHE: Partial<Record<Locale, GuideBacklogEntry[]>> = {};

export function getGuideBacklog(locale: Locale): GuideBacklogEntry[] {
  if (!CACHE[locale]) {
    CACHE[locale] = loadGuideBacklog(locale);
  }

  return CACHE[locale] ?? [];
}

export function getGuideEntryBySlug(
  slug: string,
  locale: Locale
): GuideBacklogEntry | undefined {
  return getGuideBacklog(locale).find((entry) => entry.slug === slug);
}

export function getGuideChildren(clusterPageSlug: string, locale: Locale) {
  const entries = getGuideBacklog(locale);
  const clusterEntry = entries.find((entry) => entry.slug === clusterPageSlug);

  if (!clusterEntry) {
    return [];
  }

  return entries.filter(
    (entry) =>
      entry.order > clusterEntry.order &&
      entry.cluster === clusterEntry.cluster &&
      entry.path.startsWith("/guides/") &&
      entry.slug !== clusterPageSlug
  );
}

export function getGuideLeafEntries(locale: Locale) {
  return getGuideBacklog(locale).filter(
    (entry) => entry.path.startsWith("/guides/") && entry.slug !== "guides"
  );
}

