import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { CalculatorDataContext } from "@/lib/calculatorData/context";
import { HANDOFF_FIELD_UNITS } from "@/lib/handoff/store";
import { calculatorDataKey, isProfileCalculatorField } from "../../../shared/calculatorDataScope";
import { LeaveDataNotice } from "@/components/calculators/LeaveDataNotice";
import { PublicBodyReliabilityCalculator } from "@/components/reliability/PublicBodyReliabilityCalculator";
import { PublicSaddleHeightCalculator } from "@/app/(public)/calculators/saddle-height/PublicSaddleHeightCalculator";
import { PublicPerformanceCalculator } from "@/app/(public)/calculators/power-speed/PublicPerformanceCalculator";
import { PressureCalculatorForm } from "@/components/features/pressure/PressureCalculatorForm";
import en from "@/i18n/messages/en";
import nl from "@/i18n/messages/nl";

const locale = window.location.pathname.startsWith("/nl/") ? "nl" : "en";
const calculator = new URLSearchParams(window.location.search).get("calculator");
const values = { heightCm: 190, inseamCm: 89, weightKg: 80, bikeCategory: "road", ftpWatts: 240,
  ftpMethod: "known", powerWatts: 220, speedKph: 30, bikeWeightKg: 9, gradientPercent: 7,
  distanceKm: 12, durationMinutes: 150, temperatureC: 22, intensity: "endurance", bottleSizeMl: 750,
  twentyMinuteWatts: 250, rampWatts: 320, innerChainringTeeth: 34, outerChainringTeeth: 50,
  cassetteSmallestCogTeeth: 11, cassetteLargestCogTeeth: 34, tireWidthFrontMm: 28,
  tireWidthRearMm: 28, rimType: "hooked", surface: "average_asphalt", sitBoneWidthMm: 122,
  hipCircumferenceCm: 100, currentSaddleHeightMm: 787 };
const seededEntries = Object.entries(values).map(([field, value]) => ({ field, value,
  unit: HANDOFF_FIELD_UNITS[field], calculator: isProfileCalculatorField(field) ? "bike-fit" : calculator,
  touchedAt: Date.UTC(2026, 9, 5),
  method: ["inseamCm", "sitBoneWidthMm"].includes(field) ? "measured" : field === "bikeCategory" ? "bike" : "declared",
  ...(field === "inseamCm" ? { kind: "measured", repeatCount: 3, withinTolerance: true } : {}) }));
const state = { entries: seededEntries, saves: [], removed: [], ready: false, remount: () => {} };
window.__profileFixture = state;
document.documentElement.lang = locale;
localStorage.setItem("bf_cookie_consent", "essential");

function Calculator() {
  if (["bike-fit", "frame-size", "crank-length", "saddle-width"].includes(calculator)) {
    return <PublicBodyReliabilityCalculator calculator={calculator} locale={locale} />;
  }
  if (calculator === "saddle-height") return <PublicSaddleHeightCalculator isNl={locale === "nl"} />;
  if (calculator === "tire-pressure") {
    const dictionary = locale === "nl" ? nl : en;
    return <PressureCalculatorForm locale={locale} labels={dictionary.pressure.form} resultLabels={dictionary.pressure.result} />;
  }
  return <PublicPerformanceCalculator locale={locale} tool={calculator} />;
}

function ProfileFixture() {
  const [entries, setEntries] = useState(seededEntries);
  const [revision, setRevision] = useState(0);
  const value = useMemo(() => ({ source: "profile", ready: true, identity: "fixture-profile-owner", entries,
    save: entry => {
      state.saves.push(entry);
      setEntries(previous => [...previous.filter(item => calculatorDataKey(item) !== calculatorDataKey(entry)), entry]);
    },
    remove: (field, sourceCalculator = calculator) => {
      state.removed.push({ field, calculator: sourceCalculator });
      const key = calculatorDataKey({ field, calculator: sourceCalculator });
      setEntries(previous => previous.filter(item => calculatorDataKey(item) !== key));
    },
  }), [entries]);
  useEffect(() => {
    state.entries = entries;
    state.remount = () => setRevision(previous => previous + 1);
    state.ready = true;
  }, [entries]);
  return <CalculatorDataContext.Provider value={value}>
    <main><Calculator key={revision} /></main>
    <LeaveDataNotice locale={locale} hasEnteredData isAuthenticated />
  </CalculatorDataContext.Provider>;
}

createRoot(document.getElementById("root")).render(<ProfileFixture />);
