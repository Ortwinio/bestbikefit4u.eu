"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { Locale } from "@/i18n/config";

export type MarketingEventType =
  | "cta_click"
  | "login_code_requested"
  | "login_code_resent"
  | "login_verified"
  | "funnel_landing_view"
  | "funnel_login_view"
  | "funnel_profile_view"
  | "funnel_fit_view"
  | "funnel_questionnaire_complete"
  | "funnel_results_view"
  | "login_send_error"
  | "login_verify_error"
  | "questionnaire_complete_error"
  | "report_send_error";

export type LogMarketingEventArgs = {
  eventType: MarketingEventType;
  locale: Locale;
  pagePath: string;
  section?: string;
  ctaLabel?: string;
  ctaTargetPath?: string;
  sourceTag?: string;
};

type LogMarketingEventFn = (args: LogMarketingEventArgs) => Promise<unknown>;

const logMarketingEventRef = makeFunctionReference<
  "mutation",
  LogMarketingEventArgs,
  unknown
>("analytics/mutations:logMarketingEvent");

export function useMarketingEventLogger() {
  const logMarketingEvent = useMutation(logMarketingEventRef) as LogMarketingEventFn;

  return useCallback((args: LogMarketingEventArgs) => {
    void logMarketingEvent(args);
  }, [logMarketingEvent]);
}

export function TrackMarketingEventOnView({
  eventType,
  locale,
  pagePath,
  section,
  sourceTag,
}: {
  eventType: MarketingEventType;
  locale: Locale;
  pagePath: string;
  section?: string;
  sourceTag?: string;
}) {
  const hasTrackedRef = useRef(false);
  const logEvent = useMarketingEventLogger();

  useEffect(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;

    logEvent({
      eventType,
      locale,
      pagePath,
      section,
      sourceTag,
    });
  }, [eventType, locale, logEvent, pagePath, section, sourceTag]);

  return null;
}
