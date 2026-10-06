/** E1/E2 contract: senders resolve values; templates own formatting and HTML. */
import type { PaidProductId } from "../../../shared/pricing/products";

export type EmailLocale = "nl" | "en";
export interface RenderedEmail { subject: string; preheader: string; html: string; text: string; }
export interface PersonalData { firstName?: string; }
export interface PreferenceLinks { unsubscribeUrl: string; preferencesUrl: string; }
export interface FitValues {
  saddleHeightMm?: number;
  saddleSetbackMm?: number;
  handlebarDropMm?: number;
  stemLengthMm?: number;
  stemAngleRecommendation?: string;
  crankLengthMm?: number;
  handlebarWidthMm?: number;
  recommendedStackMm?: number;
  recommendedReachMm?: number;
  effectiveTopTubeMm?: number;
}
export interface LoginCodeData { code: string; }
export interface ResultsSummaryData extends PersonalData, FitValues {
  saddleHeightMm: number;
  testRange?: { min: number; max: number };
  bikeName?: string;
  actionUrl: string;
}
export interface FitReportData extends PersonalData, FitValues {
  tirePressure?: { frontBar: number; rearBar: number; frontPsi?: number; rearPsi?: number };
  frameSize?: string;
  confidenceScore?: number;
  algorithmVersion?: string;
  /** Already localized engine notes, or genuine user-authored notes. */
  fitNotes?: string[];
  actionUrl: string;
}
export type FitPassWelcomeData = PurchaseConfirmationData;
export interface CaseStudyLeadData {
  name: string; email: string; ridingGoal?: string; painSummary: string; sourcePath: string; createdAt: number;
}
export interface CaseStudyConfirmationData { name?: string; actionUrl: string; }
export interface FitReminderData extends PersonalData, PreferenceLinks { actionUrl: string; }
export interface UpgradeNudgeData extends PersonalData, PreferenceLinks { bikeName?: string; actionUrl: string; }
export interface WinbackData extends PersonalData, PreferenceLinks, FitValues {
  recordedAt?: number;
  bikeName?: string;
  actionUrl: string;
}
export interface ProExplainerData extends RenewalReminderData, PreferenceLinks, FitValues {}
export interface Day1TipsData extends PersonalData, PreferenceLinks { hasFit: boolean; actionUrl: string; }
export interface Day7CheckInData extends PersonalData, PreferenceLinks {
  actionUrl: string;
  answerUrls: { better: string; same: string; worse: string };
}
export interface Day14EvaluationData extends PersonalData, PreferenceLinks { actionUrl: string; }
export {
  renderLoginCode, renderResultsSummary, renderFitReport, renderFitPassWelcome, renderCaseStudyLead,
  renderCaseStudyConfirmation, renderFitReminder, renderUpgradeNudge, renderWinback, renderProExplainer, renderDay1Tips,
  renderDay7CheckIn, renderDay14Evaluation, renderAccessWelcome, renderAccessOptions, renderFitTips,
} from "./renderers";

/** P3 service-mail contract. Facts come from fulfilled entitlements, never the Stripe stub. */
export interface PurchaseConfirmationData extends PersonalData {
  productId: PaidProductId;
  bikeName?: string;
  amountPaid?: number;
  accessEndsAt?: number;
  /** Only true when the actual outgoing message has an invoice PDF attached. */
  invoiceAttached?: boolean;
  withdrawalAcknowledged?: boolean;
  actionUrl: string;
}
export interface SubscriptionWelcomeData extends PersonalData {
  accessEndsAt?: number;
  actionUrl: string;
}
export interface AccessExpiredData extends PersonalData { bikeName?: string; actionUrl: string; }
export interface RenewalReminderData extends PersonalData {
  renewalAt?: number;
  daysUntilRenewal?: number;
  firstYearPriceCents?: number;
  bikesAdjusted?: number;
  reportsCreated?: number;
  /** Supply only if this feature was available to the recipient. */
  giftsGiven?: number;
  giftsIncluded?: boolean;
  actionUrl: string;
  cancellationUrl?: string;
}
export interface CancellationConfirmationData extends PersonalData {
  accessEndsAt: number;
  refundAmount?: number;
  actionUrl: string;
}
export interface TransitionAnnouncementData extends PersonalData {
  /** Null deliberately preserves the design's unconfirmed [DATUM]/[DATE] placeholder. */
  launchAt: number | null;
  eligibleTransitionOffer: boolean;
  daysUntilLaunch?: number;
  actionUrl: string;
}
export {
  renderPurchaseConfirmation, renderSubscriptionWelcome, renderAccessExpired,
  renderRenewalReminder, renderCancellationConfirmation, renderTransitionAnnouncement,
} from "./pricing";
export { renderGiftMeasurement } from "./giftMeasurement";
export type { GiftMeasurementData } from "./giftMeasurement";

export { renderKneeAngleEvaluation } from "./reliability";
export type { KneeAngleEvaluationData } from "./reliability";
