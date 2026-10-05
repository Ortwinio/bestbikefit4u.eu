import type { Locale } from "@/i18n/config";

const pricingAccess = {
  nl: {
    products: { free: "Gratis", single: "Losse meting", annual: "Jaarabonnement", annual_upgrade: "Jaarabonnement", annual_personal: "Jaarabonnement + persoonlijke bikefit", personal_fit_standalone: "Persoonlijke bikefit-afspraak" },
    loading: "Toegang laden…",
    basicAccuracy: "Basisnauwkeurigheid",
    refinedAccuracy: "Verfijnde nauwkeurigheid",
    cap: "Maximaal 80% in een gratis account. Het streepje op de ring markeert die grens; de laatste 20% komt uit verfijnde metingen met een losse meting of jaarabonnement.",
    capMeter: "maximaal 80 procent in een gratis account",
    uncapped: "Met je losse meting of jaarabonnement kan je profiel tot 100% komen. Vul de metingen onder Verfijning aan om je advies verder te verfijnen.",
    refinements: "Verfijning",
    refinementIntro: "Deze metingen maken je advies nauwkeuriger. Je basisadvies werkt ook zonder.",
    locked: "Beschikbaar met een losse meting of jaarabonnement.",
    retained: "Bewaard uit je betaalde periode. Aanpassen kan weer met een losse meting of jaarabonnement.",
    unlock: "Ontgrendel met een losse meting of jaarabonnement",
    options: "Bekijk de mogelijkheden",
    oneBike: "In een gratis account bewaar je 1 fiets. Met een jaarabonnement stel je al je fietsen af en vergelijk je ze.",
    bikeLimit: "Je hebt je fiets al bewaard. Met een jaarabonnement voeg je meer fietsen toe.",
    annual: "Bekijk het jaarabonnement",
    legacy: "Gemaakt met volledige toegang",
    history: "Bewaar al je sessies en fietsen",
    historyDetail: "Jaarabonnement €21,50 per jaar, inclusief 2 cadeaumetingen per abonnementsjaar.",
    adviceTitle: "Volledig stappenplan voor deze fiets",
    adviceDetail: "Inclusief volgorde, controleplan en bandenspanning. €13,50, 3 maanden toegang. Je adviezen hierboven blijven gratis.",
    selfAssessed: "Zelf ingeschat",
    bikeUncapped: "Met je losse meting of jaarabonnement kan dit fietsprofiel tot 100% komen.",
    editBike: "Bewerk in je fiets",
    riding: "Rijgedrag",
    bikeFields: { barReach: "Afstand zadel–stuur (gemeten)", barDrop: "Hoogteverschil zadel–stuur (gemeten)", seatAngle: "Zitbuishoek", headAngle: "Balhoofdhoek", gears: "Verzet" },
    bikeReasons: { barReach: "Meet horizontaal van de punt van je zadel tot het midden van het stuur bij de stuurpen.", barDrop: "Meet van de vloer tot de bovenkant van zadel en stuur en trek die af. Positief: zadel hoger dan stuur.", seatAngle: "Je zitbuishoek bepaalt hoe je setback zich vertaalt naar je positie boven de trapas.", headAngle: "Je balhoofdhoek helpt bij het inschatten van stuurgedrag en stuurpenkeuze.", gears: "Je verzet maakt het advies voor cadans en klimmen persoonlijker." },
    remove: "Verwijderen",
    saveError: "Opslaan is niet gelukt. Probeer opnieuw.",
    fields: { femurLengthCm: "Bovenbeenlengte (femur)", footLengthCm: "Voetlengte", sitBoneWidthMm: "Zitbotbreedte", handSpanCm: "Handspanne", flexibilityTestCm: "Geleide lenigheidstest", coreTestSeconds: "Geleide core-test" },
    reasons: { femurLengthCm: "Je femurlengte maakt je setback-advies nauwkeuriger.", footLengthCm: "Je voetlengte helpt bij de positie van je schoenplaatjes.", sitBoneWidthMm: "Je zitbotbreedte maakt de zadelkeuze nauwkeuriger.", handSpanCm: "Je handspanne helpt bij de keuze van stuurdikte en remgreepafstand.", flexibilityTestCm: "Een geleide test vervangt je eigen inschatting van je lenigheid door een meting.", coreTestSeconds: "Een geleide test vervangt je eigen inschatting van je rompstabiliteit door een meting." },
  },
  en: {
    products: { free: "Free", single: "Single fit", annual: "Annual plan", annual_upgrade: "Annual plan", annual_personal: "Annual plan + personal bikefit", personal_fit_standalone: "Personal bike fit appointment" },
    loading: "Loading access…",
    basicAccuracy: "Basic accuracy",
    refinedAccuracy: "Refined accuracy",
    cap: "A free account reaches up to 80%. The mark on the ring shows this limit; the final 20% comes from refined measurements with a single fit or annual plan.",
    capMeter: "up to 80 percent with a free account",
    uncapped: "With a single fit or annual plan, your profile can reach 100%. Complete the measurements under Refinements to refine your advice.",
    refinements: "Refinements",
    refinementIntro: "These measurements make your advice more precise. Your basic advice also works without them.",
    locked: "Available with a single fit or annual plan.",
    retained: "Saved during your paid access. You can edit these again with a single fit or annual plan.",
    unlock: "Unlock with a single fit or annual plan",
    options: "Explore your options",
    oneBike: "A free account saves 1 bike. With an annual plan, you can fit and compare all your bikes.",
    bikeLimit: "You have already saved your bike. Add more bikes with an annual plan.",
    annual: "View the annual plan",
    legacy: "Created with full access",
    history: "Keep all your sessions and bikes",
    historyDetail: "Annual plan €21.50 per year, including 2 gift measurements per subscription year.",
    adviceTitle: "Full adjustment plan for this bike",
    adviceDetail: "Includes adjustment order, validation plan and tyre pressure. €13.50 for 3 months of access. Your advice above stays free.",
    selfAssessed: "Self-assessed",
    bikeUncapped: "With a single fit or annual plan, this bike profile can reach 100%.",
    editBike: "Edit your bike",
    riding: "Riding activity",
    bikeFields: { barReach: "Measured saddle-to-bar reach", barDrop: "Measured saddle-to-bar drop", seatAngle: "Seat tube angle", headAngle: "Head tube angle", gears: "Gearing" },
    bikeReasons: { barReach: "Measure horizontally from the saddle nose to the handlebar centre at the stem.", barDrop: "Measure from the floor to the saddle top and handlebar top, then subtract. Positive means the saddle is higher.", seatAngle: "Seat tube angle helps translate saddle setback into your position above the bottom bracket.", headAngle: "Head tube angle helps assess steering behaviour and stem choice.", gears: "Your gearing makes cadence and climbing advice more personal." },
    remove: "Remove",
    saveError: "Could not save. Please try again.",
    fields: { femurLengthCm: "Thigh length (femur)", footLengthCm: "Foot length", sitBoneWidthMm: "Sit bone width", handSpanCm: "Hand span", flexibilityTestCm: "Guided flexibility test", coreTestSeconds: "Guided core test" },
    reasons: { femurLengthCm: "Thigh length refines your saddle setback advice.", footLengthCm: "Foot length helps determine your cleat position.", sitBoneWidthMm: "Sit bone width refines your saddle choice.", handSpanCm: "Hand span helps determine handlebar thickness and brake lever reach.", flexibilityTestCm: "A guided test replaces your flexibility estimate with a measurement.", coreTestSeconds: "A guided test replaces your core stability estimate with a measurement." },
  },
} as const;

export function getPricingAccessCopy(locale: Locale) {
  return pricingAccess[locale];
}

export function getRefinementScoreLabel(locale: Locale, key: string): string | undefined {
  const fields: Record<string, keyof typeof pricingAccess.en.fields> = {
    femur: "femurLengthCm", foot: "footLengthCm", sitBones: "sitBoneWidthMm", hand: "handSpanCm",
    flexibilityTest: "flexibilityTestCm", coreTest: "coreTestSeconds",
  };
  const field = fields[key];
  return field ? pricingAccess[locale].fields[field] : undefined;
}
