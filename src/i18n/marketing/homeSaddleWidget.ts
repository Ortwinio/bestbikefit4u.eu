import type { Locale } from "@/i18n/config";

type HomeSaddleWidgetCopy = {
  try: string;
  title: string;
  height: string;
  heightHelp: string;
  basis: string;
  refine: string;
  nextStep: string;
};

export const homeSaddleWidget: Record<Locale, HomeSaddleWidgetCopy> = {
  nl: {
    try: "Schuif naar jouw maat",
    title: "Startpunt voor je zadel",
    height: "Lengte",
    heightHelp: "Je lichaamslengte zonder schoenen. We schatten je binnenbeenlengte op basis van je lengte.",
    basis: "Berekend voor een racefiets, op basis van je lengte.",
    refine: "Verfijn je zadelhoogte",
    nextStep: "Vul je binnenbeenlengte in → ±{mm} mm",
  },
  en: {
    try: "Slide to your size",
    title: "Your saddle starting point",
    height: "Height",
    heightHelp: "Your body height without shoes. We estimate your inseam from your height.",
    basis: "Calculated for a road bike, based on your height.",
    refine: "Refine your saddle height",
    nextStep: "Add your inseam → ±{mm} mm",
  },
};
