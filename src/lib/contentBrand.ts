import { BRAND } from "@/config/brand";

export function currentBrandCopy(value: string): string {
  return value.replace(
    /(?:https?:\/\/|mailto:)[^\s<>"']+|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|(?:www\.)?bestbikefit4u\.eu(?:\/[^\s<>"']*)?|\bBestBikeFit4U\b/gi,
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
