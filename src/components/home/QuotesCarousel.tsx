import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { withLocalePrefix } from "@/i18n/navigation";
import { TestimonialSection } from "./TestimonialSection";

type QuotesCarouselProps = {
  locale: Locale;
  quotes: readonly string[];
  className?: string;
};

export async function QuotesCarousel({
  locale,
  quotes,
  className,
}: QuotesCarouselProps) {
  const { home } = await getDictionary(locale);
  const copy = home.homepageRedesign.testimonials;
  const fallbackQuotes = quotes.length > 0 ? quotes : copy.items.map((item) => item.result);

  const testimonials = copy.items.slice(0, 3).map((item, index) => ({
    ...item,
    quote: fallbackQuotes[index] ?? item.result,
  }));

  return (
    <TestimonialSection
      locale={locale}
      copy={copy}
      testimonials={testimonials}
      readMoreHref={withLocalePrefix("/why-bikefit-matters", locale)}
      className={className}
    />
  );
}
