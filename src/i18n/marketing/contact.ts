import type { Locale } from "@/i18n/config";

type ContactPresentation = {
  eyebrow: string;
  title: string;
  titleEnd: string;
  languages: string;
  directEyebrow: string;
  contextEyebrow: string;
  contextTitle: string;
  steps: { title: string; body: string }[];
  responseTitle: string;
  faqEyebrow: string;
  faqTitle: string;
};

export const contactPresentation: Record<Locale, ContactPresentation> = {
  nl: {
    eyebrow: "We helpen je verder",
    title: "Een vraag?",
    titleEnd: "Mail ons.",
    languages: "Nederlands en Engels",
    directEyebrow: "Direct contact, zonder formulier",
    contextEyebrow: "Help ons je goed te helpen",
    contextTitle: "Vertel kort waar je staat.",
    steps: [
      { title: "Je fietstype", body: "Vertel op wat voor fiets je rijdt." },
      { title: "Je doel", body: "Beschrijf wat je met je bikefit wilt bereiken." },
      { title: "Je vraag", body: "Geef aan waar je vastloopt en waar je hulp bij nodig hebt." },
    ],
    responseTitle: "Wanneer hoor je van ons?",
    faqEyebrow: "Misschien staat je antwoord er al",
    faqTitle: "Bekijk de veelgestelde vragen.",
  },
  en: {
    eyebrow: "We can help",
    title: "A question?",
    titleEnd: "Email us.",
    languages: "Dutch and English",
    directEyebrow: "Direct contact, without a form",
    contextEyebrow: "Help us help you",
    contextTitle: "Tell us where you are.",
    steps: [
      { title: "Your bike type", body: "Tell us what kind of bike you ride." },
      { title: "Your goal", body: "Describe what you want to achieve with your bike fit." },
      { title: "Your question", body: "Tell us where you are stuck and what you need help with." },
    ],
    responseTitle: "When will you hear from us?",
    faqEyebrow: "Your answer might already be here",
    faqTitle: "Read the frequently asked questions.",
  },
};
