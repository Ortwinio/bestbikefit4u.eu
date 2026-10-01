import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import RetiredBikeImportPage from "./page";
import NewBikePage from "../../new/page";

const { getRequestLocale } = vi.hoisted(() => ({
  getRequestLocale: vi.fn(),
}));
vi.mock("@/i18n/request", () => ({ getRequestLocale }));
beforeEach(() => vi.clearAllMocks());

describe("retired import route", () => {
  it.each(["nl", "en"])("permanently redirects to the %s bike chooser", async (locale) => {
    getRequestLocale.mockResolvedValue(locale);
    await expect(RetiredBikeImportPage()).rejects.toMatchObject({
      digest: `NEXT_REDIRECT;replace;/${locale}/bikes/new;308;`,
    });
  });
  it.each(["nl", "en"])("keeps only manual and passport choices in %s", async (locale) => {
    getRequestLocale.mockResolvedValue(locale);
    const html = renderToStaticMarkup(await NewBikePage());
    expect(html.match(/href="[^"]+"/g)).toEqual([
      `href="/${locale}/bikes/new/manual"`,
      `href="/${locale}/bikes/import/passport"`,
    ]);
  });
});
