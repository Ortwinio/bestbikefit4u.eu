"use client";

import { useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { extractLocaleFromPathname } from "@/i18n/navigation";
import { canTrackMarketing } from "@/lib/cookieConsent";
import { publicCalculatorPath } from "./calculatorBaseline";

type SaddleInteraction = "quick_fix_used" | "inseam_added";

export function useSaddleReliabilityAnalytics() {
  const pathname = usePathname() ?? "";
  const logEvent = useMarketingEventLogger();
  const tracked = useRef(new Set<string>());
  const track = useCallback((eventType: SaddleInteraction) => {
    const pagePath = publicCalculatorPath("saddle-height", pathname);
    if (!pagePath || !canTrackMarketing()) return;
    const key = `${pagePath}:${eventType}`;
    if (tracked.current.has(key)) return;
    tracked.current.add(key);
    logEvent({
      eventType,
      sourceTag: "saddle-height",
      locale: extractLocaleFromPathname(pagePath) ?? DEFAULT_LOCALE,
      pagePath,
    });
  }, [logEvent, pathname]);

  const trackQuickFixUsed = useCallback(() => track("quick_fix_used"), [track]);
  const trackInseamAdded = useCallback(() => track("inseam_added"), [track]);
  return { trackQuickFixUsed, trackInseamAdded };
}
