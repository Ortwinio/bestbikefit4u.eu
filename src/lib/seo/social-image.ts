import { BRAND } from "@/config/brand";
import images from "./social-images.json";

/** Only map owned local assets; preserve external CMS image URLs and their metadata. */
export function socialImage(source: string, alt: string) {
  const parsed = new URL(source, BRAND.siteUrl);
  const owned = parsed.origin === new URL(BRAND.siteUrl).origin;
  const entry = owned ? (images as Record<string, {
    path: string; width: number; height: number;
  }>)[parsed.pathname] : undefined;
  return entry
    ? { url: new URL(entry.path, BRAND.siteUrl).href, width: entry.width, height: entry.height, alt }
    : { url: source, alt };
}

export const DEFAULT_SOCIAL_IMAGE = {
  url: BRAND.assets.socialImage, width: 1200, height: 630, alt: BRAND.name,
};
