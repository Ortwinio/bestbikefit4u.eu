export const LEGACY_USE_CASE_REDIRECTS: Record<string, string> = {
  "back-pain-cycling": "/guides/bike-fitting-for-lower-back-pain",
  "endurance-cycling-fit": "/guides/endurance-bike-fit-guide",
  "gravel-cycling-fit": "/guides/gravel-bike-fit-guide",
  "mountain-cycling-fit": "/guides/mountain-bike-fit-guide",
  "short-torso-bike-fit": "/guides/bike-fit-for-riders-with-a-shorter-torso",
  "tall-rider-bike-fit": "/guides/bike-fit-for-tall-riders",
  "triathlon-bike-fit": "/guides/triathlon-bike-fit-guide",
};

export const LEGACY_USE_CASE_FALLBACK = "/guides/ride-types";

export function getLegacyUseCaseRedirect(slug: string) {
  return LEGACY_USE_CASE_REDIRECTS[slug] ?? LEGACY_USE_CASE_FALLBACK;
}
