import { BRAND } from "@/config/brand";

export const MARKETING_EVENT_TYPES = [
  "cta_click",
  "login_code_requested",
  "login_code_resent",
  "login_google_started",
  "login_google_error",
  "login_verified",
  "funnel_landing_view",
  "funnel_login_view",
  "funnel_profile_view",
  "funnel_fit_view",
  "funnel_questionnaire_complete",
  "funnel_results_view",
  "pricing_view",
  "pain_page_view",
  "case_study_recruitment_view",
  "case_study_recruitment_submit",
  "how_it_works_view",
  "case_study_opt_in_shown",
  "case_study_opt_in_clicked",
  "case_study_dismissed",
  "case_study_submitted",
  "login_send_error",
  "login_verify_error",
  "questionnaire_complete_error",
  "report_send_error",
] as const;

export type MarketingEventType = (typeof MARKETING_EVENT_TYPES)[number];

export const ANONYMOUS_MARKETING_EVENT_TYPES = [
  "cta_click",
  "funnel_landing_view",
  "funnel_login_view",
  "pricing_view",
  "pain_page_view",
  "case_study_recruitment_view",
  "case_study_recruitment_submit",
  "login_code_requested",
  "login_code_resent",
  "login_send_error",
  "login_verify_error",
] as const satisfies readonly MarketingEventType[];

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function isProductionMarketingHost(hostname?: string | null): boolean {
  return typeof hostname === "string" && hostname === BRAND.host;
}

function canUseBrowserMarketing(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return isProductionMarketingHost(window.location.hostname);
}

export function pushDataLayerEvent(payload: Record<string, unknown>) {
  if (!canUseBrowserMarketing()) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}
