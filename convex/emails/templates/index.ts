/** E1/E2 contract: senders resolve values; templates own formatting and HTML. */
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
  frameSize?: string;
  confidenceScore?: number;
  algorithmVersion?: string;
  /** Already localized engine notes, or genuine user-authored notes. */
  fitNotes?: string[];
  actionUrl: string;
}
export interface FitPassWelcomeData extends PersonalData { actionUrl: string; }
export interface CaseStudyLeadData {
  name: string; email: string; ridingGoal?: string; painSummary: string; sourcePath: string; createdAt: number;
}
export interface CaseStudyConfirmationData { name?: string; actionUrl: string; }
export interface FitReminderData extends PersonalData, PreferenceLinks { actionUrl: string; }
export interface UpgradeNudgeData extends PersonalData, PreferenceLinks { actionUrl: string; }
export interface WinbackData extends PersonalData, PreferenceLinks, FitValues {
  recordedAt?: number;
  bikeName?: string;
  actionUrl: string;
}
export interface ProExplainerData extends PersonalData, PreferenceLinks, FitValues { actionUrl: string; }
export interface Day1TipsData extends PersonalData, PreferenceLinks { hasFit: boolean; actionUrl: string; }
export interface Day7CheckInData extends PersonalData, PreferenceLinks {
  actionUrl: string;
  answerUrls: { better: string; same: string; worse: string };
}
export interface Day14EvaluationData extends PersonalData, PreferenceLinks { actionUrl: string; }
export {
  renderLoginCode, renderResultsSummary, renderFitReport, renderFitPassWelcome, renderCaseStudyLead,
  renderCaseStudyConfirmation, renderFitReminder, renderUpgradeNudge, renderWinback, renderProExplainer, renderDay1Tips,
  renderDay7CheckIn, renderDay14Evaluation,
} from "./renderers";
