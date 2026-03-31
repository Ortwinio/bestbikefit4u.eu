"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  readCookieConsent,
  subscribeToCookieConsent,
} from "@/lib/cookieConsent";
import { isProductionMarketingHost } from "@/lib/analytics/marketing";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    __bfGtmLoaded?: boolean;
  }
}

type GTMConsentLoaderProps = {
  gtmId: string;
};

export function GTMConsentLoader({ gtmId }: GTMConsentLoaderProps) {
  const consent = useSyncExternalStore(
    subscribeToCookieConsent,
    readCookieConsent,
    () => null
  );

  useEffect(() => {
    if (consent !== "accepted") {
      return;
    }

    if (!isProductionMarketingHost(window.location.hostname)) {
      return;
    }

    if (window.__bfGtmLoaded) {
      return;
    }

    window.__bfGtmLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      "gtm.start": Date.now(),
      event: "gtm.js",
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    document.head.appendChild(script);
  }, [consent, gtmId]);

  return null;
}
