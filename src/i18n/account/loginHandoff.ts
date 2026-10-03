import type { Locale } from "@/i18n/config";
import type { HandoffEntry } from "@/lib/handoff/store";

type LoginHandoffCopy = {
  title: string;
  choose: string;
  createAccount: string;
  signIn: string;
  accountHeading: string;
  passwordless: string;
  sendCode: string;
  description: string;
  privacy: string;
  empty: string;
  loading: string;
  success: string;
  verify: string;
  calculator: string;
  methods: Record<HandoffEntry["method"], string>;
  fields: Record<HandoffEntry["field"], string>;
  values: Record<string, string>;
};

export const loginHandoffCopy: Record<Locale, LoginHandoffCopy> = {
  nl: {
    choose: "Kies",
    createAccount: "Account aanmaken",
    signIn: "Inloggen",
    accountHeading: "Gratis account in één minuut",
    passwordless: "Geen wachtwoord nodig. We sturen je een inlogcode.",
    sendCode: "Stuur mijn inlogcode",
    title: "Je gegevens liggen klaar.",
    description: "Na het inloggen laten we zien wat we meenemen. Jij kiest wat er in je profiel komt.",
    privacy: "Bewaard in deze browsersessie. We slaan niets op in je profiel zonder jouw akkoord, en je maten komen niet in statistieken of e-mails.",
    empty: "Er staan geen gegevens klaar in deze browsersessie. Je kunt gewoon inloggen en daarna je profiel aanvullen.",
    loading: "Je gegevens ophalen…",
    success: "Je wordt doorgestuurd om je gegevens te bekijken…",
    verify: "Bevestig en bekijk mijn gegevens",
    calculator: "Probeer de calculator zonder account",
    methods: { measured: "gemeten", estimated: "geschat", declared: "opgegeven", bike: "fiets" },
    fields: {
      heightCm: "Lichaamslengte", inseamCm: "Binnenbeenlengte", flexibilityScore: "Flexibiliteit",
      coreStabilityScore: "Core-stabiliteit", ridingGoal: "Rijdoel", weightKg: "Gewicht",
      ftpWatts: "FTP", ftpMethod: "FTP-methode", sitBoneWidthMm: "Zitbotbreedte", sweatProfile: "Zweetprofiel",
      bikeCategory: "Type fiets", currentSaddleHeightMm: "Huidige zadelhoogte",
      currentCrankLengthMm: "Huidige cranklengte", currentSaddleWidthMm: "Huidige zadelbreedte",
      currentSaddleModel: "Huidig zadel", tireWidthFrontMm: "Bandbreedte voor", tireWidthRearMm: "Bandbreedte achter",
      rimType: "Velgtype", surface: "Ondergrond", outerChainringTeeth: "Groot kettingblad",
      innerChainringTeeth: "Klein kettingblad", cassetteSmallestCogTeeth: "Kleinste krans",
      cassetteLargestCogTeeth: "Grootste krans",
    },
    values: {
      road: "Racefiets", gravel: "Gravelbike", mtb: "Mountainbike", hybrid: "Hybride",
      city: "Stadsfiets", tt: "Tijdritfiets", comfort: "Comfort", balanced: "Gebalanceerd",
      performance: "Prestatie", aero: "Aerodynamisch", low: "Laag", moderate: "Gemiddeld", high: "Hoog",
    },
  },
  en: {
    choose: "Choose",
    createAccount: "Create account",
    signIn: "Sign in",
    accountHeading: "Free account in one minute",
    passwordless: "No password needed. We’ll send you a sign-in code.",
    sendCode: "Send my sign-in code",
    title: "Your data is ready.",
    description: "After signing in, we’ll show you what comes along. You choose what goes into your profile.",
    privacy: "Kept in this browser session. Nothing is saved to your profile without your agreement, and your measurements stay out of analytics and emails.",
    empty: "No data is waiting in this browser session. You can still sign in and complete your profile afterwards.",
    loading: "Loading your data…",
    success: "Redirecting to review your data…",
    verify: "Confirm and review my data",
    calculator: "Try the calculator without an account",
    methods: { measured: "measured", estimated: "estimated", declared: "declared", bike: "bike" },
    fields: {
      heightCm: "Height", inseamCm: "Inseam", flexibilityScore: "Flexibility",
      coreStabilityScore: "Core stability", ridingGoal: "Riding goal", weightKg: "Weight",
      ftpWatts: "FTP", ftpMethod: "FTP method", sitBoneWidthMm: "Sit bone width", sweatProfile: "Sweat profile",
      bikeCategory: "Bike type", currentSaddleHeightMm: "Current saddle height",
      currentCrankLengthMm: "Current crank length", currentSaddleWidthMm: "Current saddle width",
      currentSaddleModel: "Current saddle", tireWidthFrontMm: "Front tire width", tireWidthRearMm: "Rear tire width",
      rimType: "Rim type", surface: "Surface", outerChainringTeeth: "Outer chainring",
      innerChainringTeeth: "Inner chainring", cassetteSmallestCogTeeth: "Smallest cog",
      cassetteLargestCogTeeth: "Largest cog",
    },
    values: {
      road: "Road bike", gravel: "Gravel bike", mtb: "Mountain bike", hybrid: "Hybrid",
      city: "City bike", tt: "Time trial bike", comfort: "Comfort", balanced: "Balanced",
      performance: "Performance", aero: "Aerodynamic", low: "Low", moderate: "Moderate", high: "High",
    },
  },
};
