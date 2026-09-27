"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import Link from "next/link";
import { Button } from "@/components/prototyper-ui/ui/button";
import { PublicSection } from "@/components/public/PublicSection";
import { BikeShowcaseCarousel } from "./BikeShowcaseCarousel";
import { BikeShowcaseSkeleton } from "./BikeShowcaseSkeleton";
import type { Messages } from "@/i18n/getDictionary";

type BikeShowcaseSectionProps = {
  locale: Locale;
  copy: Messages["home"]["bikeShowcase"];
};

export function BikeShowcaseSection({ locale, copy }: BikeShowcaseSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (!("IntersectionObserver" in window)) {
      const timer = setTimeout(() => setShouldLoad(true), 0);
      return () => clearTimeout(timer);
    }

    // The desktop-only showcase is well below the fold. Hidden mobile content
    // never intersects, so it does not start a needless backend subscription.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const bikes = useQuery(
    api.bikes.publicQueries.getMarketingShowcaseBikes,
    shouldLoad ? {} : "skip"
  );
  const ctaHref = withLocalePrefix("/calculators/bike-fit", locale);

  if (bikes === undefined) {
    return (
      <section ref={sectionRef} className="bg-background py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PublicSection
            header={{
              eyebrow: copy.eyebrow,
              title: copy.title,
              description: copy.subtitle,
              align: "center",
            }}
            contentClassName="pt-8"
          >
            <div className="space-y-5">
              <div className="mx-auto max-w-3xl rounded-[var(--radius-2xl)] border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_94%,var(--background)_6%)] px-6 py-6 text-center shadow-[0_18px_48px_-32px_color-mix(in_oklch,var(--foreground)_24%,transparent)]">
                <p className="text-base leading-7 text-[color:var(--muted-foreground)]">
                  {locale === "nl"
                    ? "We laden uitgelichte fietsen voor een sneller startpunt. Je kunt intussen ook direct verder met je fit."
                    : "We are loading featured bikes for a faster starting point. You can also continue straight into your fit in the meantime."}
                </p>
                <div className="mt-5 flex justify-center">
                  <Button
                    variant="outline"
                    render={<Link href={ctaHref} />}
                    className="rounded-full px-6"
                  >
                    {locale === "nl" ? "Start met bike fit" : "Start bike fit"}
                  </Button>
                </div>
              </div>
              <BikeShowcaseSkeleton />
            </div>
          </PublicSection>
        </div>
      </section>
    );
  }

  if (!bikes || bikes.length === 0) {
    return (
      <section ref={sectionRef} className="bg-background py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PublicSection
            header={{
              eyebrow: copy.eyebrow,
              title: copy.title,
              description: copy.subtitle,
              align: "center",
            }}
            contentClassName="pt-8"
          >
            <div className="mx-auto max-w-3xl rounded-[var(--radius-2xl)] border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_94%,var(--background)_6%)] px-6 py-8 text-center shadow-[0_18px_48px_-32px_color-mix(in_oklch,var(--foreground)_24%,transparent)]">
              <p className="text-base leading-7 text-[color:var(--muted-foreground)]">
                {locale === "nl"
                  ? "We laden nu geen uitgelichte fietsen, maar je kunt wel direct verder met je fit of handmatig je geometrie invoeren."
                  : "Featured bikes are not available right now, but you can still continue straight into the fit flow or enter your geometry manually."}
              </p>
              <div className="mt-5 flex justify-center">
                <Button
                  variant="outline"
                  render={<Link href={ctaHref} />}
                  className="rounded-full px-6"
                >
                  {locale === "nl" ? "Start met bike fit" : "Start bike fit"}
                </Button>
              </div>
            </div>
          </PublicSection>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="bg-background py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PublicSection
          header={{
            eyebrow: copy.eyebrow,
            title: copy.title,
            description: copy.subtitle,
            align: "center",
          }}
          contentClassName="pt-8"
        >
          <BikeShowcaseCarousel bikes={bikes} ctaHref={ctaHref} copy={copy} />
        </PublicSection>
      </div>
    </section>
  );
}
