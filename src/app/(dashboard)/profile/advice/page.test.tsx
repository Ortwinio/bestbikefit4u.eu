import { describe, expect, it, vi } from "vitest";
import { advicePageCopy } from "@/i18n/account/advicePage";
import { BRAND } from "@/config/brand";
import AdvicePage, { generateMetadata } from "./page";
import { AdvicePageClient } from "./AdvicePageClient";

const state = vi.hoisted(() => ({ locale: "en" as "nl" | "en" }));
vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => state.locale }));
vi.mock("./AdvicePageClient", () => ({ AdvicePageClient: () => null }));

describe("advice page server boundary", () => {
  it.each(["nl", "en"] as const)("uses %s metadata with a canonical, noindex and no hreflang", async locale => {
    state.locale = locale;
    const metadata = await generateMetadata();
    expect(metadata.title).toBe(advicePageCopy[locale].title);
    expect(metadata.description).toBe(advicePageCopy[locale].description);
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates).toEqual({ canonical: `${BRAND.siteUrl}/${locale}/profile/advice` });
    expect(metadata.alternates?.languages).toBeUndefined();
    expect(metadata.openGraph).toEqual({ title: advicePageCopy[locale].title, description: advicePageCopy[locale].description });
  });

  it.each(["nl", "en"] as const)("passes request locale %s to the client without fixtures", async locale => {
    state.locale = locale;
    const page = await AdvicePage();
    expect(page.type).toBe(AdvicePageClient);
    expect(page.props).toEqual({ locale });
  });
});
