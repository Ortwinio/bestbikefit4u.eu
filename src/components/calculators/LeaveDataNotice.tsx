"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Dialog, DialogContent, DialogDescription, DialogTitle,
} from "@/components/prototyper-ui/ui/dialog";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { dataReuseMessages } from "@/i18n/calculators/dataReuse";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { useLeaveDataNoticeAnalytics } from "@/lib/analytics/useLeaveDataNoticeAnalytics";

export const LEAVE_DATA_NOTICE_KEY = "bbf.leave-data-notice";

export function LeaveDataNotice({ locale, hasEnteredData, isAuthenticated }: {
  locale: Locale;
  hasEnteredData: boolean;
  isAuthenticated: boolean;
}) {
  const pathname = usePathname();
  const trackNotice = useLeaveDataNoticeAnalytics(locale, useMarketingEventLogger());
  const [mode, setMode] = useState<"desktop" | "touch" | null>(null);
  const titleId = useId();
  const copy = dataReuseMessages[locale];
  const excluded = /\/(?:login|signup|register|auth|checkout)(?:\/|$)/.test(pathname ?? "");
  const eligible = hasEnteredData && !isAuthenticated && !excluded;

  useEffect(() => {
    if (!eligible) return;
    const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const show = () => {
      try {
        if (sessionStorage.getItem(LEAVE_DATA_NOTICE_KEY)) return;
        sessionStorage.setItem(LEAVE_DATA_NOTICE_KEY, "shown");
      } catch {
        return;
      }
      setMode(touch ? "touch" : "desktop");
      trackNotice("shown");
    };
    if (touch) {
      const timer = window.setTimeout(show, 0);
      return () => window.clearTimeout(timer);
    }
    const onExit = (event: MouseEvent) => {
      if (event.clientY <= 0 && event.relatedTarget === null) show();
    };
    document.addEventListener("mouseout", onExit);
    return () => document.removeEventListener("mouseout", onExit);
  }, [eligible, trackNotice]);

  if (!eligible || mode === null) return null;
  const dismiss = () => {
    trackNotice("dismissed");
    setMode(null);
  };
  const actions = <>
    <Link
      href={withLocalePrefix("/login?handoff=1", locale)}
      onClick={() => trackNotice("signup")}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-3 text-center font-semibold text-primary-foreground focus-visible:focus-ring"
    >{copy.createAccount}</Link>
    <Button variant="ghost" className="min-h-11" onClick={dismiss}>{copy.dismiss}</Button>
  </>;

  if (mode === "touch") {
    return <aside
      aria-labelledby={titleId}
      data-slot="leave-data-notice"
      className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-border bg-background p-4 text-foreground shadow-lg"
    >
      <p id={titleId} className="font-semibold">{copy.mobileTitle}</p>
      <div className="mt-3 flex flex-wrap gap-2">{actions}</div>
    </aside>;
  }

  return <Dialog open onOpenChange={(open) => { if (!open) dismiss(); }}>
    <DialogContent showCloseButton={false}>
      <DialogTitle>{copy.title}</DialogTitle>
      <DialogDescription>{copy.description}</DialogDescription>
      <div className="flex flex-col gap-2">{actions}</div>
    </DialogContent>
  </Dialog>;
}
