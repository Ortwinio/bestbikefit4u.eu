import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { generateLlmsDocument } from "./llms";
import { getBlogSitemapNodes, getGuideSitemapNodes, getSitemapNodes } from "./sitemap/sources";
import { listGuideRewrites } from "@/lib/guides/rewrites";
import { PUBLIC_CALCULATOR_ROUTE_REGISTRY } from "@/lib/public-calculators/routes";
import { PRESSURE_BIKE_SLUGS } from "@/i18n/localeRoutes";
import { PAIN_PAGE_SLUGS } from "@/content/painPages";
import { getFitAnswer } from "./calculatorAnswers/fit";
import { getEquipmentAnswer } from "./calculatorAnswers/equipment";
import { getPerformanceAnswer } from "./calculatorAnswers/performance";

const cms = vi.hoisted(() => ({
  blog: [] as Record<string, unknown>[],
  guides: [] as Record<string, unknown>[],
  failing: false,
}));
vi.mock("server-only", () => ({}));
vi.mock("convex/nextjs", () => ({ fetchQuery: vi.fn(async (reference: Parameters<typeof getFunctionName>[0]) => {
  if (cms.failing) throw new Error("Synthetic unavailable CMS");
  const name = getFunctionName(reference);
  if (name === "blog/queries:listPublishedSlugs") return cms.blog;
  if (name === "guides/queries:listPublishedGuides") return cms.guides;
  throw new Error(`Unexpected query ${name}`);
}) }));

beforeEach(() => { cms.blog = []; cms.guides = []; cms.failing = false; });

const origin = "https://bikefitboost.com";
const performanceTools = ["power-speed", "climb-planner", "ftp-wkg", "fuel-hydration"] as const;
function publicUrls(document: string) {
  return [...new Set(document.match(/https:\/\/bikefitboost\.com\/(?:en|nl)(?=\/|[\s)<>]|$)[^\s)<>]*/g) ?? [])];
}
function plain(value: string) {
  return value.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`]/g, "").replace(/\s+/g, " ").trim();
}
async function expectedSitemapUrls() {
  return [...getSitemapNodes("pages"), ...getSitemapNodes("calculators"),
    ...await getGuideSitemapNodes(), ...await getBlogSitemapNodes()].map((node) => node.loc);
}

describe("generated LLM discovery documents", () => {
  it.each([false, true])("includes every public sitemap URL (full=%s)", async (full) => {
    const actual = new Set(publicUrls(await generateLlmsDocument(full)));
    const expected = await expectedSitemapUrls();
    expect(expected.length).toBeGreaterThan(100);
    expect(expected.filter((url) => !actual.has(url))).toEqual([]);
    expect([...actual].filter((url) => !expected.includes(url))).toEqual([]);
  });

  it.each([false, true])("covers eleven calculators per locale and all 48 guide articles (full=%s)", async (full) => {
    const urls = new Set(publicUrls(await generateLlmsDocument(full)));
    const guides = listGuideRewrites();
    expect(guides).toHaveLength(48);
    for (const locale of ["en", "nl"] as const) {
      const calculatorPaths = [...Object.values(PUBLIC_CALCULATOR_ROUTE_REGISTRY).map((entry) => entry.localizedPaths[locale]),
        ...performanceTools.map((tool) => `/calculators/${tool}`)];
      expect(new Set(calculatorPaths).size).toBe(11);
      for (const path of calculatorPaths) expect(urls.has(`${origin}/${locale}${path}`), path).toBe(true);
      for (const guide of guides) expect(urls.has(`${origin}/${locale}/guides/${guide.slug}`), guide.slug).toBe(true);
      for (const path of ["/science/bike-fit-methods", "/science/stack-and-reach", "/authors/ortwin-verreck", "/methods", "/pain"]) {
        expect(urls.has(`${origin}/${locale}${path}`), path).toBe(true);
      }
      for (const slug of PAIN_PAGE_SLUGS) expect(urls.has(`${origin}/${locale}/pain/${slug}`), slug).toBe(true);
    }
    for (const [dutch, english] of Object.entries(PRESSURE_BIKE_SLUGS)) {
      expect(urls.has(`${origin}/nl/bandenspanning/${dutch}`)).toBe(true);
      expect(urls.has(`${origin}/en/tire-pressure/${english}`)).toBe(true);
    }
  });

  it.each([false, true])("uses canonical locale aliases without private, query or legacy weight URLs (full=%s)", async (full) => {
    const document = await generateLlmsDocument(full);
    const urls = publicUrls(document);
    expect(urls).toContain(`${origin}/en/tire-pressure-calculator`);
    expect(urls).toContain(`${origin}/nl/bandenspanning-calculator`);
    expect(urls).toContain(`${origin}/en/bike-fitting`);
    expect(urls).toContain(`${origin}/nl/bikefitting`);
    const internalUrls = document.match(/https:\/\/bikefitboost\.com(?:\/[^\s)<>]*)?/g) ?? [];
    for (const url of internalUrls) {
      const parsed = new URL(url);
      expect(parsed.search).toBe("");
      expect(parsed.hash).toBe("");
      expect(parsed.pathname).not.toMatch(/^\/(?:(?:en|nl)\/)?(?:login|dashboard|admin|profile|bikes|tools|settings|fit-history|gearing)(?:\/|$)/);
      expect(parsed.pathname).not.toMatch(/\/(?:bandenspanning|tire-pressure)\/\d+kg-/);
      expect(parsed.pathname).not.toMatch(/^\/(?:en\/bandenspanning-calculator|nl\/tire-pressure-calculator|en\/bikefitting|nl\/bike-fitting)$/);
      expect(parsed.pathname).not.toMatch(/\/calculators\/tire-pressure$/);
    }
  });

  it.each([false, true])("includes dynamic-only guide and blog sitemap nodes (full=%s)", async (full) => {
    cms.guides = [{ slug: "s8-cms-only-guide", path: "/guides/s8-cms-only-guide", lastUpdatedAt: Date.UTC(2026, 9, 1) }];
    cms.blog = [{ slug: "s8-cms-only-post", updatedAt: Date.UTC(2026, 9, 2) }];
    const urls = new Set(publicUrls(await generateLlmsDocument(full)));
    for (const locale of ["nl", "en"]) {
      expect(urls.has(`${origin}/${locale}/guides/s8-cms-only-guide`)).toBe(true);
      expect(urls.has(`${origin}/${locale}/blog/s8-cms-only-post`)).toBe(true);
    }
  });

  it.each([false, true])("retains complete static coverage when shared CMS sources fail (full=%s)", async (full) => {
    const empty = await generateLlmsDocument(full);
    cms.failing = true;
    const fallback = await generateLlmsDocument(full);
    expect(publicUrls(fallback).sort()).toEqual(publicUrls(empty).sort());
    expect(fallback).not.toContain("Synthetic unavailable CMS");
    expect(publicUrls(fallback)).toContain(`${origin}/en/guides/${listGuideRewrites()[0].slug}`);
  });

  it("grounds full guide answers in the existing localized authored content", async () => {
    const full = plain(await generateLlmsDocument(true));
    for (const guide of listGuideRewrites()) for (const locale of ["nl", "en"] as const) {
      expect(full, `${locale}/${guide.slug}`).toContain(plain(guide[locale].quickAnswer));
    }
  });

  it("grounds all full calculator answers in the existing engine-backed answer builders", async () => {
    const full = plain(await generateLlmsDocument(true));
    for (const locale of ["nl", "en"] as const) {
      const answers = [
        ...(["bike-fit", "saddle-height", "frame-size", "crank-length"] as const).map((tool) => getFitAnswer(tool, locale)),
        ...(["saddle-width", "gearing", "tire-pressure"] as const).map((tool) => getEquipmentAnswer(tool, locale)),
        ...performanceTools.map((tool) => getPerformanceAnswer(tool, locale)),
      ];
      for (const answer of answers) expect(full).toContain(plain(answer.answer));
    }
  });
});


it("publishes current bilingual prices and eligibility in both machine-readable documents", async () => {
  for (const full of [false, true]) {
    const document = await generateLlmsDocument(full);
    for (const amount of ["€21,50", "€21.50", "€9,50", "€9.50", "€209,50", "€209.50", "€234,50", "€234.50"]) {
      expect(document).toContain(amount);
    }
    expect(document).toContain("2 cadeaumetingen per abonnementsjaar");
    expect(document).toContain("six months");
    expect(document).not.toMatch(/€24[,.]50|€19[,.]50|€5 korting|annual_entry|Pro monthly/);
  }
});

it("deduplicates shared static/CMS guide nodes and produces deterministic discovery output", async () => {
  const guide = listGuideRewrites()[0];
  cms.guides = [{ slug: guide.slug, path: `/guides/${guide.slug}`, lastUpdatedAt: Date.UTC(2026, 9, 1) }];
  const first = await generateLlmsDocument(false);
  expect(await generateLlmsDocument(false)).toBe(first);
  const links = first.split("\n").filter(line => line.startsWith("- ["));
  const expected = await expectedSitemapUrls();
  expect(links).toHaveLength(new Set(expected).size);
  for (const locale of ["nl", "en"]) {
    expect(links.filter(line => line.endsWith(`(${origin}/${locale}/guides/${guide.slug})`))).toHaveLength(1);
  }
  expect(first.endsWith("\n")).toBe(true);
});
