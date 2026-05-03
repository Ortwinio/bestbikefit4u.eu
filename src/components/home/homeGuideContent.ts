import type { Locale } from "@/i18n/config";

type GuideLink = {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
};

type Localized<T> = Record<Locale, T>;

export const HOME_GUIDE_LINKS: Localized<GuideLink[]> = {
  nl: [
    {
      href: "/guides/bike-fitting-for-knee-pain",
      icon: "heart-pulse",
      title: "Bikefitting bij kniepijn",
      subtitle: "Hoe zadelpositie en cleats knieklachten beïnvloeden.",
    },
    {
      href: "/guides/bike-fitting-for-lower-back-pain",
      icon: "activity",
      title: "Bikefitting bij lage rugklachten",
      subtitle: "Reach, drop en zadelhoek als oorzaak van rugpijn.",
    },
    {
      href: "/guides/road-bike-fit-guide",
      icon: "gauge",
      title: "Racefiets fit gids",
      subtitle: "Volledige fit van zadel tot stuur voor racefietsen.",
    },
    {
      href: "/guides/gravel-bike-fit-guide",
      icon: "mountain",
      title: "Gravel fit gids",
      subtitle: "Comfortabele positie voor lange gravelritten.",
    },
  ],
  en: [
    {
      href: "/guides/bike-fitting-for-knee-pain",
      icon: "heart-pulse",
      title: "Bike Fitting for Knee Pain",
      subtitle: "How saddle position and cleats affect knee issues.",
    },
    {
      href: "/guides/bike-fitting-for-lower-back-pain",
      icon: "activity",
      title: "Bike Fitting for Lower Back Pain",
      subtitle: "Reach, drop and saddle angle as sources of back pain.",
    },
    {
      href: "/guides/road-bike-fit-guide",
      icon: "gauge",
      title: "Road Bike Fit Guide",
      subtitle: "Full fit from saddle to handlebar for road bikes.",
    },
    {
      href: "/guides/gravel-bike-fit-guide",
      icon: "mountain",
      title: "Gravel Bike Fit Guide",
      subtitle: "Comfortable position for long gravel rides.",
    },
  ],
};

export const HOME_SCENARIO_LINKS: Localized<GuideLink[]> = {
  nl: [
    {
      href: "/guides/bike-fitting-for-lower-back-pain",
      icon: "person-standing",
      title: "Bikefit bij lage rugklachten",
      subtitle: "Veelgebruikte aanpassingen bij rugpijnklachten.",
    },
    {
      href: "/guides/gravel-bike-fit-guide",
      icon: "tree-pine",
      title: "Bikefit voor gravelrijden",
      subtitle: "Balans tussen comfort en controle op gravel.",
    },
    {
      href: "/guides/triathlon-bike-fit-guide",
      icon: "timer",
      title: "Bikefit voor triathlon",
      subtitle: "Aerodynamische positie die hardlopen niet blokkeert.",
    },
    {
      href: "/guides/bike-fit-for-tall-riders",
      icon: "arrow-up",
      title: "Bikefit voor lange rijders",
      subtitle: "Reach, staplengte en framekeuze voor boven 1m90.",
    },
  ],
  en: [
    {
      href: "/guides/bike-fitting-for-lower-back-pain",
      icon: "person-standing",
      title: "Bike Fit for Lower Back Pain",
      subtitle: "Common adjustments for back pain complaints.",
    },
    {
      href: "/guides/gravel-bike-fit-guide",
      icon: "tree-pine",
      title: "Bike Fit for Gravel Riding",
      subtitle: "Balance between comfort and control on gravel.",
    },
    {
      href: "/guides/triathlon-bike-fit-guide",
      icon: "timer",
      title: "Bike Fit for Triathlon",
      subtitle: "Aerodynamic position that doesn't block your run.",
    },
    {
      href: "/guides/bike-fit-for-tall-riders",
      icon: "arrow-up",
      title: "Bike Fit for Tall Riders",
      subtitle: "Reach, stack and frame choice for riders above 190cm.",
    },
  ],
};
