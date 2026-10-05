import { calculateAccountSaddleHeight } from "../../../../shared/reliability/accountSaddle";
import { calculateKneeAngle } from "../../../../shared/reliability/kneeAngle";
import type { AccountSaddleViewProps } from "./AccountSaddleView";

export function accountSaddleFixture(locale: "nl" | "en", values = [89, 89, 89]): AccountSaddleViewProps {
  return {
    locale, heightCm: 190,
    measurements: values.map((valueCm, index) => ({ valueCm, recordedAt: 1791158400000 + index * 86400000 })),
    model: calculateAccountSaddleHeight({ heightCm: 190, measurementsCm: values, bikeType: "road", goal: "performance", flexibilityScore: 2, coreScore: 3 }),
    settings: { bikeType: "road", goal: "performance", flexibility: 2, core: 3, currentSaddleHeightMm: 787 },
    basis: locale === "nl" ? "Uit je profiel · Gemeten · 5 okt 2026" : "From your profile · Measured · 5 Oct 2026",
    onSaveMeasurement: async () => undefined, onSaveSettings: async () => undefined,
  };
}

export function kneeResultFixture(angleDegrees = 31) {
  return { result: calculateKneeAngle({ angleDegrees, currentSaddleHeightMm: 787, inseamCm: 89, provenance: { kind: "measured", repeatCount: 3, withinTolerance: true } }), recordedAt: 1791158400000, evaluationDueAt: 1791763200000 };
}
