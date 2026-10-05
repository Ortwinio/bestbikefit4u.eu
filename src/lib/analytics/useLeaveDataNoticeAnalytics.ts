"use client";

import { useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { LogMarketingEventArgs } from "@/components/analytics/MarketingEventTracker";
import { canTrackMarketing } from "@/lib/cookieConsent";

type NoticeAction = "shown" | "signup" | "dismissed";

export function useLeaveDataNoticeAnalytics(locale: Locale, logEvent: (args: LogMarketingEventArgs) => void) {
  const pathname = usePathname() ?? "";
  const tracked = useRef(new Set<NoticeAction>());
  return useCallback((action: NoticeAction) => {
    const pagePath = pathname.split(/[?#]/)[0].replace(/\/$/, "");
    if (!canTrackMarketing() || tracked.current.has(action)
      || (pagePath !== `/${locale}` && !pagePath.startsWith(`/${locale}/`))) return;
    tracked.current.add(action);
    logEvent({ eventType: `leave_data_notice_${action}`, locale, pagePath });
  }, [locale, logEvent, pathname]);
}
