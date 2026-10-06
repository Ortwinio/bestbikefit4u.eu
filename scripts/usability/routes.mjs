export const locales = ["nl", "en"];
export const viewports = [{ width: 390, height: 844 }, { width: 1440, height: 900 }];

export const journeys = {
  posture: {
    labels: { nl: "Mijn houding", en: "My position" },
    calculators: ["saddle-height", "frame-size", "crank-length", "saddle-width", "bike-fit"],
  },
  ride: {
    labels: { nl: "Mijn rit", en: "My ride" },
    calculators: ["tire-pressure", "gearing", "climb-planner", "power-speed", "ftp-wkg", "fuel-hydration"],
  },
};

const calculatorBoards = {
  "saddle-height": "SaddleHeight", "frame-size": "FrameSize", "crank-length": "CrankLength",
  "saddle-width": "SaddleWidth", "bike-fit": "BikeFit", "tire-pressure": "TirePressure",
  gearing: "Gearing", "climb-planner": "ClimbPlanner", "power-speed": "PowerSpeed",
  "ftp-wkg": "FtpWkg", "fuel-hydration": "FuelHydration",
};

export const calculators = Object.entries(journeys).flatMap(([journey, route]) =>
  route.calculators.map((calculator, index) => ({
    id: calculator,
    calculator,
    owner: "U2",
    kind: "calculator",
    path: calculator === "tire-pressure" ? "/tire-pressure-calculator" : `/calculators/${calculator}`,
    localizedPaths: calculator === "tire-pressure"
      ? { nl: "/bandenspanning-calculator", en: "/tire-pressure-calculator" } : undefined,
    board: `${calculatorBoards[calculator]}.dc.html`,
    journey,
    step: index + 1,
    totalSteps: route.calculators.length,
    nextCalculator: route.calculators[index + 1] ?? journeys[journey === "posture" ? "ride" : "posture"].calculators[0],
    safetyRequired: ["saddle-height", "tire-pressure"].includes(calculator),
    safety: ["saddle-height", "tire-pressure"].includes(calculator),
    tyrePressure: calculator === "tire-pressure",
    measurementKind: ["saddle-height", "bike-fit"].includes(calculator),
    presentations: ["range-chip", "ladder"],
    ...(calculator === "saddle-height" ? { safetyStates: [
      { id: "full", selector: '[data-advice-mode="full"]', safety: true },
      { id: "quick", selector: '[data-advice-mode="quick"]', activate: '[data-advice-mode] [role="group"] button:first-child', safety: true,
        safetySelector: 'section[aria-labelledby="quick-fix-practical-title"] > p',
        manualRequired: "Activate Quick fix on this same route and verify its practical safety paragraph remains visible." },
    ] } : {}),
  })),
);

export const contentPages = [
  { id: "how-it-works", path: "/how-it-works", board: "HowItWorks.dc.html" },
  { id: "measurement-guide", path: "/measurement-guide", board: "MeasurementGuide.dc.html" },
  { id: "pain-index", path: "/pain", board: "PainIndex.dc.html" },
  { id: "pain-detail", path: "/pain/knee-pain-cycling", board: "PainDetail.dc.html", sourceRoute: "/pain/[slug]" },
  { id: "why-bikefit", path: "/why-bikefit-matters", board: "WhyBikeFit.dc.html" },
  { id: "bike-fitting", path: "/bike-fitting", localizedPaths: { nl: "/bikefitting", en: "/bike-fitting" }, board: "BikeFittingLanding.dc.html" },
  { id: "bike-setup", path: "/fiets-afstellen", board: "BikeSetup.dc.html",
    redirectedTo: { nl: "/bikefitting", en: "/bike-fitting" },
    limitation: "The existing BikeSetup route redirects to BikeFittingLanding; independent board parity requires manual review." },
  { id: "guides", path: "/guides", board: "Guides.dc.html" },
  { id: "guide-detail", path: "/guides/saddle-height-guide", board: "GuideDetail.dc.html", sourceRoute: "/guides/[slug]" },
  { id: "blog-article", path: "/blog/visual-article-1", board: "BlogArticle.dc.html", sourceRoute: "/blog/[slug]", fixture: "blog",
    limitation: "Existing offline article fixture with real server-rendered article tree; published CMS content and production metadata require separate evidence." },
  { id: "science-article", path: "/science/bike-fit-methods", board: "ScienceArticle.dc.html" },
  { id: "faq", path: "/faq", board: "FAQ.dc.html" },
  { id: "pressure-landing", path: "/tire-pressure/road-bike", localizedPaths: { nl: "/bandenspanning/racefiets", en: "/tire-pressure/road-bike" }, board: "PressureLanding.dc.html", sourceRoute: "/tire-pressure/[slug]", safetyRequired: true },
].map(page => ({ owner: "U2", kind: "content", ...page, safety: Boolean(page.safetyRequired), tyrePressure: page.id === "pressure-landing" }));

const accountRequirements = {
  dashboard: { boundaries: ["profile-score"], presentations: ["score-cap"], tyrePressure: true },
  profile: { boundaries: ["profile-score"], presentations: ["score-cap"], measurementKind: true },
  "profile-score": { boundaries: ["profile-score"], presentations: ["score-cap"] },
  "profile-advice": { tyrePressure: true },
  welcome: { measurementKind: true },
  bikes: { boundaries: ["second-bike"], presentations: ["locked-preview"], tyrePressure: true },
  "bike-add": { boundaries: ["second-bike"] },
  "bike-profile": { tyrePressure: true },
  "bike-compare": { boundaries: ["compare"], presentations: ["compare-strip"] },
  "fit-results": { boundaries: ["step-plan", "report"], presentations: ["locked-preview"], tyrePressure: true },
  history: { boundaries: ["history"], presentations: ["locked-preview"] },
  "pressure-account": { tyrePressure: true, safety: true },
  "saddle-account": { measurementKind: true, safety: true },
};

export const accountPages = [
  ["dashboard", "/dashboard", "Dashboard"],
  ["profile", "/profile", "Profile"],
  ["profile-improve", "/profile/improve/body-measurements", "ProfileImprove"],
  ["profile-score", "/profile/score", "RP5Profile"],
  ["profile-advice", "/profile/advice", "RP7Advice"],
  ["welcome", "/welcome", "RP3Welcome"],
  ["bikes", "/bikes", "Bikes"],
  ["bike-add", "/bikes/new", "BikeAdd"],
  ["bike-form", "/bikes/new/manual", "BikeForm"],
  ["bike-profile", "/bikes/visual-bike", "BikeProfile"],
  ["bike-edit", "/bikes/visual-bike/edit", "BikeForm"],
  ["bike-compare", "/bikes/compare-fit", "BikeCompare"],
  ["fit-results", "/fit/visual-session/results", "FitResults"],
  ["history", "/fit-history", "History"],
  ["settings", "/settings", "Settings"],
  ["pressure-account", "/pressure-calculator", "PressureDashboard"],
  ["saddle-account", "/tools/saddle-height", "RP6SaddleAccount"],
].flatMap(([id, path, board]) => ["free-enforced", "flag-off", "paid"].map(accessScenario => ({
  id: accessScenario === "free-enforced" ? id : `${id}-${accessScenario}`,
  path: `${path}?access=${accessScenario}`, board: `${board}.dc.html`, owner: "U3", kind: "account",
  fixture: accessScenario === "flag-off" ? "account" : "account-enforced", accessScenario,
  ...accountRequirements[id],
  ...(id === "fit-results" && accessScenario === "free-enforced" ? { tyrePressure: false } : {}),
  ...(accessScenario === "free-enforced" ? {} : { boundaries: [], presentations: [] }),
})));

export const checkoutPages = [
  { id: "checkout-choice", path: "/checkout", board: "afsluiten/Kies.dc.html" },
  { id: "checkout-account", path: "/checkout?state=account", board: "afsluiten/Account.dc.html", state: "account", fixture: "checkout",
    limitation: "Explicit offline CheckoutFlow account state; no email is submitted." },
  { id: "checkout-review", path: "/checkout?state=review", board: "afsluiten/Bevestig.dc.html", state: "review", fixture: "checkout",
    limitation: "Explicit offline authenticated presentation props; payment callback throws." },
  { id: "checkout-success", path: "/checkout?state=success", board: "afsluiten/Gelukt.dc.html", state: "success", fixture: "checkout",
    limitation: "Explicit offline success presentation, not a completed transaction." },
  { id: "checkout-failure", path: "/checkout?state=failure", board: "afsluiten/Mislukt.dc.html", state: "failure", fixture: "checkout",
    limitation: "Explicit offline failure presentation; anonymous cancelled=1 alone does not establish a failure state." },
].map(page => ({ owner: "U3", kind: "checkout", ...page }));

export const pages = [
  { id: "home", path: "/", owner: "U1", kind: "home", board: "Main.dc.html" },
  { id: "pricing", path: "/pricing", owner: "U3", kind: "pricing", board: "Pricing.dc.html" },
  ...calculators,
  ...contentPages,
  { id: "login", path: "/login", owner: "U1", kind: "login", board: "Login.dc.html" },
  ...accountPages,
  ...checkoutPages,
];

export const pressureSurfaces = [
  ["RP8Bike", "bike-profile"], ["Dashboard", "dashboard"], ["TirePressure", "tire-pressure"],
  ["RP7Advice", "profile-advice"], ["PressureLanding", "pressure-landing"], ["FitResults", "fit-results-paid"],
  ["PressureDashboard", "pressure-account"], ["Bikes", "bikes"],
  ["FitReport", null], ["FitRapport5", null],
].map(([board, pageId]) => ({ board: `${board}.dc.html`, pageId,
  ...(pageId ? {} : { manualRequired: "Report/download surface has no standalone application route; verify rendered report separately." }),
}));

export function localizedPagePath(page, locale) {
  if (!locales.includes(locale)) throw new Error(`Unsupported locale: ${locale}`);
  const path = page.localizedPaths?.[locale] ?? page.path;
  return `/${locale}${path === "/" ? "" : path}`;
}
