"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useMarketingEventLogger } from "./MarketingEventTracker";
import { canTrackMarketing, subscribeToCookieConsent } from "@/lib/cookieConsent";
import { calculatorFromPath, observeCalculatorEdits, publicCalculatorPath } from "@/lib/analytics/calculatorBaseline";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { extractLocaleFromPathname } from "@/i18n/navigation";

/** Mounted once in the public layout, so account forms and isolated form tests need no tracking provider. */
export function useCalculatorBaseline() {
  const pathname = usePathname() ?? "";
  const calculator = calculatorFromPath(pathname);
  const pagePath = calculator ? publicCalculatorPath(calculator, pathname) : null;
  const locale = extractLocaleFromPathname(pathname) ?? DEFAULT_LOCALE;
  const logEvent = useMarketingEventLogger();

  useEffect(() => {
    if (!calculator || !pagePath) return;
    let resultShown = false;
    let tracked = false;
    const track = () => {
      if (!resultShown || tracked || !canTrackMarketing()) return;
      tracked = true;
      logEvent({ eventType: "calculator_result_view", sourceTag: calculator, locale, pagePath });
    };
    const stopEdits = observeCalculatorEdits(() => { resultShown = true; track(); });
    const stopConsent = subscribeToCookieConsent(track);
    const onClick = (event: MouseEvent) => {
      if (!event.isTrusted || !canTrackMarketing()) return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const destination = new URL(anchor.href, window.location.origin);
      if (destination.origin !== window.location.origin || !/^\/(en\/|nl\/)?login\/?$/.test(destination.pathname)) return;
      if (!anchor.closest("main") || anchor.closest("header,nav,footer")) return;
      logEvent({ eventType: "calculator_login_cta_click", sourceTag: calculator, locale, pagePath });
    };
    document.addEventListener("click", onClick, true);
    return () => { stopEdits(); stopConsent(); document.removeEventListener("click", onClick, true); };
  }, [calculator, locale, pagePath, logEvent]);
}

export function CalculatorBaselineTracker() {
  useCalculatorBaseline();
  return null;
}
