"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/prototyper-ui/ui/button";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import {
  type CookieConsentChoice,
  readCookieConsent,
  subscribeToCookieConsent,
  writeCookieConsent,
} from "@/lib/cookieConsent";

type CookieConsentBannerProps = {
  locale: Locale;
};

const copyByLocale: Record<
  Locale,
  {
    title: string;
    body: string;
    acceptLabel: string;
    essentialLabel: string;
    privacyLabel: string;
  }
> = {
  en: {
    title: "Cookie preferences",
    body: "We use essential cookies for login and language settings. Optional analytics cookies help us improve the product.",
    acceptLabel: "Accept all",
    essentialLabel: "Essential only",
    privacyLabel: "Read privacy policy",
  },
  nl: {
    title: "Cookievoorkeuren",
    body: "We gebruiken essentiële cookies voor inloggen en taalinstellingen. Optionele analytics-cookies helpen ons het product te verbeteren.",
    acceptLabel: "Alles accepteren",
    essentialLabel: "Alleen essentieel",
    privacyLabel: "Bekijk privacybeleid",
  },
};

export function CookieConsentBanner({ locale }: CookieConsentBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const copy = copyByLocale[locale];

  const showBanner = useSyncExternalStore(
    subscribeToCookieConsent,
    () => readCookieConsent() === null,
    () => false
  );
  const isVisible = showBanner && !isDismissed;

  const handleConsent = (choice: CookieConsentChoice) => {
    writeCookieConsent(choice);
    setIsDismissed(true);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[95] p-3 sm:top-auto sm:bottom-0 sm:p-4">
      <div className="panel-surface-base panel-theme-context pointer-events-auto mx-auto max-w-5xl rounded-[1.5rem] border p-4 shadow-[0_22px_60px_-36px_color-mix(in_oklch,var(--foreground)_45%,transparent)] sm:rounded-[1.75rem] sm:p-5">
        <h2 className="text-sm font-semibold text-[color:var(--foreground)]">{copy.title}</h2>
        <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
          {copy.body}{" "}
          <Link
            href={withLocalePrefix("/privacy", locale)}
            className="font-medium text-[color:var(--primary)] hover:brightness-110"
          >
            {copy.privacyLabel}
          </Link>
          .
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:items-center">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="min-w-0"
            onClick={() => handleConsent("essential")}
          >
            {copy.essentialLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            className="min-w-0"
            onClick={() => handleConsent("accepted")}
          >
            {copy.acceptLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
