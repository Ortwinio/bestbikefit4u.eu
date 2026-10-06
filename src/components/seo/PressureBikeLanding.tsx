import { PressureDisplay } from "@/components/features/pressure/PressureDisplay";
import { ContentDisclosure, ShortAnswer } from "@/components/calculators/CalculatorAnswerSection";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { pressureBikeLandingMessages } from "@/i18n/marketing/pressureBikeLanding";
import nl from "@/i18n/messages/nl";
import en from "@/i18n/messages/en";
import { getLocalizedPublicCalculatorPath } from "@/lib/public-calculators";
import { buildFaqPageSchema } from "@/lib/seo/jsonLd";
import { BIKE_TYPE_LABELS, BIKE_TYPE_DEFAULTS, buildPressureBikeTable, type EnBikeType } from "@/lib/seo/programmatic/tirePressure";
import { JsonLd } from "./JsonLd";

export function PressureBikeLanding({ bikeType, locale }: { bikeType: EnBikeType; locale: Locale }) {
  const copy = pressureBikeLandingMessages[locale];
  const labels = BIKE_TYPE_LABELS[bikeType];
  const defaults = BIKE_TYPE_DEFAULTS[bikeType];
  const rows = buildPressureBikeTable(bikeType);
  const number = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
  const warningCopy = (locale === "nl" ? nl : en).pressure.result.warningMessages;
  const warnings = [...new Set(rows.flatMap(row => [...row.tubeless.warnings, ...row.innerTube.warnings]))];
  const faqs = [{ q: copy.faqWeight, a: copy.faqWeightAnswer }, { q: copy.faqTube, a: copy.faqTubeAnswer },
    { q: copy.faqFixed, a: copy.faqFixedAnswer }];
  const calculatorPath = withLocalePrefix(getLocalizedPublicCalculatorPath("tire-pressure", locale), locale);
  const button = "inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground";
  return <article className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-8">
    <JsonLd schema={buildFaqPageSchema(faqs)} />
    <header className="grid items-center gap-8 md:grid-cols-[1.5fr_1fr]">
      <div className="space-y-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">{copy.eyebrow}</p>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">{copy.title(labels[locale])}</h1>
        <ShortAnswer text={copy.intro} locale={locale} />
        <Link href={calculatorPath} className={button}>{copy.calculator}</Link>
      </div>
      <Image src="/illustrations/04-bandenspanning.webp" alt={copy.illustration} width={392} height={350}
        sizes="(max-width: 767px) 85vw, 392px" className="mx-auto h-auto w-full max-w-[392px]" />
    </header>
    <ContentDisclosure title={copy.assumptions}>
<section aria-labelledby="pressure-bike-assumptions" className="rounded-3xl bg-[var(--bbf-petrol-zacht)] p-6 text-[var(--bbf-inkt)]">
      <h2 id="pressure-bike-assumptions" className="font-display text-2xl font-bold">{copy.assumptions}</h2>
      <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[{ label: copy.width, value: `${defaults.widthFrontMm} / ${defaults.widthRearMm} mm` },
          { label: copy.bikeWeight, value: "8 kg" }, { label: copy.goal, value: copy.balanced },
          { label: copy.surface, value: copy.surfaces[defaults.surface as keyof typeof copy.surfaces] }].map(item =>
          <div key={item.label}><dt className="text-sm text-[var(--bbf-gedempt)]">{item.label}</dt>
            <dd className="mt-1 font-semibold">{item.value}</dd></div>)}
      </dl>
    </section>
</ContentDisclosure>
    <section aria-labelledby="pressure-bike-table">
      <h2 id="pressure-bike-table" className="font-display text-3xl font-bold">{copy.table}</h2>
      <p className="mt-3 text-muted-foreground">{copy.tableHint}</p>
      {rows[0] && <figure className="mt-5 max-w-xl">
        <figcaption className="mb-3 text-sm text-muted-foreground">
          {copy.weight}: {rows[0].weightKg} kg · {copy.tubeless}
        </figcaption>
        <PressureDisplay {...rows[0].tubeless} locale={locale} compact />
      </figure>}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {(["tubeless", "innerTube"] as const).map(setup => <div key={setup} className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-sm" data-pressure-setup={setup}>
            <caption className="bg-muted p-4 text-left font-display text-xl font-bold">{copy[setup]}</caption>
            <thead><tr className="border-b border-border">
              <th scope="col" className="p-3">{copy.weight}</th>
              <th scope="col" className="p-3">{copy.front}<span className="block text-xs font-normal">{copy.unit}</span></th>
              <th scope="col" className="p-3">{copy.rear}<span className="block text-xs font-normal">{copy.unit}</span></th>
            </tr></thead>
            <tbody>{rows.map(row => <tr key={row.weightKg} className="border-b border-border last:border-0 even:bg-muted/40">
              <th scope="row" className="p-3 font-medium">{row.weightKg} kg</th>
              <td className="p-3 font-mono">{number(row[setup].frontBar)} / {number(row[setup].frontPsi)}</td>
              <td className="p-3 font-mono">{number(row[setup].rearBar)} / {number(row[setup].rearPsi)}</td>
            </tr>)}</tbody>
          </table>
        </div>)}
      </div>
    </section>
    <section data-usability="safety" className="rounded-3xl border border-border p-6" aria-labelledby="pressure-bike-limits">
      <h2 id="pressure-bike-limits" className="font-display text-2xl font-bold">{copy.limitsTitle}</h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">{copy.limits}</p>
      {warnings.length > 0 && <div className="mt-4"><h3 className="font-semibold">{copy.warning}</h3>
        <ul className="mt-2 list-disc space-y-2 pl-5">{warnings.map(warning => <li key={warning}>{warningCopy[warning]}</li>)}</ul>
      </div>}
    </section>
    <section aria-labelledby="pressure-bike-faq">
      <h2 id="pressure-bike-faq" className="font-display text-3xl font-bold">{copy.faq}</h2>
      <div className="mt-5 divide-y divide-border">{faqs.map(faq => <details key={faq.q} className="py-4">
        <summary className="min-h-11 cursor-pointer font-semibold">{faq.q}</summary>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">{faq.a}</p>
      </details>)}</div>
    </section>
    <div className="flex flex-wrap gap-4">
      <Link href={calculatorPath} className={button}>{copy.calculator}</Link>
      <Link href={withLocalePrefix(labels.guideHref, locale)} className="inline-flex min-h-11 items-center font-semibold text-primary underline">{copy.guide}</Link>
    </div>
  </article>;
}
