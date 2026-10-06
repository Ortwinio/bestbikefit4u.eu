import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getProfileScoreCopy } from "@/i18n/account/profileScore";
import { withLocalePrefix } from "@/i18n/navigation";
import { BASE_BIKE_RULES, BASE_RIDER_RULES, BIKE_REFINEMENT_RULES, BIKE_RULES, REFINEMENT_RULES, RIDER_RULES, type ScoreRule } from "../../../shared/profileScore";
import { isPaidAccessEnforced } from "../../../shared/pricing/flags";
import { getPricingAccessCopy, getRefinementScoreLabel } from "@/i18n/account/pricingAccess";
import { ProfileScorePaidBoundary } from "./ProfileScorePaidBoundary";
import { ProfileStrengthRings } from "./ProfileStrengthRings";

export function ProfileScoreExplainer({ locale }: { locale: Locale }) {
  const copy = getProfileScoreCopy(locale);
  const pricing = getPricingAccessCopy(locale);
  const enforced = isPaidAccessEnforced();
  const weightLabel = (weight: number) => weight.toLocaleString(locale, { maximumFractionDigits: 1 });
  const panel = "rounded-3xl border border-border bg-card p-5 sm:p-8";
  const heading = "font-display text-2xl font-bold tracking-tight";
  function weights(title: string, rules: readonly ScoreRule[]) {
    return <section className={panel}>
      <h2 className={heading}>{title}</h2>
      <div className="mt-6 space-y-6">
        {[...new Set(rules.map(rule => rule.group))].map(group => {
          const members = rules.filter(rule => rule.group === group);
          return <div key={group}>
            <h3 className="flex justify-between gap-4 font-semibold">
              <span>{copy.groups[group as keyof typeof copy.groups]}</span>
              <span className="font-mono">{weightLabel(members.reduce((sum, rule) => sum + rule.weight, 0))}</span>
            </h3>
            <dl className="mt-2 divide-y divide-border">
              {members.map(rule => <div className="flex justify-between gap-4 py-2 text-sm" key={rule.key}>
                <dt className="min-w-0 text-muted-foreground">{copy.fields[rule.key as keyof typeof copy.fields] ?? getRefinementScoreLabel(locale, rule.key) ?? pricing.bikeFields[rule.key as keyof typeof pricing.bikeFields]}</dt>
                <dd className="shrink-0 font-mono">{weightLabel(rule.weight)}</dd>
              </div>)}
            </dl>
          </div>;
        })}
      </div>
    </section>;
  }
  function factors(title: string, rows: string[][]) {
    return <section className={panel}>
      <h2 className={heading}>{title}</h2>
      <dl className="mt-5 divide-y divide-border">
        {rows.map(([label, factor]) => <div key={label} className="flex justify-between gap-4 py-3">
          <dt className="min-w-0">{label}</dt><dd className="shrink-0 font-mono">{factor}</dd>
        </div>)}
      </dl>
    </section>;
  }
  return <article className="mx-auto max-w-6xl space-y-8 p-4 text-foreground sm:p-8">
    <Link href={withLocalePrefix("/profile", locale)} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline underline-offset-4">
      {copy.back}
    </Link>
    <header className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">{copy.eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{copy.pageTitle}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{copy.intro}</p>
      </div>
      <figure className="min-w-0">
        <ProfileStrengthRings score={{ completeness: 68, reliability: 57 }} locale={locale} />
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">{copy.example}</figcaption>
      </figure>
    </header>
    <p className="rounded-2xl border border-border bg-muted p-5 font-medium leading-relaxed">{copy.disclaimer}</p>
    {enforced && <><p className="rounded-2xl border border-border p-5">{pricing.cap}</p>
      <ProfileScorePaidBoundary locale={locale} /></>}
    <div className="grid gap-6 lg:grid-cols-2">
      <section className={panel}><h2 className={heading}>{copy.completenessTitle}</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">{copy.completenessText}</p></section>
      <section className={panel}><h2 className={heading}>{copy.reliabilityTitle}</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">{copy.reliabilityText}</p>
        <p className="mt-4 rounded-xl bg-muted p-4 text-sm font-semibold">{copy.formula}</p></section>
    </div>
    <section className={panel}>
      <h2 className={heading}>{copy.levelsTitle}</h2>
      <p className="mt-3 text-muted-foreground">{copy.levelsText}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["basic", "building", "strong", "complete"] as const).map((level, index) =>
          <div key={level} className="rounded-2xl bg-muted p-4">
            <dt className="font-semibold">{copy.levels[level]}</dt>
            <dd className="mt-2 font-mono">{["0–39", "40–69", "70–89", "90–100"][index]}</dd>
          </div>)}
      </dl>
    </section>
    <div className="grid items-start gap-6 lg:grid-cols-2">
      {factors(copy.qualityTitle, copy.qualityRows)}
      <section className={panel}><h2 className={heading}>{copy.freshnessTitle}</h2>
        <ul className="mt-5 list-disc space-y-3 pl-5 leading-relaxed">
          {copy.freshnessRows.map(text => <li key={text}>{text}</li>)}
        </ul><p className="mt-5 text-sm leading-relaxed text-muted-foreground">{copy.unknownDate}</p>
      </section>
    </div>
    <div className={`${panel} space-y-4 leading-relaxed text-muted-foreground`}>
      <p>{copy.warning}</p><p>{copy.legacy}</p>
    </div>
    <div className="grid items-start gap-6 lg:grid-cols-2">
      {weights(copy.riderWeights, enforced ? [...BASE_RIDER_RULES, ...REFINEMENT_RULES] : RIDER_RULES)}
      {weights(copy.bikeWeights, enforced ? [...BASE_BIKE_RULES, ...BIKE_REFINEMENT_RULES] : BIKE_RULES)}
    </div>
    {factors(copy.bikeQualityTitle, copy.bikeQualityRows)}
    <p className="text-sm leading-relaxed text-muted-foreground">{copy.bikeNote}</p>
    <section className={panel}>
      <h2 className={heading}>{copy.nextTitle}</h2>
      <p className="mt-4 leading-relaxed">{copy.nextText}</p>
      <p className="mt-4 leading-relaxed text-muted-foreground">{copy.adviceNote}</p>
    </section>
  </article>;
}
