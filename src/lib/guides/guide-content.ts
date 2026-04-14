import { PAIN_DISCOMFORT_GUIDE_CONTENT } from "./content/pain-discomfort";
import { REMAINING_CLUSTERS_GUIDE_CONTENT } from "./content/remaining-clusters";
import { RIDE_TYPES_GUIDE_CONTENT } from "./content/ride-types";
import { SETUP_PARAMETERS_GUIDE_CONTENT } from "./content/setup-parameters";
import { SHOE_FOOT_GEOMETRY_GUIDE_CONTENT } from "./content/shoe-foot-geometry";

export type GuideContentSection = {
  title: string;
  type?: "cards" | "steps" | "prose" | "table";
  items: string[];
  tableHeaders?: string[];
  tableRows?: string[][];
};

export type GuideContentFaq = {
  q: string;
  a: string;
};

export type GuideContentLocale = {
  heroIntro?: string;
  ctaDescription?: string;
  intro: string[];
  sections: GuideContentSection[];
  faqs: GuideContentFaq[];
};

export type GuideContent = {
  en: GuideContentLocale;
  nl: GuideContentLocale;
};

export type GuideContentRecord = Record<string, GuideContent>;

export const GUIDE_CONTENT: GuideContentRecord = {
  ...PAIN_DISCOMFORT_GUIDE_CONTENT,
  ...RIDE_TYPES_GUIDE_CONTENT,
  ...SETUP_PARAMETERS_GUIDE_CONTENT,
  ...SHOE_FOOT_GEOMETRY_GUIDE_CONTENT,
  ...REMAINING_CLUSTERS_GUIDE_CONTENT,
};

export function getGuideContent(slug: string): GuideContent | undefined {
  return GUIDE_CONTENT[slug];
}
