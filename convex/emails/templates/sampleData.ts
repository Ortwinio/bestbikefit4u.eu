import { BRAND } from "../../lib/brand";
import type {
  ResultsSummaryData, FitReportData, WinbackData, ProExplainerData, Day1TipsData, EmailLocale,
  Day7CheckInData, Day14EvaluationData, GiftMeasurementData,
} from "./index";

/** Fixed, fictional preview values from SPEC §7. No sender or real recipient is involved. */
export const sampleFit = {
  firstName: "Lisa",
  bikeName: "Canyon Endurace",
  saddleHeightMm: 754,
  testRange: { min: 731, max: 774 },
  saddleSetbackMm: 49,
  handlebarDropMm: 98,
  stemLengthMm: 100,
  stemAngleRecommendation: "−6°",
  crankLengthMm: 172.5,
  handlebarWidthMm: 420,
  frameSize: "XL",
  confidenceScore: 90,
};
export function sampleData(locale: EmailLocale) {
  const actionUrl = `${BRAND.siteUrl}/${locale}/fit`;
  const preferences = {
    unsubscribeUrl: `${BRAND.siteUrl}/${locale}/email-preferences?token=preview-only`,
    preferencesUrl: `${BRAND.siteUrl}/${locale}/settings`,
  };
  const personal = { firstName: "Lisa", actionUrl };
  const purchase = {
    ...personal, productId: "single" as const, bikeName: "Canyon Endurace", amountPaid: 13.5,
    accessEndsAt: Date.UTC(2027, 0, 3), invoiceAttached: true, withdrawalAcknowledged: true,
  };
  const renewal = {
    ...personal, renewalAt: Date.UTC(2027, 2, 1), daysUntilRenewal: 30, firstYearPriceCents: 2150, bikesAdjusted: 3, reportsCreated: 5,
    giftsGiven: 2, giftsIncluded: true, cancellationUrl: `${BRAND.siteUrl}/${locale}/settings`,
  };
  return {
    kneeAngleEvaluation: { ...personal, ...preferences, angleDegrees: 31, targetSaddleHeightMm: 787,
      actionUrl: `${BRAND.siteUrl}/${locale}/tools/knee-angle` },
    giftMeasurement: {
      senderFirstName: "Thomas",
      message: locale === "nl" ? "Veel plezier met je bikefit!" : "Enjoy your bike fit!",
      expiresAt: Date.UTC(2026, 10, 4),
      actionUrl: `${BRAND.siteUrl}/${locale}/gift#token=${"a".repeat(64)}`,
    } satisfies GiftMeasurementData,
    purchaseConfirmation: purchase,
    subscriptionWelcome: { ...personal, accessEndsAt: Date.UTC(2027, 9, 3) },
    accessExpired: { ...personal, bikeName: "Canyon Endurace" },
    renewalReminder: renewal,
    cancellationConfirmation: { ...personal, accessEndsAt: Date.UTC(2027, 2, 1) },
    transitionAnnouncement: { ...personal, launchAt: null, eligibleTransitionOffer: true, daysUntilLaunch: 14 },
    loginCode: { code: "482915" },
    resultsSummary: { ...sampleFit, actionUrl } satisfies ResultsSummaryData,
    fitReport: { ...sampleFit, actionUrl } satisfies FitReportData,
    fitPassWelcome: purchase,
    caseStudyLead: {
      name: "Lisa Jansen", email: "lisa@example.test", ridingGoal: "Comfortabel langere ritten fietsen",
      painSummary: "Na een lange rit voel ik mijn onderrug.", sourcePath: "/nl/over-ons",
      createdAt: Date.UTC(2026, 1, 15, 12),
    },
    caseStudyConfirmation: { name: "Lisa Jansen", actionUrl },
    fitReminder: { ...personal, ...preferences },
    upgradeNudge: { ...personal, ...preferences, bikeName: "Canyon Endurace" },
    winback: {
      ...sampleFit, ...preferences, actionUrl, recordedAt: Date.UTC(2026, 1, 15, 12),
    } satisfies WinbackData,
    proExplainer: { ...sampleFit, ...preferences, ...renewal } satisfies ProExplainerData,
    day1Tips: { ...personal, ...preferences, hasFit: false } satisfies Day1TipsData,
    day7CheckIn: {
      ...personal, ...preferences,
      answerUrls: {
        better: `${actionUrl}?preview-only=day7&answer=better`,
        same: `${actionUrl}?preview-only=day7&answer=same`,
        worse: `${actionUrl}?preview-only=day7&answer=worse`,
      },
    } satisfies Day7CheckInData,
    day14Evaluation: { ...personal, ...preferences } satisfies Day14EvaluationData,
  };
}
