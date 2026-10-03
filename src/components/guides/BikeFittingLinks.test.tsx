// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RewrittenGuide } from "./RewrittenGuide";
import { listGuideRewrites } from "@/lib/guides/rewrites";
import { bikeFittingLinks } from "@/i18n/marketing/bikeFittingLinks";
vi.mock("@/components/seo/JsonLd", () => ({ JsonLd: () => null }));

describe("canonical bike-fitting internal source pages", () => {
  it.each(["nl", "en"] as const)("renders contextual direct links on at least five real guides in %s", locale => {
    const destination = locale === "nl" ? "/nl/bikefitting" : "/en/bike-fitting";
    const sources = new Set<string>();
    for (const guide of listGuideRewrites()) {
      const doc = new DOMParser().parseFromString(renderToStaticMarkup(<RewrittenGuide guide={guide} locale={locale} />), "text/html");
      const contextual = [...doc.querySelectorAll("#guide-content a")]
        .find(link => link.textContent === bikeFittingLinks[locale].guideLink);
      expect(contextual?.getAttribute("href")).toBe(destination);
      expect(doc.querySelector("h1")?.textContent).toBeTruthy();
      sources.add(`/${locale}/guides/${guide.slug}`);
    }
    expect(sources.size).toBeGreaterThanOrEqual(5);
  });
});
