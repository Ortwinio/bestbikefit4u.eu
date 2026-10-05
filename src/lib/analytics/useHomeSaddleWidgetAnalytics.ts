"use client";

import { useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import type { LogMarketingEventArgs } from "@/components/analytics/MarketingEventTracker";
import { canTrackMarketing } from "@/lib/cookieConsent";

export function useHomeSaddleWidgetAnalytics(logEvent: (args: LogMarketingEventArgs) => void) {
  const pathname = usePathname() ?? "";
  const tracked = useRef(new Set<string>());
  const trackHomeSaddleWidgetUsed = useCallback(() => {
    const pagePath = pathname.split(/[?#]/)[0].replace(/\/$/, "");
    if ((pagePath !== "/nl" && pagePath !== "/en") || !canTrackMarketing()) return;
    if (tracked.current.has(pagePath)) return;
    tracked.current.add(pagePath);
    logEvent({
      eventType: "home_saddle_widget_used",
      sourceTag: "saddle-height",
      locale: pagePath === "/nl" ? "nl" : "en",
      pagePath,
    });
  }, [logEvent, pathname]);

  return { trackHomeSaddleWidgetUsed };
}
