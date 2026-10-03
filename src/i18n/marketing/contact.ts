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
  responseNote: string;
  directContactBody: string;
  measurementText: string;
  measurementLink: string;
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
      { title: "Je fietstype", body: "Vertel op wat voor fiets je rijdt, bijvoorbeeld een racefiets, gravelbike of mountainbike. Noem het model en de framemaat als je die weet, en vermeld welke instelling je wilt controleren." },
      { title: "Je doel", body: "Beschrijf wat je met je bikefit wilt bereiken: prettiger zitten, langere ritten maken of je houding vergelijken. Vertel ook hoe lang je meestal fietst en wat je al aan je fiets hebt aangepast." },
      { title: "Je vraag", body: "Geef aan waar je vastloopt en welke calculator of pagina je gebruikt. Vermeld je ingevoerde maten met de eenheden en beschrijf wat je verwachtte. Bij een technisch probleem helpen de foutmelding, je browser en je apparaat." },
    ],
    responseTitle: "Wanneer hoor je van ons?",
    responseNote: "Deze termijnen zijn indicaties, geen gegarandeerde reactietijden. De benodigde tijd kan per vraag verschillen. Stuur aanvullende informatie in dezelfde e-mailwisseling, zodat de context bij elkaar blijft.",
    directContactBody: "Je kunt ons mailen over de calculators, je metingen, je account of een resultaat dat je niet begrijpt. Vermeld je fietstype, doel en waar je vastloopt. Deel alleen informatie die nodig is voor je vraag; stuur geen wachtwoorden of inlogcodes mee.",
    measurementText: "Twijfel je over een ingevoerde maat? Controleer eerst hoe je die opneemt. De meetgids legt uit hoe je je lichaamslengte en binnenbeenlengte meet, zodat je je vraag met de juiste maten kunt toelichten.",
    measurementLink: "Bekijk de meetgids voor lichaamsmaten",
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
      { title: "Your bike type", body: "Tell us what kind of bike you ride, such as a road bike, gravel bike or mountain bike. Include the model and frame size if you know them, and say which setting you want to check." },
      { title: "Your goal", body: "Describe what you want to achieve with your bike fit: feeling more comfortable, riding for longer or comparing your position. Tell us how long you usually ride and which adjustments you have already made." },
      { title: "Your question", body: "Tell us where you are stuck and which calculator or page you are using. Include your measurements with their units and explain what you expected. For a technical problem, include the error message, your browser and your device." },
    ],
    responseTitle: "When will you hear from us?",
    responseNote: "These times are estimates, not guaranteed response times. The time needed may vary with your question. Send any extra information in the same email thread so the context stays together.",
    directContactBody: "You can email us about the calculators, your measurements, your account or a result you do not understand. Include your bike type, goal, and where you are stuck. Share only information relevant to your question; do not send passwords or sign-in codes.",
    measurementText: "Unsure about a measurement you entered? Check how to take it first. The measurement guide explains how to measure your height and inseam, so you can describe your question with the right measurements.",
    measurementLink: "Read the body measurement guide",
    faqEyebrow: "Your answer might already be here",
    faqTitle: "Read the frequently asked questions.",
  },
};
