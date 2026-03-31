"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { Locale } from "@/i18n/config";
import { canTrackMarketing } from "@/lib/cookieConsent";
import {
  pushDataLayerEvent,
  type MarketingEventType,
} from "@/lib/analytics/marketing";

export type LogMarketingEventArgs = {
  eventType: MarketingEventType;
  locale: Locale;
  pagePath: string;
  section?: string;
  ctaLabel?: string;
  ctaTargetPath?: string;
  sourceTag?: string;
  valueCents?: number;
  currency?: "EUR";
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
    if (!canTrackMarketing()) {
      return;
    }

    pushDataLayerEvent({
      event: "bbf_marketing_event",
      ...args,
    });
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
