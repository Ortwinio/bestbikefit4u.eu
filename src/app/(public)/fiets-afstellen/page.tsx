import { ContentDisclosure } from "@/components/calculators/CalculatorAnswerSection";
import type { Metadata } from "next";
import { editorialImageAlt } from "@/i18n/marketing/editorialImageAlt";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bike,
  CheckCircle2,
  ChevronRight,
  Compass,
  Gauge,
  Info,
  Ruler,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { PublicBreadcrumbs, PublicFeatureCard, PublicInfoPanel } from "@/components/public";
import {
  EditorialCta as PublicCtaBand,
  EditorialHero as PublicHero,
  EditorialShell as PublicPageShell,
  EditorialSection as PublicSection,
} from "@/components/science/EditorialLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { BRAND } from "@/config/brand";
import { setupCopy as pageCopy, setupRelatedCopy, type AnchorItem, type FaqItem } from "@/i18n/marketing/setup";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import type { MarketingEventType } from "@/lib/analytics/marketing";
import { buildArticleSchema, buildBreadcrumbListSchema, buildFaqPageSchema } from "@/lib/seo/jsonLd";

const featureIcons = [Bike, Gauge, Compass] as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = pageCopy[locale];
  const alternates = buildLocaleAlternates("/fiets-afstellen", locale);

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: page.metadata.keywords,
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "article",
      url: alternates.canonical,
    },
    alternates,
  };
}

function AnchorNav({ title, items }: { title: string; items: AnchorItem[] }) {
  return (
    <div className="mt-6 rounded-[var(--radius-2xl)] border border-border bg-muted/40 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{title}</p>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`#${item.id}`}
            className={
              "inline-flex min-h-11 items-center whitespace-nowrap rounded-full border " +
              "border-border bg-background px-3 py-2 text-sm font-medium text-foreground " +
              "transition-colors hover:border-border hover:bg-muted/40 hover:text-primary"
            }
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.q}
          className={"group rounded-[var(--radius-xl)] border border-border bg-background p-4 " + "shadow-sm"}
        >
          <summary
            className={
              "flex cursor-pointer list-none items-start justify-between gap-4 text-left " +
              "text-sm font-semibold text-foreground"
            }
          >
            <span>{item.q}</span>
            <ChevronRight
              className={
                "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform " + "group-open:rotate-90"
              }
            />
          </summary>
          <p className="mt-3 pr-6 text-sm leading-6 text-muted-foreground">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export default async function BikeSetupPage() {
  const locale = await getRequestLocale();
  const page = pageCopy[locale];
  const isNl = locale === "nl";
  const pagePath = withLocalePrefix("/fiets-afstellen", locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const pageViewEvent = "bike_setup_page_view" as MarketingEventType;

  return (
    <PublicPageShell>
      <TrackMarketingEventOnView
        eventType={pageViewEvent}
        locale={locale}
        pagePath={pagePath}
        section="fiets_afstellen"
      />
      <JsonLd
        schema={[
          buildBreadcrumbListSchema([
            {
              name: isNl ? "Home" : "Home",
              item: new URL(withLocalePrefix("/", locale), BRAND.siteUrl).toString(),
            },
            { name: page.title, item: pageUrl },
          ]),
          buildArticleSchema({
            headline: page.title,
            description: page.metadata.description,
            url: pageUrl,
            inLanguage: locale,
          }),
          buildFaqPageSchema(page.sections.faq.items),
        ]}
      />

      <div className="space-y-0">
        <PublicBreadcrumbs
          items={[
            { label: isNl ? "Home" : "Home", href: withLocalePrefix("/", locale) },
            { label: page.title },
          ]}
        />

        <PublicHero answerLocale={locale}
          imageAlt={editorialImageAlt[locale].cockpit}
          eyebrow={page.eyebrow}
          title={page.title}
          description={page.intro}
          chips={page.chips}
          actions={
            <>
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/calculators/bike-fit", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="fiets_afstellen_hero_primary"
                    ctaLabel={page.primaryCta}
                  />
                }
              >
                {page.primaryCta}
              </Button>
              <Button
                variant="outline"
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/calculators/saddle-height", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="fiets_afstellen_hero_secondary"
                    ctaLabel={page.secondaryCta}
                  />
                }
              >
                {page.secondaryCta}
              </Button>
            </>
          }
        />

        <AnchorNav title={page.anchorTitle} items={page.anchors} />

        <ContentDisclosure title={page.sections.start.title}>
          <PublicSection
            id={isNl ? "waar-begin-je" : "where-to-start"}
            className="mt-10 scroll-mt-28"
            header={{
              eyebrow: page.sections.start.eyebrow,
              title: page.sections.start.title,
              description: page.sections.start.description,
            }}
          >
            <div className="space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
              {page.sections.start.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {page.sections.start.steps.map((step, index) => {
                const Icon = featureIcons[index] ?? Wrench;
                return (
                  <PublicFeatureCard
                    key={step.title}
                    icon={<Icon className="h-5 w-5" />}
                    title={step.title}
                    description={step.body}
                  />
                );
              })}
            </div>

            <PublicInfoPanel
              className="mt-6"
              tone="primary"
              icon={<Info />}
              title={isNl ? "Belangrijk" : "Important"}
            >
              {isNl
                ? "Werk van groot naar klein: eerst trapbeweging en bekkencontrole, daarna " +
                  "cockpitbalans, daarna pas detailafstelling."
                : "Work from big to small: first pedaling and pelvic control, then cockpit " +
                  "balance, then the finer details."}
            </PublicInfoPanel>
          </PublicSection>
        </ContentDisclosure>

        <ContentDisclosure title={page.sections.order.title}>
          <PublicSection
            id={isNl ? "afstelvolgorde" : "setup-order"}
            className="mt-10 scroll-mt-28"
            header={{
              eyebrow: page.sections.order.eyebrow,
              title: page.sections.order.title,
              description: page.sections.order.description,
            }}
          >
            <ol className="grid gap-4 md:grid-cols-2">
              {page.sections.order.items.map((item, index) => (
                <li
                  key={item}
                  className="rounded-[var(--radius-xl)] border border-border bg-background p-4 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-base font-semibold text-foreground">{item}</p>
                </li>
              ))}
            </ol>
          </PublicSection>
        </ContentDisclosure>

        <ContentDisclosure title={page.sections.saddleHeight.title}>
          <PublicSection
            id={isNl ? "zadelhoogte-afstellen" : "saddle-height"}
            className="mt-10 scroll-mt-28"
            header={{
              eyebrow: page.sections.saddleHeight.eyebrow,
              title: page.sections.saddleHeight.title,
              description: page.sections.saddleHeight.description,
            }}
          >
            <div className="space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
              {page.sections.saddleHeight.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[var(--radius-xl)] border border-border bg-muted/40 p-4">
                <h3 className="text-base font-semibold text-foreground">
                  {isNl ? "Signalen dat je zadel te hoog staat" : "Signs your saddle is too high"}
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  {page.sections.saddleHeight.highSignals.map((signal) => (
                    <li key={signal} className="flex gap-2">
                      <span className="mt-1 text-destructive-text">•</span>
                      <span>{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[var(--radius-xl)] border border-border bg-muted/40 p-4">
                <h3 className="text-base font-semibold text-foreground">
                  {isNl ? "Signalen dat je zadel te laag staat" : "Signs your saddle is too low"}
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  {page.sections.saddleHeight.lowSignals.map((signal) => (
                    <li key={signal} className="flex gap-2">
                      <span className="mt-1 text-success-text">•</span>
                      <span>{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/calculators/saddle-height", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="fiets_afstellen_saddle_height_cta"
                    ctaLabel={page.sections.saddleHeight.inlineCta}
                  />
                }
              >
                {page.sections.saddleHeight.inlineCta}
              </Button>
            </div>
          </PublicSection>
        </ContentDisclosure>

        <ContentDisclosure title={page.sections.saddlePosition.title}>
          <PublicSection
            id="zadelpositie"
            className="mt-10 scroll-mt-28"
            header={{
              eyebrow: page.sections.saddlePosition.eyebrow,
              title: page.sections.saddlePosition.title,
              description: page.sections.saddlePosition.description,
            }}
          >
            <div className="space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
              {page.sections.saddlePosition.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <PublicInfoPanel
              className="mt-6"
              tone="warning"
              icon={<AlertTriangle />}
              title={page.sections.saddlePosition.warningTitle}
            >
              {page.sections.saddlePosition.warningBody}
            </PublicInfoPanel>
          </PublicSection>
        </ContentDisclosure>

        <ContentDisclosure title={page.sections.cockpit.title}>
          <PublicSection
            id={isNl ? "stuur-afstellen-racefiets" : "road-handlebar-setup"}
            className="mt-10 scroll-mt-28"
            header={{
              eyebrow: page.sections.cockpit.eyebrow,
              title: page.sections.cockpit.title,
              description: page.sections.cockpit.description,
            }}
          >
            <div className="space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
              {page.sections.cockpit.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-6 rounded-[var(--radius-xl)] border border-border bg-muted/40 p-4">
              <h3 className="text-base font-semibold text-foreground">
                {isNl
                  ? "Signalen dat je cockpit te lang of te laag is"
                  : "Signs your cockpit is too long or too low"}
              </h3>
              <ul className="mt-3 grid gap-2 md:grid-cols-2">
                {page.sections.cockpit.signs.map((sign) => (
                  <li key={sign} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                    <span className="mt-1 text-primary">•</span>
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </div>
          </PublicSection>
        </ContentDisclosure>

        <ContentDisclosure title={page.sections.reachDrop.title}>
          <PublicSection
            id={isNl ? "reach-en-stuurdrop" : "reach-and-drop"}
            className="mt-10 scroll-mt-28"
            header={{
              eyebrow: page.sections.reachDrop.eyebrow,
              title: page.sections.reachDrop.title,
              description: page.sections.reachDrop.description,
            }}
          >
            <div className="space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
              {page.sections.reachDrop.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <p>
                {isNl
                  ? "Wil je de relatie tussen framevorm en cockpit nog scherper begrijpen? " + "Bekijk dan de "
                  : "If you want to understand the frame-to-cockpit relationship in more detail, " + "see the "}
                <Link
                  href={withLocalePrefix("/science/stack-and-reach", locale)}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {isNl ? "stack en reach-pagina" : "stack and reach page"}
                </Link>
                .
              </p>
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/calculators/bike-fit", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="fiets_afstellen_reach_drop_cta"
                    ctaLabel={page.sections.reachDrop.inlineCta}
                  />
                }
              >
                {page.sections.reachDrop.inlineCta}
              </Button>
            </div>
          </PublicSection>
        </ContentDisclosure>

        <ContentDisclosure title={page.sections.cleats.title}>
          <PublicSection
            id={isNl ? "schoenplaatjes-afstellen" : "cleat-setup"}
            className="mt-10 scroll-mt-28"
            header={{
              eyebrow: page.sections.cleats.eyebrow,
              title: page.sections.cleats.title,
              description: page.sections.cleats.description,
            }}
          >
            <div className="space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
              {page.sections.cleats.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <ul
              className={
                "mt-6 space-y-2 rounded-[var(--radius-xl)] border border-border " +
                "bg-background p-4 text-sm leading-6 text-muted-foreground"
              }
            >
              {page.sections.cleats.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span className="mt-1 text-primary">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </PublicSection>
        </ContentDisclosure>

        <ContentDisclosure title={page.sections.context.title}>
          <PublicSection
            id="racefiets-afstellen"
            className="mt-10 scroll-mt-28"
            header={{
              eyebrow: page.sections.context.eyebrow,
              title: page.sections.context.title,
              description: page.sections.context.description,
            }}
          >
            <div className="space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
              {page.sections.context.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <p>
                {isNl
                  ? "Wil je eerst begrijpen hoe de methode achter deze keuzes werkt? Lees dan " + "meer op "
                  : "If you want to understand the method behind these choices first, read more on "}
                <Link
                  href={withLocalePrefix("/science/bike-fit-methods", locale)}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {isNl ? "deze bikefitting-methodespagina" : "this bike-fitting methods page"}
                </Link>
                .
              </p>
            </div>
          </PublicSection>
        </ContentDisclosure>

        <PublicSection
          id={isNl ? "zelf-afstellen-of-bikefitting" : "self-setup-or-bike-fitting"}
          className="mt-10 scroll-mt-28"
          header={{
            eyebrow: page.sections.fitChoice.eyebrow,
            title: page.sections.fitChoice.title,
            description: page.sections.fitChoice.description,
          }}
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {page.sections.fitChoice.cards.map((card) => (
              <div
                key={card.title}
                className="rounded-[var(--radius-xl)] border border-border bg-background p-4 shadow-sm"
              >
                <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  {card.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/calculators/bike-fit", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="fiets_afstellen_fit_choice_primary"
                  ctaLabel={page.sections.fitChoice.primaryCta}
                />
              }
            >
              {page.sections.fitChoice.primaryCta}
            </Button>
            <Button
              variant="outline"
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="fiets_afstellen_fit_choice_secondary"
                  ctaLabel={page.sections.fitChoice.secondaryCta}
                />
              }
            >
              {page.sections.fitChoice.secondaryCta}
            </Button>
          </div>
        </PublicSection>

        <PublicSection data-usability="safety"
          id="veiligheid"
          className="mt-10 scroll-mt-28"
          header={{
            eyebrow: page.sections.safety.eyebrow,
            title: page.sections.safety.title,
            description: page.sections.safety.body,
          }}
        >
          <PublicInfoPanel tone="warning" icon={<ShieldCheck />} title={page.sections.safety.title}>
            <ul className="space-y-2">
              {page.sections.safety.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span className="mt-1 text-warning-text">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </PublicInfoPanel>
        </PublicSection>

        <PublicSection
          id="faq"
          className="mt-10 scroll-mt-28"
          header={{
            eyebrow: page.sections.faq.eyebrow,
            title: page.sections.faq.title,
            description: page.sections.faq.description,
          }}
        >
          <FaqList items={page.sections.faq.items} />
        </PublicSection>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href={withLocalePrefix("/guides", locale)}
            className={
              "group rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-sm " +
              "transition-colors hover:border-border hover:bg-muted/40"
            }
          >
            <p className="text-sm font-semibold text-foreground">
              {isNl ? "Verder lezen in de gidsenbibliotheek" : "Continue in the guides library"}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {setupRelatedCopy[locale]}
            </p>
          </Link>
          <Link
            href={withLocalePrefix("/measurement-guide", locale)}
            className={
              "group rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-sm " +
              "transition-colors hover:border-border hover:bg-muted/40"
            }
          >
            <p className="text-sm font-semibold text-foreground">
              {isNl ? "Controleer eerst je meetmethode" : "Check your measurement method first"}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {isNl
                ? "Gebruik de meetgids als je onzeker bent over binnenbeenlengte, framelogica " +
                  "of basisinput."
                : "Use the measurement guide if you are unsure about inseam, frame logic, or " +
                  "your base inputs."}
            </p>
          </Link>
        </div>

        <PublicCtaBand
          className="mt-10"
          eyebrow={page.sections.bottomCta.eyebrow}
          title={page.sections.bottomCta.title}
          description={page.sections.bottomCta.description}
          actions={
            <>
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/calculators/bike-fit", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="fiets_afstellen_bottom_primary"
                    ctaLabel={page.sections.bottomCta.primaryCta}
                  />
                }
              >
                {page.sections.bottomCta.primaryCta}
              </Button>
              <Button
                variant="outline"
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/login", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="fiets_afstellen_bottom_secondary"
                    ctaLabel={page.sections.bottomCta.secondaryCta}
                  />
                }
              >
                {page.sections.bottomCta.secondaryCta}
              </Button>
            </>
          }
          aside={
            <div className="space-y-1">
              <p>
                {isNl
                  ? "Wil je ook zadelhoogte, reach en drop per fiets bewaren?"
                  : "Want to save saddle height, reach, and drop per bike?"}
              </p>
              <p className="font-medium text-foreground">
                {isNl
                  ? "Begin publiek, verfijn daarna in je account."
                  : "Start publicly, then refine it inside your account."}
              </p>
            </div>
          }
        />

        <div className="mt-10 flex flex-wrap gap-3 text-sm">
          <Link
            href={withLocalePrefix("/calculators/frame-size", locale)}
            className={
              "inline-flex min-h-11 items-center gap-1 text-primary transition-colors " + "hover:text-primary"
            }
          >
            <Ruler className="h-4 w-4" />
            {isNl ? "Framemaat calculator" : "Frame size calculator"}
          </Link>
          <Link
            href={withLocalePrefix("/calculators/crank-length", locale)}
            className={
              "inline-flex min-h-11 items-center gap-1 text-primary transition-colors " + "hover:text-primary"
            }
          >
            <ArrowRight className="h-4 w-4" />
            {isNl ? "Cranklengte calculator" : "Crank length calculator"}
          </Link>
          <Link
            href={withLocalePrefix("/how-it-works", locale)}
            className={
              "inline-flex min-h-11 items-center gap-1 text-primary transition-colors " + "hover:text-primary"
            }
          >
            <Wrench className="h-4 w-4" />
            {isNl ? "Hoe het werkt" : "How it works"}
          </Link>
        </div>
      </div>
    </PublicPageShell>
  );
}
