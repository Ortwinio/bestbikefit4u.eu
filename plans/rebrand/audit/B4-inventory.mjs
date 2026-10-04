import { readFile, access } from "node:fs/promises";
import path from "node:path";

function stripTags(value) {
  let previous;
  do { previous = value; value = value.replace(/<[^>]*>/g, ""); } while (value !== previous);
  return value.replace(/[<>]/g, "");
}

const sourceRoot = "/Users/ortwinverreck/Developer/bestbikefit4u/plans/redesign-canvas";
const canvas = JSON.parse(await readFile(`${sourceRoot}/canvas-bfb/project/canvas.json`, "utf8"));
const publicRoutes = {
  About: "about", BikeFit: "calculators/bike-fit", BikeFittingLanding: "bikefitting",
  BikeSetup: "fiets-afstellen", BlogArticle: "blog/[slug]", BlogIndex: "blog", CaseStudy: "case-study",
  ClimbPlanner: "calculators/climb-planner", Contact: "contact", CrankLength: "calculators/crank-length",
  FAQ: "faq", FrameSize: "calculators/frame-size", FtpWkg: "calculators/ftp-wkg",
  FuelHydration: "calculators/fuel-hydration", Gearing: "calculators/gearing", GuideDetail: "guides/[slug]",
  Guides: "guides", HowItWorks: "how-it-works", Legal: "privacy", Main: "", Home: "",
  MeasurementGuide: "measurement-guide", PainDetail: "pain/[slug]", PainIndex: "pain",
  PowerSpeed: "calculators/power-speed", PressureLanding: "bandenspanning/[slug]",
  SaddleHeight: "calculators/saddle-height", SaddleWidth: "calculators/saddle-width",
  ScienceArticle: "science/bike-fit-methods", TirePressure: "tire-pressure-calculator", WhyBikeFit: "why-bikefit-matters",
  RP1PublicSaddle: "calculators/saddle-height",
};
const accountRoutes = {
  BikeAdd: "bikes/new", BikeCompare: "bikes/compare-fit", BikeForm: "bikes/new/manual",
  BikeImportMarktplaats: "bikes/import/marktplaats", BikeImportPassport: "bikes/import/passport",
  BikeProfile: "bikes/[bikeId]", Bikes: "bikes", Dashboard: "dashboard", Feedback: "feedback",
  FitMethod: "fit/how-it-works", FitQuestionnaire: "fit/[sessionId]/questionnaire",
  FitResults: "fit/[sessionId]/results", FitStart: "fit", GearingDashboard: "gearing", History: "fit-history",
  PressureDashboard: "pressure-calculator", Profile: "profile", ProfileImprove: "profile/improve/flexibility",
  SaddleSelector: "saddle-selector", Settings: "settings", ShoeCleatFit: "shoe-cleat-fit",
  RP4Dashboard: "dashboard", RP5Profile: "profile", RP6SaddleAccount: "tools/saddle-height",
  RP7Advice: "profile/advice", RP8Bike: "bikes/[bikeId]",
};
const special = {
  AppInstall: ["/app", "src/app/app/page.tsx"], Login: ["/login", "src/app/(auth)/login/page.tsx"],
  RP2LoginHandoff: ["/login", "src/app/(auth)/login/page.tsx"],
  RP3Welcome: ["/welcome", "src/app/welcome/WelcomeClient.tsx"],
  RPSidebar: ["Account sidebar", "src/components/layout/DashboardSidebar.tsx"],
  Logo: ["Brand asset library", "public/brand/svg/logo-horizontaal.svg"],
  Illustraties: ["Illustration asset library", "public/illustrations"],
  Bouwstenen: ["Email layout", "convex/emails/layout/index.ts"],
};
const mails = {
  M01Inlogcode: "loginCode", M02Resultaten: "resultsSummary", M03Fitrapport: "fitReport",
  M06CaseStudy: "caseStudyConfirmation", N01Dag1Tips: "day1Tips", M07FitHerinnering: "fitReminder",
  M09Winback: "winback",
};
const notes = {
  BikeAdd: "Deviates intentionally: retired Marktplaats choice is absent; manual/passport choices remain.",
  BikeImportMarktplaats: "Deviates intentionally: permanent redirect to /bikes/new; import was removed by approved task 46.",
  BikeSetup: "Deviates intentionally: localeRoutes redirects /fiets-afstellen to /nl/bikefitting or /en/bike-fitting; setup article board no longer has a separate live route.",
  RP6SaddleAccount: "Deviates: desktop result card wraps 745 as 74 + 5 in the captured account fixture; nonbrand layout gap, not changed in this release.",
  BikeFittingLanding: "Locale pair: /nl/bikefitting and /en/bike-fitting; shared localized landing.",
  Legal: "One board covers /privacy and /terms; production legal text is preserved except brand name.",
  ScienceArticle: "One board covers /science/bike-fit-methods, /science/calculation-engine and /science/stack-and-reach.",
  PressureLanding: "Parameterized NL /bandenspanning/* and EN /tire-pressure/*; board is one sample weight.",
  ProfileImprove: "One board family covers body-measurements, flexibility, core-stability and comfort routes.",
  BikeForm: "Create and /bikes/[bikeId]/edit share BikeForm; live autosave behavior exceeds static review controls.",
  Profile: "Live provenance/profile implementation includes subsequent riderprofile work; pricing-v3 locked-refinement portions remain another release.",
  BikeProfile: "Live bike provenance implementation includes riderprofile work; pricing-v3 paid score-cap portions remain another release.",
  Settings: "Brand surface implemented; pricing-v3 subscription/renewal changes are excluded from this release.",
  RP7Advice: "Live grouped advice and performed/ride-feedback controls implemented; pricing-v3 paid upsell portions excluded.",
  RPSidebar: "Shared account navigation includes profile scores; visual evidence comes from every account route.",
  Logo: "Deviates intentionally: old logo board replaced by selected BikeFitBoost Badge 1.3.6 / favicon F.",
  Illustraties: "Design library, not a website route; existing ink illustrations reused without changing art style.",
  N07Dag7: "Missing: no day-7 check-in renderer in current email template exports; current-board reference file absent from snapshot.",
  N14Dag14: "Missing: no day-14 evaluation renderer in current email template exports; current-board reference file absent from snapshot.",
  M12Evaluatie: "Missing: no evaluation/review renderer in current email template exports; distinct follow-up, not a rebrand fix.",
};
const excluded = new Set(["Pricing", "FitPass", "M04FitPass", "M08Upgrade", "M10ProUitleg", "M13Overgang",
  "Cadeau", "CadeauOntvangen", "M11Cadeau"]);
const records = [];
for (const [file, board] of Object.entries(canvas.boards)) {
  const key = path.basename(file, ".dc.html");
  const record = { file, title: board.title, width: board.w, height: board.h, status: "implemented",
    route: "", source: "", reference: `${sourceRoot}/canvas/${file}`, referenceAvailable: false,
    boardHeadings: [], notes: notes[key] ?? "Route and main board surface implemented; detailed visual evidence recorded separately." };
  if (file.startsWith("afsluiten/") || excluded.has(key)) {
    record.status = "excluded";
    record.notes = ["Cadeau", "CadeauOntvangen", "M11Cadeau"].includes(key)
      ? "Gift release 2.1 excluded explicitly."
      : "Pricing-v3 purchase/subscription release excluded explicitly; FitPass is the current Kies je meting board.";
  } else if (key in publicRoutes) {
    record.route = `/${publicRoutes[key]}`;
    record.source = `src/app/(public)/${publicRoutes[key] ? `${publicRoutes[key]}/` : ""}page.tsx`;
  } else if (key in accountRoutes) {
    record.route = `/${accountRoutes[key]}`;
    record.source = `src/app/(dashboard)/${accountRoutes[key]}/page.tsx`;
  } else if (key in special) {
    [record.route, record.source] = special[key];
  } else if (key in mails) {
    record.route = `Email: ${mails[key]}`;
    record.source = "convex/emails/templates/renderers.ts";
    record.notes = `Both locales and 600/375 px email views rendered and inspected; renders/emails/${mails[key]}-{nl,en}-{600,375}.png.`;
  } else if (/^FitRapport\d$/.test(key) || key === "FitReport") {
    record.route = "Fit PDF export";
    const pages = { FitRapport1: "summary", FitRapport2: "fitValues", FitRapport3: "plan",
      FitRapport4: "measurement", FitRapport5: "tires", FitRapport6: "baseData" };
    record.source = pages[key] ? `src/lib/reports/pdfPages/${pages[key]}.ts` : "src/lib/reports/pdfLayoutTemplate.ts";
    record.notes = "A4 six-page report implementation; page/paper layout is reviewed in PDF renders, not responsive browser width.";
  } else if (file.startsWith("merk/")) {
    record.route = "Brand reference only";
    record.source = "public/brand/svg/logo-horizontaal.svg";
    record.reference = `${sourceRoot}/canvas-bfb/project/${file}`;
    record.status = "deviates";
    record.notes = "Design exploration, not site route: selected round-4 Badge 1.3.6 is implemented; other proposals intentionally not shipped.";
  } else {
    record.status = "missing";
  }
  if (["BikeAdd", "BikeImportMarktplaats", "BikeSetup", "RP6SaddleAccount", "Logo", "FitReport"].includes(key)) record.status = "deviates";
  if (key === "FitReport") record.notes = "Older three-page board superseded by six dedicated FitRapport pages and six-page A4 renderer.";
  try {
    const html = await readFile(record.reference, "utf8");
    record.referenceAvailable = true;
    record.boardHeadings = [...html.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/g)]
      .map(match => stripTags(match[1]).replace(/\s+/g, " ").trim()).slice(0, 8);
  } catch {}
  if (record.source) {
    try { await access(record.source); record.sourceExists = true; }
    catch { record.sourceExists = false; }
  }
  records.push(record);
}
console.log(JSON.stringify({ boardCount: records.length, sourceRoot, records }, null, 2));
