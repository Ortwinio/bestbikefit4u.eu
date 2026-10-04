import { Children, isValidElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BRAND } from "@/config/brand";
import RootLayout, { generateMetadata } from "./layout";
import { generateMetadata as appMetadata } from "./app/layout";
import { GET } from "./manifest.webmanifest/route";

const { requestLocale } = vi.hoisted(() => ({ requestLocale: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/i18n/request", () => ({ getRequestLocale: requestLocale }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/font/google", () => ({
  Bricolage_Grotesque: () => ({ variable: "display-font" }),
  Figtree: () => ({ variable: "body-font" }),
  DM_Mono: () => ({ variable: "mono-font" }),
}));
vi.mock("@convex-dev/auth/nextjs/server", () => ({
  ConvexAuthNextjsServerProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("./ConvexClientProvider", () => ({
  ConvexClientProvider: ({ children }: { children: ReactNode }) => children,
}));

beforeEach(() => { requestLocale.mockReset(); requestLocale.mockResolvedValue("en"); });

function findSchemas(node: ReactNode): unknown[] {
  if (!isValidElement<{ children?: ReactNode; type?: string; dangerouslySetInnerHTML?: { __html: string } }>(node)) return [];
  if (node.type === "script" && node.props.type === "application/ld+json") {
    return JSON.parse(node.props.dangerouslySetInnerHTML!.__html);
  }
  return Children.toArray(node.props.children).flatMap(findSchemas);
}

describe("site metadata language", () => {
  it.each([
    ["nl", "Nauwkeurige fietsafstelling voor comfort, een goede houding en prestaties."],
    ["en", "Precision bike fitting for comfort, alignment, and performance."],
  ])("uses %s for inherited metadata, social descriptions and JSON-LD", async (locale, description) => {
    requestLocale.mockResolvedValue(locale);
    const metadata = await generateMetadata();
    expect(metadata.title).toBe(BRAND.name);
    expect(metadata.description).toBe(description);
    expect(metadata.openGraph).toMatchObject({ description, locale: locale === "nl" ? "nl_NL" : "en_US" });
    expect(metadata.twitter).toMatchObject({ description, card: "summary_large_image" });
    expect(metadata.manifest).toBe("/site.webmanifest");
    const root = await RootLayout({ children: null });
    expect(findSchemas(root)).toContainEqual(expect.objectContaining({ "@type": "WebSite", description, inLanguage: locale }));
  });

  it("localizes the app page while preserving English metadata inheritance", async () => {
    requestLocale.mockResolvedValue("nl");
    expect(await appMetadata()).toMatchObject({
      title: "BikeFitBoost op je beginscherm",
      description: "Zet BikeFitBoost op je beginscherm. Open snel je dashboard en fietsafstelling.",
      openGraph: { title: "BikeFitBoost op je beginscherm", images: [BRAND.assets.socialImage] },
      twitter: { title: "BikeFitBoost op je beginscherm", images: [BRAND.assets.socialImage] },
    });
    requestLocale.mockResolvedValue("en");
    expect(await appMetadata()).toEqual({});
  });

  it.each(["nl", "en"])("serves an explicit %s manifest independently of cookies", async (locale) => {
    requestLocale.mockResolvedValue(locale === "nl" ? "en" : "nl");
    const response = await GET(new Request(`https://www.bikefitboost.com/manifest.webmanifest?locale=${locale}`));
    expect(response.headers.get("Content-Type")).toBe("application/manifest+json");
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(await response.json()).toMatchObject({
      id: "/", name: BRAND.name, lang: locale, start_url: `/${locale}`, scope: "/",
      description: locale === "nl"
        ? "Nauwkeurige fietsafstelling voor comfort, een goede houding en prestaties."
        : "Precision bike fitting for comfort, alignment, and performance.",
      icons: expect.arrayContaining([expect.objectContaining({ src: BRAND.assets.appIconMaskable, purpose: "maskable" })]),
    });
    expect(requestLocale).not.toHaveBeenCalled();
  });

  it.each(["", "?locale=unknown"])("keeps request-locale fallback for legacy manifest URLs %s", async (query) => {
    requestLocale.mockResolvedValue("nl");
    const response = await GET(new Request(`https://www.bikefitboost.com/manifest.webmanifest${query}`));
    expect(await response.json()).toMatchObject({ lang: "nl", start_url: "/nl" });
    expect(requestLocale).toHaveBeenCalledOnce();
  });
});
