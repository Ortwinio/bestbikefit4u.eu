import type { Metadata } from "next";
import { BRAND } from "@/config/brand";
import { getRequestLocale } from "@/i18n/request";
import { getSiteMetadataCopy } from "@/i18n/marketing/siteMetadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  if (locale === "en") return {};
  const { appTitle: title, appDescription: description } = getSiteMetadataCopy(locale);
  return {
    title, description,
    openGraph: { title, description, locale: "nl_NL", images: [BRAND.assets.socialImage] },
    twitter: { title, description, card: "summary_large_image", images: [BRAND.assets.socialImage] },
  };
}

export default function AppInstallLayout({ children }: { children: React.ReactNode }) {
  return children;
}
