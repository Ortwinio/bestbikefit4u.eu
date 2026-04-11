import type { Locale } from "@/i18n/config";
import type { RelatedLink } from "@/components/seo/RelatedLinksSection";

type RelatedKey =
  | "gearing"
  | "saddle-height"
  | "saddle-width"
  | "frame-size"
  | "crank-length"
  | "bike-fit"
  | "tire-pressure";

const RELATED_LINKS: Record<RelatedKey, Record<Locale, RelatedLink[]>> = {
  gearing: {
    en: [
      { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
      { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
      { href: "/calculators/saddle-width", label: "Saddle Width Calculator" },
      { href: "/guides/power-ftp-pacing", label: "Power, FTP & Pacing Guides" },
      { href: "/guides/climb-time-and-event-pacing-guide", label: "Climb Time & Event Pacing Guide" },
    ],
    nl: [
      { href: "/calculators/bike-fit", label: "Bike fit calculator" },
      { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
      { href: "/calculators/saddle-width", label: "Zadelbreedtecalculator" },
      { href: "/guides/power-ftp-pacing", label: "Power-, FTP- en pacinggidsen" },
      { href: "/guides/climb-time-and-event-pacing-guide", label: "Klimtijd- en eventpacinggids" },
    ],
  },
  "saddle-height": {
    en: [
      { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
      { href: "/calculators/saddle-width", label: "Saddle Width Calculator" },
      { href: "/calculators/frame-size", label: "Frame Size Calculator" },
      { href: "/guides/road-bike-fit-guide", label: "Road Bike Fit Guide" },
      { href: "/guides/bike-fitting-for-lower-back-pain", label: "Bike Fitting for Lower Back Pain" },
    ],
    nl: [
      { href: "/calculators/bike-fit", label: "Bike fit calculator" },
      { href: "/calculators/saddle-width", label: "Zadelbreedtecalculator" },
      { href: "/calculators/frame-size", label: "Framemaat calculator" },
      { href: "/guides/road-bike-fit-guide", label: "Racefiets fit gids" },
      { href: "/guides/bike-fitting-for-lower-back-pain", label: "Bikefitting bij lage rugklachten" },
    ],
  },
  "saddle-width": {
    en: [
      { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
      { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
      { href: "/calculators/frame-size", label: "Frame Size Calculator" },
      { href: "/faq", label: "FAQ" },
      { href: "/measurement-guide", label: "Measurement Guide" },
    ],
    nl: [
      { href: "/calculators/bike-fit", label: "Bike fit calculator" },
      { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
      { href: "/calculators/frame-size", label: "Framemaat calculator" },
      { href: "/faq", label: "FAQ" },
      { href: "/measurement-guide", label: "Meetgids" },
    ],
  },
  "frame-size": {
    en: [
      { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
      { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
      { href: "/guides/gravel-bike-fit-guide", label: "Gravel Bike Fit Guide" },
      { href: "/guides/bike-fit-for-tall-riders", label: "Bike Fit for Tall Riders" },
    ],
    nl: [
      { href: "/calculators/bike-fit", label: "Bike fit calculator" },
      { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
      { href: "/guides/gravel-bike-fit-guide", label: "Gravel fit gids" },
      { href: "/guides/bike-fit-for-tall-riders", label: "Bikefit voor lange rijders" },
    ],
  },
  "crank-length": {
    en: [
      { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
      { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
      { href: "/guides/mountain-bike-fit-guide", label: "Mountain Bike Fit Guide" },
      { href: "/guides/crank-length-guide", label: "Crank Length Guide" },
    ],
    nl: [
      { href: "/calculators/bike-fit", label: "Bike fit calculator" },
      { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
      { href: "/guides/mountain-bike-fit-guide", label: "MTB fit gids" },
      { href: "/guides/crank-length-guide", label: "Cranklengte gids" },
    ],
  },
  "bike-fit": {
    en: [
      { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
      { href: "/calculators/saddle-width", label: "Saddle Width Calculator" },
      { href: "/calculators/frame-size", label: "Frame Size Calculator" },
      { href: "/guides/road-bike-fit-guide", label: "Road Bike Fit Guide" },
      { href: "/guides/endurance-bike-fit-guide", label: "Endurance Bike Fit Guide" },
    ],
    nl: [
      { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
      { href: "/calculators/saddle-width", label: "Zadelbreedtecalculator" },
      { href: "/calculators/frame-size", label: "Framemaat calculator" },
      { href: "/guides/road-bike-fit-guide", label: "Racefiets fit gids" },
      { href: "/guides/endurance-bike-fit-guide", label: "Endurance fit gids" },
    ],
  },
  "tire-pressure": {
    en: [
      { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
      { href: "/guides/gravel-bike-fit-guide", label: "Gravel Bike Fit Guide" },
      { href: "/guides/mountain-bike-fit-guide", label: "Mountain Bike Fit Guide" },
      { href: "/guides/road-bike-fit-guide", label: "Road Bike Fit Guide" },
    ],
    nl: [
      { href: "/calculators/bike-fit", label: "Bike fit calculator" },
      { href: "/guides/gravel-bike-fit-guide", label: "Gravel fit gids" },
      { href: "/guides/mountain-bike-fit-guide", label: "MTB fit gids" },
      { href: "/guides/road-bike-fit-guide", label: "Racefiets fit gids" },
    ],
  },
};

export function getRelatedLinks(key: RelatedKey, locale: Locale): RelatedLink[] {
  return RELATED_LINKS[key][locale];
}
