"use client";

import { Bike, Gauge, Route, Target } from "lucide-react";
import { MetricTile, ResultsSection, StatusPill } from "./ResultsPrimitives";
import type { ReportV2Copy } from "@/lib/reports/reportV2Copy";
import type { ReportV2Payload } from "@/lib/reports/reportV2Types";

type BikeContextCardProps = {
  bike: ReportV2Payload["bike"];
  copy: ReportV2Copy;
};

const LOCALE_VALUE_LABELS = {
  en: {
    bikeType: {
      road: "Road",
      gravel: "Gravel",
      mountain: "Mountain",
      hybrid: "Hybrid",
      tt_triathlon: "TT / triathlon",
      cyclocross: "Cyclocross",
      touring: "Touring",
      city: "City",
    },
    ridingStyle: {
      recreational: "Recreational",
      fitness: "Fitness",
      sportive: "Sportive",
      racing: "Racing",
      commuting: "Commuting",
      touring: "Touring",
    },
    goal: {
      comfort: "Comfort",
      balanced: "Balanced",
      performance: "Performance",
      aero: "Aero",
    },
    experienceLevel: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
    },
    weeklyHours: {
      "0-3": "0-3 hrs/week",
      "3-6": "3-6 hrs/week",
      "6-10": "6-10 hrs/week",
      "10-15": "10-15 hrs/week",
      "15+": "15+ hrs/week",
    },
    rideLength: {
      short: "Short (<30 km)",
      medium: "Medium (30-80 km)",
      long: "Long (80-150 km)",
      ultra: "Ultra (150+ km)",
    },
    positionPriority: {
      comfort: "Maximum comfort",
      balanced: "Balanced",
      performance: "Performance",
    },
    typeOfRiding: {
      casual: "Casual / fitness",
      group: "Group rides",
      training: "Structured training",
      racing: "Racing",
      tt: "Time trial / triathlon",
      asphalt: "Asphalt only",
      paved: "Paved + light gravel",
      xc: "Cross-country",
      trail: "Trail",
      enduro: "Enduro",
      dh: "Downhill / bike park",
    },
  },
  nl: {
    bikeType: {
      road: "Racefiets",
      gravel: "Gravelbike",
      mountain: "Mountainbike",
      hybrid: "Hybride fiets",
      tt_triathlon: "TT / triatlon",
      cyclocross: "Cyclocross",
      touring: "Toerfiets",
      city: "Stadsfiets",
    },
    ridingStyle: {
      recreational: "Recreatief",
      fitness: "Fitness",
      sportive: "Sportief",
      racing: "Wedstrijd",
      commuting: "Woon-werk",
      touring: "Toeren",
    },
    goal: {
      comfort: "Comfort",
      balanced: "Gebalanceerd",
      performance: "Prestatie",
      aero: "Aero",
    },
    experienceLevel: {
      beginner: "Beginner",
      intermediate: "Gevorderd",
      advanced: "Vergevorderd",
    },
    weeklyHours: {
      "0-3": "0-3 uur/week",
      "3-6": "3-6 uur/week",
      "6-10": "6-10 uur/week",
      "10-15": "10-15 uur/week",
      "15+": "15+ uur/week",
    },
    rideLength: {
      short: "Kort (<30 km)",
      medium: "Middel (30-80 km)",
      long: "Lang (80-150 km)",
      ultra: "Ultra (150+ km)",
    },
    positionPriority: {
      comfort: "Maximaal comfort",
      balanced: "Gebalanceerd",
      performance: "Prestatie",
    },
    typeOfRiding: {
      casual: "Casual / fitness",
      group: "Groepsritten",
      training: "Gestructureerde training",
      racing: "Wedstrijd",
      tt: "Tijdrit / triatlon",
      asphalt: "Alleen asfalt",
      paved: "Verhard + lichte gravel",
      xc: "Cross-country",
      trail: "Trail",
      enduro: "Enduro",
      dh: "Downhill / bike park",
    },
  },
} as const;

function localizeValue(
  locale: ReportV2Copy["locale"],
  group: keyof (typeof LOCALE_VALUE_LABELS)["en"],
  value: string | null | undefined
): string | null {
  if (!value) {
    return null;
  }

  const labelsByLocale = LOCALE_VALUE_LABELS as Record<
    ReportV2Copy["locale"],
    Record<string, Record<string, string>>
  >;
  const labels = labelsByLocale[locale][group];
  return labels[value] ?? value;
}

export function BikeContextCard({ bike, copy }: BikeContextCardProps) {
  const primaryStats = [
    {
      label: copy.bike.bikeType,
      value: localizeValue(copy.locale, "bikeType", bike.bikeType) ?? bike.bikeType,
      icon: Bike,
    },
    {
      label: copy.bike.ridingStyle,
      value:
        localizeValue(copy.locale, "ridingStyle", bike.ridingStyle) ??
        bike.ridingStyle ??
        "n/a",
      icon: Route,
    },
    {
      label: copy.bike.goal,
      value: localizeValue(copy.locale, "goal", bike.goal) ?? bike.goal ?? "n/a",
      icon: Target,
    },
    {
      label: copy.bike.typeOfRiding,
      value:
        localizeValue(copy.locale, "typeOfRiding", bike.questionnaire.typeOfRiding) ??
        bike.questionnaire.typeOfRiding ??
        "n/a",
      icon: Gauge,
    },
  ];

  const secondaryContext = [
    [copy.bike.brand, bike.brand],
    [copy.bike.model, bike.model],
    [
      copy.bike.experienceLevel,
      localizeValue(copy.locale, "experienceLevel", bike.questionnaire.experienceLevel),
    ],
    [
      copy.bike.weeklyHours,
      localizeValue(copy.locale, "weeklyHours", bike.questionnaire.weeklyHours),
    ],
    [
      copy.bike.rideLength,
      localizeValue(copy.locale, "rideLength", bike.questionnaire.rideLength),
    ],
    [
      copy.bike.positionPriority,
      localizeValue(copy.locale, "positionPriority", bike.questionnaire.positionPriority),
    ],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <ResultsSection
      eyebrow={copy.sections.yourBike}
      title={bike.name}
      description={bike.description ?? copy.bike.descriptionFallback}
      tone="highlight"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          {bike.brand ? <StatusPill tone="primary">{bike.brand}</StatusPill> : null}
          {bike.model ? <StatusPill>{bike.model}</StatusPill> : null}
          <StatusPill>{localizeValue(copy.locale, "bikeType", bike.bikeType) ?? bike.bikeType}</StatusPill>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:color-mix(in_oklch,var(--primary)_18%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--primary)_8%,white_92%)_0%,white_100%)]">
            {bike.imageUrl ? (
              <img
                src={bike.imageUrl}
                alt={bike.name}
                className="aspect-[4/3] h-full w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_16%,white_84%)_0%,color-mix(in_oklch,var(--secondary)_22%,white_78%)_100%)] text-[color:var(--primary)]">
                <Bike className="h-16 w-16" />
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {primaryStats.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/35 px-4 py-4"
              >
                <div className="flex items-center gap-2 text-[color:var(--primary)]">
                  <Icon className="h-4 w-4" />
                  <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                    {label}
                  </p>
                </div>
                <p className="mt-2 text-sm font-semibold text-[color:var(--foreground)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {secondaryContext.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {secondaryContext.map(([label, value]) => (
              <MetricTile key={label} label={label} value={value} />
            ))}
          </div>
        ) : null}
      </div>
    </ResultsSection>
  );
}
