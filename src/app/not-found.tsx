import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Compass, Home, Search, Wrench } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import {
  PublicFeatureCard,
  PublicHero,
  PublicPageShell,
} from "@/components/public";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";

const notFoundCopy = {
  en: {
    eyebrow: "404",
    title: "Our mascot rode to the wrong page",
    description:
      "The page you tried to open does not exist here anymore, the link may be outdated, or the URL may have a typo.",
    chips: ["Broken or outdated link", "Mistyped URL", "Page moved"],
    primaryCta: "Go to homepage",
    secondaryCta: "Back to dashboard",
    quickTitle: "What to try next",
    quickSteps: [
      {
        title: "Check the web address",
        description:
          "Look for a typing mistake in the URL or remove extra characters after the main path.",
        icon: Search,
      },
      {
        title: "Open a core section",
        description:
          "Start again from the homepage, guides, or calculators and navigate from there.",
        icon: Compass,
      },
      {
        title: "Resume your workflow",
        description:
          "If you came from a saved fit or bike page, go back to your dashboard and reopen it from the main navigation.",
        icon: Wrench,
      },
    ],
    helperTitle: "Need a quick reset?",
    helperDescription:
      "Use one of the links below to get back to a stable starting point.",
    links: [
      { label: "Homepage", href: "/" },
      { label: "Bike fit calculator", href: "/calculators/bike-fit" },
      { label: "Guides overview", href: "/guides" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  nl: {
    eyebrow: "404",
    title: "Onze mascotte is naar de verkeerde pagina gereden",
    description:
      "De pagina die je probeerde te openen bestaat hier niet meer, de link kan verouderd zijn of het webadres bevat een typefout.",
    chips: ["Verouderde of kapotte link", "Typefout in de URL", "Pagina verplaatst"],
    primaryCta: "Ga naar home",
    secondaryCta: "Terug naar dashboard",
    quickTitle: "Wat kun je nu doen?",
    quickSteps: [
      {
        title: "Controleer het webadres",
        description:
          "Kijk of er een typefout in de URL staat of verwijder extra tekens achter het hoofdpad.",
        icon: Search,
      },
      {
        title: "Open een hoofdsectie",
        description:
          "Begin opnieuw via de homepage, gidsen of calculators en navigeer van daaruit verder.",
        icon: Compass,
      },
      {
        title: "Pak je workflow weer op",
        description:
          "Kwam je van een opgeslagen fit of fiets, ga dan terug naar je dashboard en open die pagina opnieuw via de navigatie.",
        icon: Wrench,
      },
    ],
    helperTitle: "Snel opnieuw beginnen?",
    helperDescription:
      "Gebruik een van deze links om terug te gaan naar een stabiel startpunt.",
    links: [
      { label: "Homepage", href: "/" },
      { label: "Bike fit calculator", href: "/calculators/bike-fit" },
      { label: "Gidsenoverzicht", href: "/guides" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
} as const;

export default async function NotFound() {
  const locale = await getRequestLocale();
  const copy = notFoundCopy[locale];

  return (
    <PublicPageShell className="min-h-screen bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--secondary)_28%,var(--background)_72%)_100%)]">
      <PublicHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        chips={copy.chips}
        illustrationContainerClassName="border-transparent bg-transparent p-0 shadow-none"
        actions={
          <>
            <Button render={<Link href={withLocalePrefix("/", locale)} />}>
              <Home className="h-4 w-4" />
              {copy.primaryCta}
            </Button>
            <Button
              variant="outline"
              render={<Link href={withLocalePrefix("/dashboard", locale)} />}
            >
              <ArrowLeft className="h-4 w-4" />
              {copy.secondaryCta}
            </Button>
          </>
        }
        illustration={
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-x-10 bottom-1 h-10 rounded-full bg-[color:color-mix(in_oklch,var(--primary)_22%,transparent)] blur-2xl" />
            <Image
              src="/mascote/bestbikefit4u-mascote-on-bike-transparent.png"
              alt={
                locale === "nl"
                  ? "BestBikeFit4U-mascotte op de fiets bij een ontbrekende pagina"
                  : "BestBikeFit4U mascot on a bike at a missing page"
              }
              width={880}
              height={880}
              priority
              className="relative z-10 h-auto w-full object-contain"
            />
          </div>
        }
      />

      <section className="mt-14">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-[color:var(--foreground)]">
            {copy.quickTitle}
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {copy.quickSteps.map((step) => (
            <PublicFeatureCard
              key={step.title}
              icon={<step.icon className="h-5 w-5" />}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-[var(--radius-2xl)] border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_90%,var(--background)_10%)] p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)]">
              {copy.helperTitle}
            </p>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[color:var(--muted-foreground)]">
              {copy.helperDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {copy.links.map((link) => (
              <Button
                key={link.href}
                variant="outline"
                render={<Link href={withLocalePrefix(link.href, locale)} />}
              >
                {link.label}
              </Button>
            ))}
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
