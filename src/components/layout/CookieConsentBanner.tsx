"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import {
  type CookieConsentChoice,
  readCookieConsent,
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
    () => () => {},
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
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[95] p-4">
      <div className="pointer-events-auto mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900">{copy.title}</h2>
        <p className="mt-2 text-sm text-gray-700">
          {copy.body}{" "}
          <Link
            href={withLocalePrefix("/privacy", locale)}
            className="font-medium text-blue-700 hover:text-blue-800"
          >
            {copy.privacyLabel}
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleConsent("essential")}
          >
            {copy.essentialLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => handleConsent("accepted")}
          >
            {copy.acceptLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
