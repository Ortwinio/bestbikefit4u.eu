import type { Locale } from "@/i18n/config";

const nl = {
  metadata: {
    title: "Deel je praktijkvoorbeeld | BestBikeFit4U",
    description: "Deel je pijn- of comfortklachten op de fiets. Help ons praktijkvoorbeelden van fietsers te verzamelen.",
  },
  submissionError: "Je aanmelding is niet verstuurd. Probeer het opnieuw.",
  validation: {
    required: "Vul dit veld in.",
    email: "Vul een geldig e-mailadres in.",
    consent: "Geef toestemming voordat je je aanmeldt.",
  },
  eyebrow: "Rijders gezocht",
  title: "Deel jouw fietsverhaal.",
  intro: "Heb je terugkerende klachten of een uitdaging met je fietspositie? Deel je situatie. " +
    "We nemen contact op als jouw verhaal past bij een nieuwe publicatie of validatieronde.",
  join: "Meld je vrijblijvend aan",
  pain: "Bekijk klachten",
  pricing: "Bekijk prijzen",
  image: "Pentekening van een gravelfiets",
  whyEyebrow: "Waarom je verhaal telt",
  why: "Echte ervaringen geven context",
  whyIntro: "Je inzending helpt ons patronen, startsituaties en bruikbare vervolgvragen beter te begrijpen.",
  reasons: [
    { title: "In je eigen woorden", body: "Je laat zien hoe jij een klacht of uitdaging op de fiets ervaart." },
    {
      title: "De situatie bij elkaar",
      body: "Je fiets, doel en eerdere aanpassingen helpen je ervaring te begrijpen.",
    },
    { title: "Betere vervolgvragen", body: "Zo blijven toekomstige publicaties dichter bij echte fietservaringen." },
  ],
  formTitle: "Vertel ons je situatie",
  formIntro: "Vul je naam, e-mailadres en klacht in. Je rijdoel is optioneel.",
  form: {
    nameLabel: "Naam",
    emailLabel: "E-mailadres",
    ridingGoalLabel: "Rijdoel of context",
    painSummaryLabel: "Beschrijf je klacht of uitdaging",
    consentLabel: "Ik geef toestemming om mijn inzending te gebruiken om contact op te nemen " +
      "over een praktijkvoorbeeld of validatieronde.",
    submitLabel: "Meld je aan voor een praktijkvoorbeeld",
    success: "Bedankt. We hebben je aanmelding voor een praktijkvoorbeeld ontvangen.",
    helpText: "Bijvoorbeeld: gran fondo, triathlon, woon-werk, revalidatie",
  },
  helpTitle: "Wat helpt ons het meest?",
  helpIntro: "Beschrijf je startsituatie zo concreet mogelijk. Zo kunnen we beoordelen of je verhaal geschikt is voor vervolgvragen.",
  help: [
    "Wanneer treedt de klacht op: direct, na een tijd fietsen of alleen bij klimmen?",
    "Welke fiets en discipline gebruik je?",
    "Welke aanpassingen heb je al geprobeerd?",
    "Sta je open voor vervolgvragen?",
  ],
  expectations: "Wat kun je verwachten?",
  expectationIntro: "We beloven geen directe oplossing voor je fietspositie, maar wel een sterkere " +
    "structuur voor zinvolle vervolgvragen.",
  benefits: [
    "Een duidelijkere structuur om je startsituatie en verbeteringen vast te leggen.",
    "Bruikbare vervolgvragen in plaats van losse feedback.",
    "De kans om bij te dragen aan publicaties voor andere fietsers.",
  ],
  contextTitle: "Eerst meer context?",
  contextIntro: "Onze gidsen en klachtpagina’s kunnen helpen je situatie scherper te beschrijven.",
  guides: "Bekijk gidsen",
};

const en: typeof nl = {
  metadata: {
    title: "Case study recruitment | BestBikeFit4U",
    description: "Share your fit-related pain or comfort challenge and help us build real rider case studies.",
  },
  submissionError: "Something went wrong. Please try again.",
  validation: {
    required: "Please fill out this field.",
    email: "Please enter a valid email address.",
    consent: "Please accept before submitting.",
  },
  eyebrow: "Riders wanted",
  title: "Share your cycling story.",
  intro: "Do you have recurring discomfort or a challenge with your riding position? Share your situation. " +
    "We will get in touch if your story fits a new publication or validation round.",
  join: "Register your interest",
  pain: "Browse pain pages",
  pricing: "View pricing",
  image: "Line illustration of a gravel bike",
  whyEyebrow: "Why your story matters",
  why: "Real experiences give context",
  whyIntro: "Your submission helps us understand patterns, starting points and useful follow-up questions.",
  reasons: [
    { title: "In your own words", body: "Show how you experience discomfort or a challenge on the bike." },
    { title: "The situation together", body: "Your bike, goals and earlier adjustments help explain your experience." },
    { title: "Better follow-up questions", body: "Keep future publications closer to real cycling experiences." },
  ],
  formTitle: "Tell us about your situation",
  formIntro: "Enter your name, email address and challenge. Your riding goal is optional.",
  form: {
    nameLabel: "Name",
    emailLabel: "Email address",
    ridingGoalLabel: "Riding goal or context",
    painSummaryLabel: "Describe your pain or fit challenge",
    consentLabel: "I consent to BestBikeFit4U using this submission to contact me " +
      "about a case study or validation round.",
    submitLabel: "Submit case-study interest",
    success: "Thank you. We received your case-study interest.",
    helpText: "For example: gran fondo, triathlon, commuting, return from injury",
  },
  helpTitle: "What helps us most?",
  helpIntro: "The more concrete your starting point, the better we can assess whether your case suits follow-up.",
  help: [
    "When does the issue appear: immediately, after some time riding or only on climbs?",
    "Which bike and discipline are you riding?",
    "Which adjustments have you already tried?",
    "Are you open to follow-up questions?",
  ],
  expectations: "What can you expect?",
  expectationIntro: "We are not promising an instant fit fix, but a stronger structure for meaningful follow-up.",
  benefits: [
    "A clearer structure for capturing your starting point and improvements.",
    "Useful follow-up questions instead of scattered feedback.",
    "A chance to contribute to publications for other cyclists.",
  ],
  contextTitle: "Need more context first?",
  contextIntro: "Our guides and pain pages can help you describe your situation more clearly.",
  guides: "Browse guides",
};

export function getCaseStudyMessages(locale: Locale) {
  return locale === "nl" ? nl : en;
}
