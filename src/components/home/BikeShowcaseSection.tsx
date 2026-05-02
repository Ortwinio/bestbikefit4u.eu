"use client";

// TODO: A server-side fetch with fetchQuery would be preferable here to avoid
// a client subscription on the marketing homepage, but the Convex HTTP client
// setup is complex. Using useQuery for Phase 1 is acceptable.
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { PublicSection } from "@/components/public/PublicSection";
import { BikeShowcaseCarousel } from "./BikeShowcaseCarousel";
import { BikeShowcaseSkeleton } from "./BikeShowcaseSkeleton";
import type { Messages } from "@/i18n/getDictionary";

type BikeShowcaseSectionProps = {
  locale: Locale;
  copy: Messages["home"]["bikeShowcase"];
};

export function BikeShowcaseSection({ locale, copy }: BikeShowcaseSectionProps) {
  const bikes = useQuery(api.bikes.publicQueries.getMarketingShowcaseBikes);

  if (bikes === undefined) {
    return (
      <section className="bg-background py-14 lg:py-16">
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
            <BikeShowcaseSkeleton />
          </PublicSection>
        </div>
      </section>
    );
  }

  if (!bikes || bikes.length === 0) {
    return null;
  }

  const ctaHref = withLocalePrefix("/calculators/bike-fit", locale);

  return (
    <section className="bg-background py-14 lg:py-16">
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
