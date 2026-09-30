import { useState } from "react";
import { OptionCard, ResultHero } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { performanceMessages } from "@/i18n/calculators/performance";
import {
  FTP_RATING_THRESHOLDS, ftpRating, fuelHydration, carbohydrateGuidance,
} from "@/lib/public-calculators/performance";

export function Sources({ locale, fuel }: { locale: Locale; fuel: boolean }) {
  const copy = performanceMessages[locale];
  const sources = fuel
    ? [[copy.carbSource, copy.carbSourceUrl], [copy.fluidSource, copy.fluidSourceUrl]]
    : [[copy.ftpSource, copy.ftpSourceUrl]];
  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <h2 className="font-display text-xl font-bold">{copy.sources}</h2>
      <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
        {sources.map(([text, url]) => (
          <li key={url}>
            <a href={url} rel="noopener" className="inline-block min-h-11 underline underline-offset-4">{text}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FuelResults({
  locale, guidance, easy,
}: { locale: Locale; guidance: ReturnType<typeof fuelHydration>; easy: boolean }) {
  const copy = performanceMessages[locale];
  const format = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
  const range = (value: { min: number; max: number }) => `${format(value.min)}–${format(value.max)}`;
  const carbs = guidance.carbohydrate;
  return (
    <section className="space-y-5 rounded-3xl border border-border bg-card p-6">
      <h2 className="font-display text-2xl font-bold">{copy.carbohydrate}</h2>
      <p className="font-mono text-2xl font-bold" data-testid="carbohydrate-band">
        {carbs.gramsPerHour === null ? copy.smallCarbs : carbs.band === "none" ? copy.noCarbs :
          `${copy.upTo} ${format(carbs.gramsPerHour)} g/h`}
      </p>
      {carbs.totalGrams !== null && carbs.band !== "none" && (
        <p>{copy.rideTotal}: {copy.upTo.toLowerCase()} {format(carbs.totalGrams)} g</p>
      )}
      {carbs.requiresMultipleCarbohydrates && <p className="font-semibold">{copy.multipleCarbs}</p>}
      {carbs.band === "upTo60" && <p>{copy.singleCarbs}</p>}
      {easy && <p>{copy.easyCarbs}</p>}
      <dl className="space-y-4 border-t border-border pt-5">
        <div><dt>{copy.fluid}</dt><dd className="font-mono text-2xl">{range(guidance.fluidLitresPerHour)} L/h</dd></div>
      </dl>
      <p className="text-sm text-muted-foreground">{copy.fluidContext}</p>
      <p className="font-semibold">{copy.bandPosition}</p>
      <p className="text-sm text-muted-foreground">{copy.bandReason}</p>
      <p>
        {copy.selectedPosition}: {format(guidance.selectedFluidLitresPerHour)} L/h
      </p>
      <p>{copy.rideTotal}: {range(guidance.totalFluidLitres)} L</p>
      <p className="font-semibold">{copy.bottles}: {range(guidance.bottles)}</p>
      <p className="text-sm text-muted-foreground">{copy.bottleMath}</p>
      {guidance.sodiumMgPerLitre && guidance.sodiumMgPerBottle && (
        <div className="space-y-3 border-t border-border pt-5" data-testid="sodium-guidance">
          <h3 className="font-semibold">{copy.sodium}</h3>
          <p>{copy.sodiumConcentration}</p>
          <p>{copy.sodiumPerBottle}: {range(guidance.sodiumMgPerBottle)} mg</p>
          <p className="text-sm text-muted-foreground">{copy.sodiumConversion}</p>
        </div>
      )}
      <p>{copy.weigh}</p>
      <p>{copy.bodyMass}</p>
      <p className="font-semibold">{copy.fuelStart}</p>
    </section>
  );
}

export function FtpRatings({ locale, wattsPerKg, onComparisonChange }: {
  locale: Locale; wattsPerKg: number; onComparisonChange?: (value: "both" | "men" | "women") => void;
}) {
  const copy = performanceMessages[locale];
  const [comparison, setComparison] = useState<"both" | "men" | "women">("both");
  const format = (value: number) => new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(value);
  return (
    <section className="space-y-5 rounded-3xl border border-border bg-card p-6">
      <h2 className="font-display text-2xl font-bold">{copy.ratingTitle}</h2>
      <p className="text-sm text-muted-foreground">{copy.indication}</p>
      <fieldset>
        <legend className="mb-2 font-semibold">{copy.comparison}</legend>
        <div className="grid grid-cols-3 gap-2">
          {(["both", "men", "women"] as const).map((key) => (
            <OptionCard
              key={key}
              label={copy.comparisons[key]}
              selected={comparison === key}
              showCheck={false}
              className="min-h-11 min-w-0 px-2 text-sm"
              onClick={() => { setComparison(key); onComparisonChange?.(key); }}
            />
          ))}
        </div>
      </fieldset>
      {(["men", "women"] as const).map((gender) => {
        const rating = ftpRating(wattsPerKg, gender);
        const active = comparison === "both" || comparison === gender;
        const thresholds = FTP_RATING_THRESHOLDS[gender];
        return (
          <div key={gender} data-testid={`rating-${gender}`}>
            <p className="mb-2 font-semibold">
              {copy.comparisons[gender]}{active ? ` · ${copy.ratings[rating]}` : ""}
            </p>
            <div className="flex gap-1" aria-hidden="true">
              {[...thresholds].reverse().map((entry) => (
                <span key={entry.rating} className={
                  "h-3 flex-1 rounded-full " + (active && entry.rating === rating ? "bg-primary" : "bg-muted")
                } />
              ))}
            </div>
          </div>
        );
      })}
      <table className="w-full text-left text-xs sm:text-sm">
        <caption className="sr-only">{copy.ratingTitle} (W/kg)</caption>
        <thead>
          <tr>
            <th scope="col" className="py-2">{copy.rating}</th>
            <th scope="col" className="py-2">{copy.comparisons.men}</th>
            <th scope="col" className="py-2">{copy.comparisons.women}</th>
          </tr>
        </thead>
        <tbody>
          {FTP_RATING_THRESHOLDS.men.map((entry, index) => (
            <tr key={entry.rating} className="border-t border-border">
              <th scope="row" className="py-3 pr-1 font-medium">{copy.ratings[entry.rating]}</th>
              {(["men", "women"] as const).map((gender) => {
                const thresholds = FTP_RATING_THRESHOLDS[gender];
                const current = thresholds[index];
                const selected = (comparison === "both" || comparison === gender) &&
                  ftpRating(wattsPerKg, gender) === entry.rating;
                const label = index === 0 ? `≥ ${format(current.min)}` : index === thresholds.length - 1
                  ? `< ${format(thresholds[index - 1].min)}`
                  : `${format(current.min)}–${format(thresholds[index - 1].min - 0.01)}`;
                return (
                  <td key={gender} className={"py-3 " + (selected ? "bg-accent font-bold text-accent-foreground" : "")}>
                    {label}{selected && <span className="sr-only"> · {copy.yourBand}</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-muted-foreground">{copy.ratingPrecision}</p>
    </section>
  );
}


export function FuelHeadline({ locale, carbohydrate, durationHours, fluid }: {
  locale: Locale;
  carbohydrate: ReturnType<typeof carbohydrateGuidance>;
  durationHours: number;
  fluid: { min: number; max: number };
}) {
  const copy = performanceMessages[locale];
  const format = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
  const numeric = carbohydrate.gramsPerHour !== null && carbohydrate.band !== "none";
  const value = carbohydrate.band === "none" ? copy.noCarbs : carbohydrate.gramsPerHour === null
    ? copy.smallCarbs : `${copy.upTo} ${format(carbohydrate.gramsPerHour)}`;
  return (
    <ResultHero
      label={copy.carbohydrate}
      value={value}
      unit={numeric ? copy.carbsPerHour : undefined}
      className={numeric ? undefined : "[&_dd]:text-3xl [&_dd]:leading-tight"}
      subtext={
        <div className="space-y-2">
          {numeric && <p>{copy.rideTotal}: {copy.upTo.toLowerCase()} {format(carbohydrate.totalGrams!)} g</p>}
          {carbohydrate.requiresMultipleCarbohydrates && <p>{copy.multipleCarbs}</p>}
          <p className="font-semibold">{copy.fluid}: {format(fluid.min)}–{format(fluid.max)} L/h</p>
          <p className="text-sm">{copy.duration}: {format(durationHours)} {copy.hour}</p>
          <p className="text-sm">{copy.fuelStart}</p>
        </div>
      }
    />
  );
}
