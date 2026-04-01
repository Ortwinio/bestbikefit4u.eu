"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { useToast } from "@/components/ui";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
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
  const dashboardMessages = getDashboardMessages(locale);
  const toast = useToast();

  const showBanner = useSyncExternalStore(
    subscribeToCookieConsent,
    () => readCookieConsent() === null,
    () => false
  );
  const isVisible = showBanner && !isDismissed;

  const handleConsent = (choice: CookieConsentChoice) => {
    writeCookieConsent(choice);
    setIsDismissed(true);
    toast.success({
      description:
        choice === "accepted"
          ? dashboardMessages.common.toasts.cookiesAccepted
          : dashboardMessages.common.toasts.cookiesEssentialOnly,
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[95] p-4">
      <div className="panel-surface-base panel-theme-context pointer-events-auto mx-auto max-w-5xl rounded-2xl border p-4 shadow-xl sm:p-5">
        <h2 className="text-sm font-semibold text-[color:var(--foreground)]">{copy.title}</h2>
        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
          {copy.body}{" "}
          <Link
            href={withLocalePrefix("/privacy", locale)}
            className="font-medium text-[color:var(--primary)] hover:brightness-110"
          >
            {copy.privacyLabel}
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => handleConsent("essential")}
          >
            {copy.essentialLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => handleConsent("accepted")}
          >
            {copy.acceptLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
