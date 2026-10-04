import { BRAND } from "@/config/brand";
import { LEGACY_SITE_HOST_PATTERN } from "../../shared/brand";

const protectedBrandTokens = new RegExp(
  String.raw`(?:https?:\/\/|mailto:)[^\s<>"']+|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|${LEGACY_SITE_HOST_PATTERN}(?:\/[^\s<>"']*)?|\bBestBikeFit4U\b`,
  "gi",
);

export function currentBrandCopy(value: string): string {
  return value.replace(
    protectedBrandTokens,
    (match) => /^bestbikefit4u$/i.test(match) ? BRAND.name : match,
  );
}

function normalizeCopy(value: unknown): unknown {
  if (typeof value === "string") return currentBrandCopy(value);
  if (Array.isArray(value)) return value.map(normalizeCopy);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeCopy(item)]));
  }
  return value;
}

const COPY_FIELDS = new Set([
  "pageTitle", "title", "h1", "metaTitle", "metaDescription", "pageBrief", "primaryCtaLabel",
  "body", "libraryBody", "faqs", "quickAnswer", "featuredImageAlt", "ogTitle", "ogDescription", "ogImageAlt",
]);

export function currentBrandGuide<RecordType extends object>(record: RecordType): RecordType {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [
    key, COPY_FIELDS.has(key) ? normalizeCopy(value) : value,
  ])) as RecordType;
}
