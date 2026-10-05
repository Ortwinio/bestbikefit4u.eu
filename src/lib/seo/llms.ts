import { BRAND } from "@/config/brand";
import { isLocale, SUPPORTED_LOCALES } from "@/i18n/config";
import { llmsCopy } from "@/i18n/marketing/llms";
import { getLlmsContent } from "./llmsContent";
import { dedupeAndSortNodes } from "./sitemap/filters";
import { getBlogSitemapNodes, getGuideSitemapNodes, getSitemapNodes } from "./sitemap/sources";

function markdownLabel(value: string): string {
  return value.replace(/[\\[\]]/g, "\\$&").replace(/\s+/g, " ").trim();
}

/** The sitemap APIs own route discovery, aliases, exclusions and CMS timeout fallbacks. */
export async function generateLlmsDocument(full: boolean): Promise<string> {
  const [guides, blog] = await Promise.all([getGuideSitemapNodes(), getBlogSitemapNodes()]);
  const nodes = dedupeAndSortNodes([
    ...getSitemapNodes("pages"), ...getSitemapNodes("calculators"), ...guides, ...blog,
  ]);
  const entries = nodes.flatMap(node => {
    const url = new URL(node.loc);
    const [, locale, ...segments] = url.pathname.split("/");
    if (url.origin !== BRAND.siteUrl || !isLocale(locale) || url.search || url.hash) return [];
    const content = getLlmsContent(`/${segments.join("/")}`, locale);
    return [{ locale, url: node.loc, content }];
  });
  const lines = [`# ${BRAND.name}`, "", `> ${llmsCopy.en.intro}`, `> ${llmsCopy.nl.intro}`, ""];
  for (const locale of SUPPORTED_LOCALES) {
    lines.push(`## ${locale === "nl" ? "Nederlands" : "English"}`, "");
    const copy = llmsCopy[locale];
    lines.push(copy.pages.pricing.summary, "");
    for (const entry of entries.filter(entry => entry.locale === locale)) {
      const { title, answer, method, limits } = entry.content;
      if (!full) {
        lines.push(`- [${markdownLabel(title)}](${entry.url})`);
        continue;
      }
      lines.push(`### [${markdownLabel(title)}](${entry.url})`, "", `${copy.answer}: ${answer}`, "");
      if (method) lines.push(`${copy.method}: ${method}`, "");
      if (limits) lines.push(`${copy.limits}: ${limits}`, "");
    }
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}
