"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { readCookieConsent, subscribeToCookieConsent } from "@/lib/cookieConsent";
import type { Locale } from "@/i18n/config";
import styles from "./StickyConversionBar.module.css";

export type StickyConversionCopy = {
  title: string;
  detail: string;
  primary: string;
  secondary: string;
  close: string;
};

const DISMISS_KEY = "bbf.homeConversionBarDismissed";
const DISMISS_EVENT = "bbf-home-conversion-bar-dismissed";

// Keeps the bar closed for this visit when sessionStorage is blocked.
let dismissedInMemory = false;

function readDismissed(): boolean {
  if (dismissedInMemory) return true;
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribeToDismiss(onChange: () => void): () => void {
  window.addEventListener(DISMISS_EVENT, onChange);
  return () => window.removeEventListener(DISMISS_EVENT, onChange);
}

export function StickyConversionBar({
  copy, locale, pricingHref, accountHref, pagePath,
}: {
  copy: StickyConversionCopy;
  locale: Locale;
  pricingHref: string;
  accountHref: string;
  pagePath: string;
}) {
  // The cookie banner also sits at the bottom; wait until the visitor has answered it.
  const consentDecided = useSyncExternalStore(subscribeToCookieConsent, () => readCookieConsent() !== null, () => false);
  const dismissed = useSyncExternalStore(subscribeToDismiss, readDismissed, () => true);
  // Stays fixed on screen for the whole visit until the visitor closes it.
  const visible = consentDecided && !dismissed;
  const barRef = useRef<HTMLElement>(null);

  // Reserve the bar's height below the footer, so it never covers the end of the page.
  useEffect(() => {
    const bar = barRef.current;
    if (!visible || !bar) return;
    const previous = document.body.style.paddingBottom;
    const reserve = () => { document.body.style.paddingBottom = `${bar.offsetHeight}px`; };
    reserve();
    const observer = "ResizeObserver" in window ? new ResizeObserver(reserve) : null;
    observer?.observe(bar);
    return () => {
      observer?.disconnect();
      document.body.style.paddingBottom = previous;
    };
  }, [visible]);

  function dismiss() {
    dismissedInMemory = true;
    try { window.sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* Storage is optional. */ }
    window.dispatchEvent(new Event(DISMISS_EVENT));
  }

  return (
    <aside ref={barRef} className={styles.bar} data-visible={visible} aria-label={copy.title} aria-hidden={!visible} inert={!visible}>
      <div className={styles.inner}>
        <div className={styles.text}>
          <strong>{copy.title}</strong>
          <span>{copy.detail}</span>
        </div>
        <div className={styles.actions}>
          <TrackedCtaLink
            className={styles.primary}
            href={pricingHref}
            locale={locale}
            pagePath={pagePath}
            section="sticky_conversion_paid"
            ctaLabel={copy.primary}
          >
            {copy.primary}
          </TrackedCtaLink>
          <Link className={styles.secondary} href={accountHref}>{copy.secondary}</Link>
          <button type="button" className={styles.close} onClick={dismiss} aria-label={copy.close}>
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
