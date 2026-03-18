import type { Locale } from "@/i18n/config";
import type { RelatedLink } from "@/components/seo/RelatedLinksSection";

type RelatedKey =
  | "saddle-height"
  | "frame-size"
  | "crank-length"
  | "bike-fit"
  | "tire-pressure";

const RELATED_LINKS: Record<RelatedKey, Record<Locale, RelatedLink[]>> = {
  "saddle-height": {
    en: [
      { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
      { href: "/calculators/frame-size", label: "Frame Size Calculator" },
      { href: "/guides/road-bike-fit-guide", label: "Road Bike Fit Guide" },
      { href: "/use-cases/back-pain-cycling", label: "Bike Fit for Lower Back Pain" },
    ],
    nl: [
      { href: "/calculators/bike-fit", label: "Bike fit calculator" },
      { href: "/calculators/frame-size", label: "Framemaat calculator" },
      { href: "/guides/road-bike-fit-guide", label: "Racefiets fit gids" },
      { href: "/use-cases/back-pain-cycling", label: "Bikefit bij lage rugklachten" },
    ],
  },
  "frame-size": {
    en: [
      { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
      { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
      { href: "/guides/gravel-bike-fit-guide", label: "Gravel Bike Fit Guide" },
      { href: "/use-cases/tall-rider-bike-fit", label: "Bike Fit for Tall Riders" },
    ],
    nl: [
      { href: "/calculators/bike-fit", label: "Bike fit calculator" },
      { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
      { href: "/guides/gravel-bike-fit-guide", label: "Gravel fit gids" },
      { href: "/use-cases/tall-rider-bike-fit", label: "Bikefit voor lange rijders" },
    ],
  },
  "crank-length": {
    en: [
      { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
      { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
      { href: "/guides/mountain-bike-fit-guide", label: "Mountain Bike Fit Guide" },
      { href: "/use-cases/mountain-cycling-fit", label: "Bike Fit for Mountain Biking" },
    ],
    nl: [
      { href: "/calculators/bike-fit", label: "Bike fit calculator" },
      { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
      { href: "/guides/mountain-bike-fit-guide", label: "MTB fit gids" },
      { href: "/use-cases/mountain-cycling-fit", label: "Bikefit voor mountainbiken" },
    ],
  },
  "bike-fit": {
    en: [
      { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
      { href: "/calculators/frame-size", label: "Frame Size Calculator" },
      { href: "/guides/road-bike-fit-guide", label: "Road Bike Fit Guide" },
      { href: "/use-cases/endurance-cycling-fit", label: "Bike Fit for Endurance Cyclists" },
    ],
    nl: [
      { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
      { href: "/calculators/frame-size", label: "Framemaat calculator" },
      { href: "/guides/road-bike-fit-guide", label: "Racefiets fit gids" },
      { href: "/use-cases/endurance-cycling-fit", label: "Bikefit voor duurrijders" },
    ],
  },
  "tire-pressure": {
    en: [
      { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
      { href: "/guides/gravel-bike-fit-guide", label: "Gravel Bike Fit Guide" },
      { href: "/guides/mountain-bike-fit-guide", label: "Mountain Bike Fit Guide" },
      { href: "/use-cases/gravel-cycling-fit", label: "Bike Fit for Gravel Riding" },
    ],
    nl: [
      { href: "/calculators/bike-fit", label: "Bike fit calculator" },
      { href: "/guides/gravel-bike-fit-guide", label: "Gravel fit gids" },
      { href: "/guides/mountain-bike-fit-guide", label: "MTB fit gids" },
      { href: "/use-cases/gravel-cycling-fit", label: "Bikefit voor gravelrijden" },
    ],
  },
};

export function getRelatedLinks(key: RelatedKey, locale: Locale): RelatedLink[] {
  return RELATED_LINKS[key][locale];
}
