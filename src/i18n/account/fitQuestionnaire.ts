import type { Locale } from "@/i18n/config";

const copy = {
  nl: {
    back: "Terug naar je sessie",
    eyebrow: "Je bikefit · vragenlijst",
    title: "Vertel over jouw ritten.",
    description: "Je rijstijl en hoe je nu zit helpen om je afstelling te kiezen.",
    introEyebrow: "Je rijstijl, jouw afstelling",
    introTitle: "Wat voelt goed? Wat kan fijner?",
    introDescription: "Vertel hoe je fiets nu aanvoelt, welke ritten je maakt en of je een klimprofiel wilt. Je lichaamsmaten staan al in je profiel.",
    introStart: "Start je bikefit",
    method: "Bekijk hoe je bikefit werkt",
    introStepsTitle: "Van gevoel naar afstelling",
    introSteps: ["Vertel hoe je nu zit", "Kies je ritten en terrein", "Kies wel of geen klimprofiel"],
    session: "Voor deze sessie",
    guidanceTitle: "Jouw gevoel telt.",
    guidance: "Kies wat bij je past. Je kunt terug om je antwoord te wijzigen.",
    measurements: "Lichaamsmaten wijzigen?",
    profile: "Open je profiel",
    question: "Vraag",
    of: "van",
    required: "Verplicht",
    topics: {
      current_position_feeling: "Je huidige positie",
      road_riding_type: "Je ritten",
      mtb_terrain: "Je terrein",
      wants_climbing_profile: "Wel of geen klimprofiel",
      climbing_importance: "Hoe vaak je klimt",
    } as Record<string, string>,
  },
  en: {
    back: "Back to your session",
    eyebrow: "Your bike fit · questionnaire",
    title: "Tell us about your rides.",
    description: "Your riding style and current position help us choose your setup.",
    introEyebrow: "Your riding style, your setup",
    introTitle: "What feels good? What could feel better?",
    introDescription: "Tell us how your bike feels, what rides you do and whether you want a climbing profile. Your body measurements are already in your profile.",
    introStart: "Start your bike fit",
    method: "See how your bike fit works",
    introStepsTitle: "From feel to fit",
    introSteps: ["Describe your current position", "Choose your rides and terrain", "Choose whether to add a climbing profile"],
    session: "For this session",
    guidanceTitle: "How you feel matters.",
    guidance: "Choose what fits you. You can go back to change your answer.",
    measurements: "Need to update your measurements?",
    profile: "Open your profile",
    question: "Question",
    of: "of",
    required: "Required",
    topics: {
      current_position_feeling: "Your current position",
      road_riding_type: "Your rides",
      mtb_terrain: "Your terrain",
      wants_climbing_profile: "Whether to add a climbing profile",
      climbing_importance: "How often you climb",
    } as Record<string, string>,
  },
};

export function getFitQuestionnaireCopy(locale: Locale) {
  return copy[locale];
}

export function formatFitQuestionnaireNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-GB").format(value);
}
