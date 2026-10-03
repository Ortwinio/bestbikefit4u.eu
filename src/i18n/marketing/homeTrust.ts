import type { Locale } from "@/i18n/config";

type HomeTrustCopy = {
  note: string;
  stats: { value: string; label: string }[];
  principle: { title: string; context: string; text: string };
  title: string;
  cards: { label: string; text: string; title: string; context: string }[];
};

export const homeTrust: Record<Locale, HomeTrustCopy> = {
  nl: {
    note: "Begin met je maten. Verfijn op de fiets.",
    stats: [
      { value: "Meet", label: "je eigen maten" },
      { value: "Test", label: "je afstelling" },
      { value: "Gratis", label: "om te starten" },
    ],
    principle: {
      title: "Een startpunt, geen garantie",
      context: "Van meten naar uitproberen",
      text: "Verander één instelling tegelijk. Controleer hoe je zit en beweegt tijdens het fietsen.",
    },
    title: "Maak je volgende aanpassing bewust",
    cards: [
      {
        label: "Zadelpositie",
        text: "Noteer je huidige zadelstand voordat je iets verandert. Zo kun je een aanpassing terugdraaien.",
        title: "Bewaar je uitgangspunt",
        context: "Hoogte, terugstand en kanteling",
      },
      {
        label: "Stuurpositie",
        text: "Controleer of je ontspannen bij het stuur kunt. Verander niet tegelijk je zadel en je cockpit.",
        title: "Beoordeel het geheel",
        context: "Reach en drop samen bekeken",
      },
      {
        label: "Proefrit",
        text: "Probeer je afstelling op een vertrouwde route. Laat aanhoudende klachten beoordelen door een professional.",
        title: "Evalueer onderweg",
        context: "Online advies is een startpunt",
      },
    ],
  },
  en: {
    note: "Start with your measurements. Refine on the bike.",
    stats: [
      { value: "Measure", label: "your own dimensions" },
      { value: "Test", label: "your setup" },
      { value: "Free", label: "to start" },
    ],
    principle: {
      title: "A starting point, not a guarantee",
      context: "From measuring to testing",
      text: "Change one setting at a time. Check how you sit and move while riding.",
    },
    title: "Make your next adjustment deliberately",
    cards: [
      {
        label: "Saddle position",
        text: "Record your current saddle position before changing it. That lets you undo an adjustment.",
        title: "Keep your starting point",
        context: "Height, setback and tilt",
      },
      {
        label: "Handlebar position",
        text: "Check whether you can reach the bars comfortably. Avoid changing your saddle and cockpit together.",
        title: "Consider the whole position",
        context: "Reach and drop together",
      },
      {
        label: "Test ride",
        text: "Try your setup on a familiar route. Have persistent discomfort assessed by a professional.",
        title: "Review while riding",
        context: "Online advice is a starting point",
      },
    ],
  },
};
