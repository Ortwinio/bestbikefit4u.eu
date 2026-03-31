"use client";

import Link from "next/link";
import { forwardRef, type ComponentPropsWithoutRef, type MouseEvent } from "react";
import { useMutation } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { Locale } from "@/i18n/config";
import { canTrackMarketing } from "@/lib/cookieConsent";
import {
  trackAdConversion,
  type MarketingConversionKey,
} from "@/lib/analytics/conversions";
import {
  pushDataLayerEvent,
} from "@/lib/analytics/marketing";

type TrackedCtaLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & {
  href: string;
  locale: Locale;
  pagePath: string;
  section: string;
  ctaLabel: string;
  conversionKey?: MarketingConversionKey;
};

type LogMarketingEventArgs = {
  eventType: "cta_click";
  locale: Locale;
  pagePath: string;
  section: string;
  ctaLabel: string;
  ctaTargetPath: string;
  sourceTag: string;
};

type LogMarketingEventFn = (args: LogMarketingEventArgs) => Promise<unknown>;

const logMarketingEventRef = makeFunctionReference<
  "mutation",
  LogMarketingEventArgs,
  unknown
>("analytics/mutations:logMarketingEvent");

function withSourceTagForLogin(href: string, sourceTag: string): string {
  if (!href.includes("/login")) return href;

  const hashSplit = href.split("#");
  const [base] = hashSplit;
  const hash = hashSplit.length > 1 ? `#${hashSplit.slice(1).join("#")}` : "";
  const querySplit = base.split("?");
  const path = querySplit[0];
  const query = querySplit[1] ?? "";
  const params = new URLSearchParams(query);

  if (!params.has("src")) {
    params.set("src", sourceTag);
  }

  const nextQuery = params.toString();
  return `${path}${nextQuery ? `?${nextQuery}` : ""}${hash}`;
}

export const TrackedCtaLink = forwardRef<HTMLAnchorElement, TrackedCtaLinkProps>(function TrackedCtaLink({
  href,
  locale,
  pagePath,
  section,
  ctaLabel,
  conversionKey,
  onClick,
  ...props
}, ref) {
  const logMarketingEvent = useMutation(logMarketingEventRef) as LogMarketingEventFn;
  const sourceTag = `${pagePath}:${section}`;
  const trackedHref = withSourceTagForLogin(href, sourceTag);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (!canTrackMarketing()) {
      return;
    }

    void logMarketingEvent({
      eventType: "cta_click",
      locale,
      pagePath,
      section,
      ctaLabel,
      ctaTargetPath: href,
      sourceTag,
    });

    pushDataLayerEvent({
      event: "bbf_cta_click",
      locale,
      pagePath,
      section,
      ctaLabel,
      ctaTargetPath: href,
      sourceTag,
    });

    if (conversionKey) {
      trackAdConversion(conversionKey, {
        locale,
        pagePath,
        section,
        ctaLabel,
      });
    }
  };

  return (
    <Link ref={ref} href={trackedHref} onClick={handleClick} {...props} />
  );
});
