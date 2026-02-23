import Link from "next/link";
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
      className={cn("bg-white py-14 sm:py-16", className)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 id="home-quotes-title" className="text-3xl font-bold text-gray-900">
            {copy.title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-600">
            {copy.subtitle}
          </p>
        </div>
        <div
          className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible md:pb-0"
          aria-label={copy.title}
        >
          {quotes.map((quote, index) => (
            <article
              key={`${index}-${quote}`}
              className="min-w-[16rem] snap-start rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-sm md:min-w-0"
            >
              <blockquote className="text-base font-bold italic leading-relaxed text-blue-700">
                &ldquo;{quote}&rdquo;
              </blockquote>
            </article>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href={readMoreHref}
            className="inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            {copy.readMoreLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
