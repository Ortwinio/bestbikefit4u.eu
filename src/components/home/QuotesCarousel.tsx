import Link from "next/link";
import { Button } from "@/components/prototyper-ui/ui/button";
import { PublicSection } from "@/components/public/PublicSection";
import { PublicSurfaceCard } from "@/components/public/PublicSurfaceCard";
import type { Locale } from "@/i18n/config";
import { HOME_QUOTES_SECTION_COPY } from "@/content/homeQuotes";
import { withLocalePrefix } from "@/i18n/navigation";
import { cn } from "@/utils/cn";

type QuotesCarouselProps = {
  locale: Locale;
  quotes: readonly string[];
  className?: string;
};

export function QuotesCarousel({
  locale,
  quotes,
  className,
}: QuotesCarouselProps) {
  if (quotes.length === 0) {
    return null;
  }

  const copy = HOME_QUOTES_SECTION_COPY[locale];
  const readMoreHref = withLocalePrefix("/why-bikefit-matters", locale);

  return (
    <section
      aria-labelledby="home-quotes-title"
      className={cn("bg-background py-14 sm:py-16", className)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PublicSection
          header={{
            title: copy.title,
            description: copy.subtitle,
            align: "center",
          }}
          contentClassName="pt-8"
        >
          <div
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible md:pb-0"
            aria-label={copy.title}
          >
            {quotes.map((quote, index) => (
              <PublicSurfaceCard
                key={`${index}-${quote}`}
                className="min-w-[16rem] snap-start md:min-w-0"
              >
                <blockquote className="text-base font-semibold italic leading-relaxed text-primary">
                  &ldquo;{quote}&rdquo;
                </blockquote>
              </PublicSurfaceCard>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button
              variant="link"
              className="text-sm font-semibold"
              render={<Link href={readMoreHref} />}
            >
              {copy.readMoreLabel}
            </Button>
          </div>
        </PublicSection>
      </div>
    </section>
  );
}
