import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import type { DashboardMessages } from "@/i18n/dashboardMessages";
import type { Locale } from "@/i18n/config";
import { getBikeTypeLabel } from "@/lib/bikes";

type LinkedGeometryDetail = {
  recordId: string;
  brandName: string | null;
  modelName: string | null;
  modelYearLabel: string | number | null;
  sizeLabel: string;
  stack: number | null;
  reach: number | null;
  seatTubeAngle: number | null;
  headTubeAngle: number | null;
  source: "manufacturer" | "admin_import" | "admin_manual" | "user_entered";
  sourceUrl: string | null;
  status: "draft" | "active" | "superseded" | "rejected";
  version: number;
  supersededByRecordId: string | null;
};

type GeometryCardBike = {
  bikeType: string;
  ridingStyle: string | null | undefined;
  primaryGoal: string | null | undefined;
  brand: string | null | undefined;
  model: string | null | undefined;
  bikeWeightKg: number | string | null | undefined;
  currentGeometry?:
    | {
        stackMm?: number | null;
        reachMm?: number | null;
        frameSize?: string | null;
      }
    | null
    | undefined;
};

export type GeometryLinkState = "linked" | "unlinked" | "missing_record";

export function getGeometryCardCopy(locale: Locale) {
  if (locale === "nl") {
    return {
      linkedTitle: "Gekoppeld geometrie-record",
      linkedDescription:
        "Deze fiets is gekoppeld aan een referentie-record uit de geometriebibliotheek.",
      unlinkedTitle: "Geen gekoppeld geometrie-record",
      unlinkedDescription:
        "Deze fiets is opgeslagen zonder match in de geometriebibliotheek. Je kunt de fiets later nog bewerken en geometrie koppelen.",
      missingRecordDescription:
        "Deze fiets verwijst nog naar een geometrie-record dat nu niet meer beschikbaar is in de bibliotheek.",
      supersededBanner: "Nieuwere geometriedata beschikbaar",
      updateToLatest: "Bijwerken naar nieuwste",
      linkGeometry: "Geometrie koppelen",
      relinkGeometry: "Geometrie opnieuw koppelen",
      changeGeometry: "Wijzigen",
      manualLabel: "Handmatig",
      noGeometryLinked: "Geen geometrie-record gekoppeld",
      geometryUnavailable: "Het geometrie-record is niet meer beschikbaar",
      linkPrompt:
        "Koppeling met de geometriebibliotheek zorgt voor nauwkeurigere berekeningen.",
      fields: {
        year: "Jaar",
        frameSize: "Framemaat",
        stack: "Stack",
        reach: "Reach",
        seatTubeAngle: "Zitbuishoek",
        headTubeAngle: "Balhoofdhoek",
      },
      unavailable: "—",
    };
  }

  return {
    linkedTitle: "Linked geometry record",
    linkedDescription:
      "This bike is linked to a reference geometry record from the library.",
    unlinkedTitle: "No linked geometry record",
    unlinkedDescription:
      "This bike is saved without a geometry-library match. You can still edit the bike and link geometry later.",
    missingRecordDescription:
      "This bike still references a geometry record that is no longer available in the library.",
    supersededBanner: "Newer geometry data is available",
    updateToLatest: "Update to latest",
    linkGeometry: "Link geometry",
    relinkGeometry: "Re-link geometry",
    changeGeometry: "Change",
    manualLabel: "Manual",
    noGeometryLinked: "No geometry record linked",
    geometryUnavailable: "The geometry record is no longer available",
    linkPrompt: "Linking to the geometry library enables more accurate fit calculations.",
    fields: {
      year: "Year",
      frameSize: "Frame size",
      stack: "Stack",
      reach: "Reach",
      seatTubeAngle: "Seat tube angle",
      headTubeAngle: "Head tube angle",
    },
    unavailable: "—",
  };
}

function formatNumber(value: number | null | undefined, unit: string, unavailable: string) {
  return value === null || value === undefined ? unavailable : `${value}${unit}`;
}

function formatWeight(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return `${value} kg`;
}

function formatValue(value: number | string | null, unavailable: string) {
  return value === null ? unavailable : String(value);
}

function joinParts(parts: Array<string | number | null | undefined>) {
  return parts.filter((part) => part !== null && part !== undefined && part !== "").join(" · ");
}

export function buildGeometryCardItems(
  locale: Locale,
  linkedGeometry: LinkedGeometryDetail
) {
  const copy = getGeometryCardCopy(locale);

  return [
    { label: "Brand", value: formatValue(linkedGeometry.brandName, copy.unavailable) },
    { label: "Model", value: formatValue(linkedGeometry.modelName, copy.unavailable) },
    { label: copy.fields.year, value: formatValue(linkedGeometry.modelYearLabel, copy.unavailable) },
    { label: copy.fields.frameSize, value: linkedGeometry.sizeLabel },
    { label: "Source", value: linkedGeometry.source === "manufacturer" ? "Manufacturer" : linkedGeometry.source },
    { label: copy.fields.stack, value: formatValue(linkedGeometry.stack, copy.unavailable) },
    { label: copy.fields.reach, value: formatValue(linkedGeometry.reach, copy.unavailable) },
  ];
}

function getRidingStyleLabel(bike: GeometryCardBike, messages: DashboardMessages) {
  if (!bike.ridingStyle) {
    return "-";
  }

  const key = bike.ridingStyle as keyof typeof messages.fit.ridingStyles;
  return key in messages.fit.ridingStyles ? messages.fit.ridingStyles[key].label : "-";
}

function getPrimaryGoalLabel(bike: GeometryCardBike, messages: DashboardMessages) {
  if (!bike.primaryGoal) {
    return "-";
  }

  const key = bike.primaryGoal as keyof typeof messages.fit.goals;
  return key in messages.fit.goals ? messages.fit.goals[key].label : "-";
}

function GeometryIdentityHeading({
  state,
  linkedGeometry,
  copy,
}: {
  state: GeometryLinkState;
  linkedGeometry: LinkedGeometryDetail | null;
  copy: ReturnType<typeof getGeometryCardCopy>;
}) {
  if (state === "linked" && linkedGeometry) {
    const heading = joinParts([
      joinParts([linkedGeometry.brandName, linkedGeometry.modelName]),
      linkedGeometry.modelYearLabel,
      linkedGeometry.sizeLabel,
    ]);

    return <>{heading || copy.linkedTitle}</>;
  }

  return <>{state === "missing_record" ? copy.geometryUnavailable : copy.noGeometryLinked}</>;
}

function GeometryActionButton({
  state,
  editHref,
  copy,
}: {
  state: GeometryLinkState;
  editHref: string;
  copy: ReturnType<typeof getGeometryCardCopy>;
}) {
  const label =
    state === "linked"
      ? copy.changeGeometry
      : state === "missing_record"
        ? copy.relinkGeometry
        : copy.linkGeometry;

  return (
    <Button variant="ghost" size="sm" render={<Link href={editHref} />}>
      {label}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}

function GeometryNumbersGrid({
  linkedGeometry,
  copy,
}: {
  linkedGeometry: LinkedGeometryDetail;
  copy: ReturnType<typeof getGeometryCardCopy>;
}) {
  const items = [
    {
      label: copy.fields.stack,
      value: formatNumber(linkedGeometry.stack, " mm", copy.unavailable),
    },
    {
      label: copy.fields.reach,
      value: formatNumber(linkedGeometry.reach, " mm", copy.unavailable),
    },
    {
      label: copy.fields.seatTubeAngle,
      value: formatNumber(linkedGeometry.seatTubeAngle, "°", copy.unavailable),
    },
    {
      label: copy.fields.headTubeAngle,
      value: formatNumber(linkedGeometry.headTubeAngle, "°", copy.unavailable),
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)]/25 px-4 py-3"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
            {item.label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function SupersededBanner({
  editHref,
  copy,
}: {
  editHref: string;
  copy: ReturnType<typeof getGeometryCardCopy>;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-amber-300/70 bg-amber-100/60 px-4 py-3 text-sm text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-100">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span className="font-medium">{copy.supersededBanner}</span>
      </div>
      <Link href={editHref} className="font-medium underline underline-offset-4">
        {copy.updateToLatest}
      </Link>
    </div>
  );
}

function UnlinkedContent({
  state,
  bike,
  copy,
}: {
  state: GeometryLinkState;
  bike: GeometryCardBike;
  copy: ReturnType<typeof getGeometryCardCopy>;
}) {
  const manualGeometry = bike.currentGeometry ?? null;
  const hasManualValues = Boolean(
    manualGeometry?.stackMm !== null && manualGeometry?.stackMm !== undefined
  ) ||
    Boolean(manualGeometry?.reachMm !== null && manualGeometry?.reachMm !== undefined) ||
    Boolean(manualGeometry?.frameSize);

  const description =
    state === "missing_record" ? copy.missingRecordDescription : copy.unlinkedDescription;

  return (
    <div className="space-y-4">
      {hasManualValues ? (
        <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)]/25 px-4 py-3 text-sm text-[color:var(--foreground)]">
          <span className="font-semibold">{copy.manualLabel}</span>
          <span className="mx-2 text-[color:var(--muted-foreground)]">·</span>
          <span>
            {copy.fields.stack}: {formatNumber(manualGeometry?.stackMm, " mm", copy.unavailable)}
          </span>
          <span className="mx-2 text-[color:var(--muted-foreground)]">·</span>
          <span>
            {copy.fields.reach}: {formatNumber(manualGeometry?.reachMm, " mm", copy.unavailable)}
          </span>
          <span className="mx-2 text-[color:var(--muted-foreground)]">·</span>
          <span>
            {copy.fields.frameSize}: {manualGeometry?.frameSize || copy.unavailable}
          </span>
        </div>
      ) : null}
      <CardDescription className="text-sm leading-6">{description}</CardDescription>
      <p className="text-sm text-[color:var(--muted-foreground)]">{copy.linkPrompt}</p>
    </div>
  );
}

function BikeFooterRow({
  bike,
  messages,
}: {
  bike: GeometryCardBike;
  messages: DashboardMessages;
}) {
  const items = [
    getBikeTypeLabel(bike.bikeType as Parameters<typeof getBikeTypeLabel>[0], messages),
    getRidingStyleLabel(bike, messages),
    getPrimaryGoalLabel(bike, messages),
    formatWeight(bike.bikeWeightKg),
  ];

  return (
    <div className="border-t border-[color:var(--border)] pt-4 text-sm text-[color:var(--muted-foreground)]">
      {items.join(" · ")}
    </div>
  );
}

export function GeometryLinkCard({
  locale,
  state,
  linkedGeometry,
  bike,
  editHref,
  messages,
}: {
  locale: Locale;
  state: GeometryLinkState;
  linkedGeometry: LinkedGeometryDetail | null;
  bike: GeometryCardBike;
  editHref: string;
  messages: DashboardMessages;
}) {
  const copy = getGeometryCardCopy(locale);

  return (
    <Card variant="bordered" className="dashboard-card-surface">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <CardTitle>
            <GeometryIdentityHeading state={state} linkedGeometry={linkedGeometry} copy={copy} />
          </CardTitle>
        </div>
        <GeometryActionButton state={state} editHref={editHref} copy={copy} />
      </CardHeader>
      <CardContent className="space-y-4">
        {state === "linked" && linkedGeometry ? (
          <>
            <GeometryNumbersGrid linkedGeometry={linkedGeometry} copy={copy} />
            {linkedGeometry.status === "superseded" ? (
              <SupersededBanner editHref={editHref} copy={copy} />
            ) : null}
          </>
        ) : (
          <UnlinkedContent state={state} bike={bike} copy={copy} />
        )}
        <BikeFooterRow bike={bike} messages={messages} />
      </CardContent>
    </Card>
  );
}
