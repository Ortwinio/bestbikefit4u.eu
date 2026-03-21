import type { Metadata } from "next";
import Link from "next/link";
import { Button, type ButtonProps } from "@/components/ui";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { USE_CASES, getUseCaseCopy } from "./data";

function linkButtonProps(href: string): ButtonProps {
  return {
    render: <Link href={href} />,
    nativeButton: false,
  } as ButtonProps;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";

  return {
    title: isNl
      ? "Bikefit use cases voor klachten en rijstijlen | BestBikeFit4U"
      : "Bike Fit Use Cases for Pain Points and Riding Styles | BestBikeFit4U",
    description: isNl
      ? "Bekijk use cases voor bikefit bij duurritten, rugklachten, triathlon, gravel, MTB en meer."
      : "Explore bike-fit use cases for endurance riding, back pain, triathlon, gravel, MTB, and more.",
    keywords: isNl
      ? ["bikefit use cases", "rugklachten fietsen", "triathlon bikefit"]
      : ["bike fit use cases", "cycling back pain", "triathlon bike fit"],
    alternates: buildLocaleAlternates("/use-cases", locale),
  };
}

export default async function UseCasesIndexPage() {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/use-cases", locale);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-foreground">
          {isNl ? "Bikefit use cases" : "Bike Fit Use Cases"}
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
          {isNl
            ? "Gebruik deze scenario-pagina's om sneller te bepalen welke fit-aanpassingen en calculators voor jouw situatie relevant zijn."
            : "Use these scenario pages to identify which fit priorities and calculators matter most for your riding situation."}
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {USE_CASES.map((item) => {
            const copy = getUseCaseCopy(item, locale);

            return (
              <article
                key={item.slug}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-foreground">{copy.cardTitle}</h2>
                <p className="mt-3 text-muted-foreground">{copy.cardDescription}</p>
                <Link
                  href={withLocalePrefix(`/use-cases/${item.slug}`, locale)}
                  className="mt-5 inline-flex text-sm font-semibold text-primary hover:text-primary-dark"
                >
                  {isNl ? "Bekijk use case" : "View use case"}
                </Link>
              </article>
            );
          })}
        </div>

        <section className="mt-14 rounded-2xl bg-primary p-8 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground">
            {isNl ? "Wil je je eigen fit laten berekenen?" : "Ready to calculate your own fit?"}
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            {isNl
              ? "Start met de gratis bike fit calculator en ga daarna verder in het dashboard."
              : "Start with the free bike-fit calculator and continue in the dashboard when you need more detail."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              className="bg-background text-primary hover:bg-muted"
              {...linkButtonProps(withLocalePrefix("/calculators/bike-fit", locale))}
            >
              {isNl ? "Open bike fit calculator" : "Open Bike Fit Calculator"}
            </Button>
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="use_cases_cta"
                  ctaLabel={isNl ? "Start gratis fit" : "Start Free Fit"}
                />
              }
              variant="outline"
              className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              {isNl ? "Start gratis fit" : "Start Free Fit"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
