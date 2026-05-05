import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList, Gauge, Ruler, ShieldCheck } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { PublicCtaBand, PublicHero, PublicPageShell, PublicSection, PublicSurfaceCard } from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection, type RelatedLink } from "@/components/seo/RelatedLinksSection";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { BRAND } from "@/config/brand";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { buildBreadcrumbListSchema, buildFaqPageSchema } from "@/lib/seo/jsonLd";
import { buildSelectiveLocaleAlternates } from "@/lib/seo/pageAlternates";

const PAGE_PATH = "/bike-fitting";
const ALTERNATES = buildSelectiveLocaleAlternates({ en: PAGE_PATH }, "en");

const faqItems = [
  {
    q: "Can online bike fitting actually help at home?",
    a: "Yes, as a structured first step. It helps riders turn body measurements and riding goals into specific setup targets before deciding whether they need a full in-person fit.",
  },
  {
    q: "What does a bike fitting calculator usually improve first?",
    a: "Most riders get the most value from clarifying saddle height, general reach and cockpit balance, then testing those changes one at a time on the bike.",
  },
  {
    q: "When should I skip straight to an in-person fitter?",
    a: "If you have persistent pain, recent injury, strong asymmetry, or a performance-specific problem that needs live observation, in-person support is still the better next step.",
  },
] as const;

const relatedLinks: RelatedLink[] = [
  {
    href: "/calculators/bike-fit",
    label: "Bike fit calculator",
    description: "Start with the main calculator for a full at-home fit baseline.",
  },
  {
    href: "/calculators/saddle-height",
    label: "Saddle height calculator",
    description: "Use a faster entry point if saddle height is your biggest open question.",
  },
  {
    href: "/calculators/frame-size",
    label: "Frame size calculator",
    description: "Check whether the bike itself is putting you in a bad starting position.",
  },
  {
    href: "/science/bike-fit-methods",
    label: "Bike fit methods",
    description: "See the methods and limits behind the digital recommendations.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  if (locale !== "en") {
    return {
      title: "Pagina niet gevonden",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: "Bike fitting at home: where to start | BestBikeFit4U",
    description:
      "Learn how to start bike fitting at home with better order, clearer setup targets, and a practical handoff into the bike fit calculator.",
    keywords: [
      "bike fitting",
      "online bike fitting",
      "bike fitting at home",
      "virtual bike fitting",
      "how to fit a bike",
    ],
    openGraph: {
      title: "Bike fitting at home: where to start | BestBikeFit4U",
      description:
        "An English landing page for riders who want a practical first step into online bike fitting.",
      type: "website",
      url: ALTERNATES.canonical,
    },
    alternates: ALTERNATES,
  };
}

export default async function BikeFittingPage() {
  const locale = await getRequestLocale();

  if (locale !== "en") {
    notFound();
  }

  const pagePath = withLocalePrefix(PAGE_PATH, "en");
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const homeUrl = new URL(withLocalePrefix("/", "en"), BRAND.siteUrl).toString();

  return (
    <PublicPageShell className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--secondary)_22%,var(--background)_78%)_100%)]">
      <JsonLd
        schema={[
          buildBreadcrumbListSchema([
            { name: "Home", item: homeUrl },
            { name: "Bike fitting", item: pageUrl },
          ]),
          buildFaqPageSchema([...faqItems]),
        ]}
      />

      <PublicHero
        eyebrow="Online bike fitting"
        title="Bike fitting at home works best when the first step is clear"
        description="You do not need a full studio setup to make better bike-fit decisions. You need a usable order: measure well, start with the biggest setup variables, and use a calculator that turns them into concrete next adjustments."
        chips={["At-home first step", "Calculator-led baseline", "Clearer next adjustments"]}
        actions={
          <>
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/calculators/bike-fit", "en")}
                  locale="en"
                  pagePath={pagePath}
                  section="hero_primary"
                  ctaLabel="Open bike fit calculator"
                />
              }
            >
              Open bike fit calculator
            </Button>
            <Button variant="outline" render={<Link href={withLocalePrefix("/how-it-works", "en")} />}>
              See how it works
            </Button>
          </>
        }
      />

      <PublicSection
        className="mt-10"
        header={{
          eyebrow: "What this page is for",
          title: "A better first layer before you guess",
          description:
            "This page is not trying to replace every fitter. It is here to help riders move from vague discomfort or setup confusion to a better first decision.",
        }}
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <PublicSurfaceCard
            title="Start with the largest variables"
            description="Saddle height, frame fit, and general cockpit balance usually matter more than tiny tweaks."
            leading={<Ruler className="h-5 w-5" />}
          >
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              Fixing order matters. Riders often waste time fine-tuning details while the larger setup is still wrong.
            </p>
          </PublicSurfaceCard>
          <PublicSurfaceCard
            title="Translate fit into actions"
            description="A good digital fit should tell you what to test first, not just dump a list of numbers."
            leading={<ClipboardList className="h-5 w-5" />}
          >
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              The practical value is in prioritization: what to change first, what to leave alone, and what likely needs a live fitter.
            </p>
          </PublicSurfaceCard>
          <PublicSurfaceCard
            title="Know the limits early"
            description="At-home bike fitting is strongest as a first filter, not a guarantee that every issue is solved remotely."
            leading={<ShieldCheck className="h-5 w-5" />}
          >
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              If your problem is persistent pain or a complex asymmetry, this process should help you escalate sooner, not delay the right help.
            </p>
          </PublicSurfaceCard>
        </div>
      </PublicSection>

      <PublicSection
        className="mt-10"
        header={{
          eyebrow: "Practical flow",
          title: "A simple bike-fitting order for home use",
          description:
            "Use a repeatable process so the calculator output becomes something you can actually test on the bike.",
        }}
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <PublicSurfaceCard title="Recommended order" leading={<Gauge className="h-5 w-5" />}>
            <ol className="space-y-3 text-sm leading-6 text-[color:var(--foreground)]">
              <li>1. Measure carefully before you trust any output.</li>
              <li>2. Start with saddle height if your baseline is unclear.</li>
              <li>3. Check frame size if the whole bike feels too stretched or too compact.</li>
              <li>4. Use the full bike fit calculator to connect the setup into one recommendation.</li>
              <li>5. Test one change at a time on the bike.</li>
            </ol>
          </PublicSurfaceCard>
          <PublicSurfaceCard title="Who this route helps most" leading={<ClipboardList className="h-5 w-5" />}>
            <ul className="space-y-3 text-sm leading-6 text-[color:var(--foreground)]">
              <li>Riders comparing comfort vs. performance setup direction</li>
              <li>Anyone unsure whether their bike or position is the bigger problem</li>
              <li>Newer riders who want an at-home starting point before paying for a full fit</li>
            </ul>
          </PublicSurfaceCard>
        </div>
      </PublicSection>

      <RelatedLinksSection locale="en" title="Keep going with the right calculator" links={relatedLinks} />

      <PublicSection
        className="mt-10"
        header={{
          eyebrow: "FAQ",
          title: "Common bike-fitting questions",
        }}
      >
        <div className="space-y-4">
          {faqItems.map((item) => (
            <PublicSurfaceCard key={item.q} title={item.q} titleAs="h3">
              <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">{item.a}</p>
            </PublicSurfaceCard>
          ))}
        </div>
      </PublicSection>

      <div className="mt-10">
        <PublicCtaBand
          eyebrow="Start with a fit baseline"
          title="Ready to turn bike fitting into concrete setup targets?"
          description="Start with the full bike fit calculator and use the output to test your next saddle, reach, and cockpit decisions in a more structured way."
          actions={
            <>
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/calculators/bike-fit", "en")}
                    locale="en"
                    pagePath={pagePath}
                    section="closing_primary"
                    ctaLabel="Start free bike fit"
                  />
                }
              >
                Start free bike fit
              </Button>
              <Button variant="outline" render={<Link href={withLocalePrefix("/calculators/saddle-height", "en")} />}>
                Check saddle height first
              </Button>
            </>
          }
          aside="Use this as a first step for clarity, then decide whether you need a deeper in-person fit."
        />
      </div>
    </PublicPageShell>
  );
}
