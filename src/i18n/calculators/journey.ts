import type { HandoffCalculator } from "@/lib/handoff/store";

interface JourneyCopy {
  posture: string; ride: string; progress: string; complete: string; next: string; go: string;
  known: string; edit: string; reused: string; carry: string; reasonTitle: string; account: string;
  nextHint: string; currentRange: string;
  titles: Record<HandoffCalculator, string>;
  reasons: Record<HandoffCalculator, { text: string; cta: string }>;
}

export const journeyMessages: Record<"nl" | "en", JourneyCopy> = {
  nl: {
    posture: "Mijn houding", ride: "Mijn rit", progress: "{route} · {step} van {total}",
    complete: "Route klaar · volgende route", next: "Volgende calculator", go: "Naar {calculator}",
    known: "We kennen al", edit: "Wijzig", reused: "Uit je eerdere invoer",
    carry: "Wat je hier invult nemen we mee.", reasonTitle: "Zo bouw je verder op je advies",
    account: "Gratis account", nextHint: "Je ingevoerde waarden gaan mee. Vul alleen aan wat nog ontbreekt.",
    currentRange: "Je bereik is nu {range}.",
    titles: {
      "saddle-height": "Zadelhoogte", "frame-size": "Framemaat", "crank-length": "Cranklengte",
      "saddle-width": "Zadelbreedte", "bike-fit": "Volledige bike fit", "tire-pressure": "Bandenspanning",
      gearing: "Verzet", "climb-planner": "Klimplanner", "power-speed": "Vermogen en snelheid",
      "ftp-wkg": "FTP en W/kg", "fuel-hydration": "Voeding en vocht",
    },
    reasons: {
      "saddle-height": { text: "Bewaar je maten en meet je binnenbeen drie keer om je bereik te verfijnen.", cta: "Maak mijn bereik smaller" },
      "frame-size": { text: "Bewaar je maten en voeg de stack en reach van je eigen fiets toe aan je profiel.", cta: "Vergelijk met mijn fiets" },
      "crank-length": { text: "Bewaar je binnenbeen, dan rekenen cranklengte en zadelhoogte met dezelfde maat.", cta: "Reken samen met mijn zadel" },
      "saddle-width": { text: "Bewaar je zitbotmeting, dan hoef je bij een nieuw zadel niet opnieuw te meten.", cta: "Bewaar mijn zitbotmeting" },
      "bike-fit": { text: "Je gegevens raken niet verloren en je bouwt je profiel verder op.", cta: "Bewaar mijn bike fit" },
      "tire-pressure": { text: "Bewaar je banden en spanning bij je fiets voor je volgende rit.", cta: "Bewaar bij mijn fiets" },
      gearing: { text: "Gebruik de FTP uit je profiel om met je eigen vermogen te rekenen.", cta: "Gebruik mijn FTP" },
      "climb-planner": { text: "Gebruik je gemeten FTP en gewicht in plaats van aannames.", cta: "Gebruik mijn eigen FTP" },
      "power-speed": { text: "Reken verder met het gewicht en de fiets uit je profiel.", cta: "Reken met mijn fiets" },
      "ftp-wkg": { text: "Bewaar je FTP, dan rekenen klimplanner en verzet er voortaan mee.", cta: "Bewaar mijn FTP" },
      "fuel-hydration": { text: "Bewaar je ritduur en temperatuur voor je volgende berekening.", cta: "Bewaar mijn ritgegevens" },
    },
  },
  en: {
    posture: "My position", ride: "My ride", progress: "{route} · {step} of {total}",
    complete: "Route complete · next route", next: "Next calculator", go: "Go to {calculator}",
    known: "We already know", edit: "Edit", reused: "From your earlier inputs",
    carry: "We carry over what you enter here.", reasonTitle: "Build on your advice",
    account: "Free account", nextHint: "Your entered values carry over. Only add what is still missing.",
    currentRange: "Your current range is {range}.",
    titles: {
      "saddle-height": "Saddle height", "frame-size": "Frame size", "crank-length": "Crank length",
      "saddle-width": "Saddle width", "bike-fit": "Full bike fit", "tire-pressure": "Tyre pressure",
      gearing: "Gearing", "climb-planner": "Climb planner", "power-speed": "Power and speed",
      "ftp-wkg": "FTP and W/kg", "fuel-hydration": "Fuel and hydration",
    },
    reasons: {
      "saddle-height": { text: "Save your measurements and measure your inseam three times to refine your range.", cta: "Narrow my range" },
      "frame-size": { text: "Save your measurements and add your bike’s stack and reach to your profile.", cta: "Compare with my bike" },
      "crank-length": { text: "Save your inseam so crank length and saddle height use the same measurement.", cta: "Calculate with my saddle" },
      "saddle-width": { text: "Save your sit-bone measurement so you need not measure again for a new saddle.", cta: "Save my sit-bone measurement" },
      "bike-fit": { text: "Keep your inputs and continue building your rider profile.", cta: "Save my bike fit" },
      "tire-pressure": { text: "Save your tyres and pressure with your bike for your next ride.", cta: "Save with my bike" },
      gearing: { text: "Use the FTP from your profile to calculate with your own power.", cta: "Use my FTP" },
      "climb-planner": { text: "Use your measured FTP and weight instead of assumptions.", cta: "Use my own FTP" },
      "power-speed": { text: "Continue with the weight and bike from your profile.", cta: "Calculate with my bike" },
      "ftp-wkg": { text: "Save your FTP so the climb planner and gearing calculator can use it.", cta: "Save my FTP" },
      "fuel-hydration": { text: "Save your ride duration and temperature for your next calculation.", cta: "Save my ride inputs" },
    },
  },
};
