import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import type { Locale } from "@/i18n/config";

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
      fields: {
        brand: "Merk",
        model: "Model",
        year: "Jaar",
        frameSize: "Framemaat",
        version: "Versie",
        source: "Bron",
        status: "Status",
        stack: "Stack",
        reach: "Reach",
        seatTubeAngle: "Zitbuishoek",
        headTubeAngle: "Balhoofdhoek",
        sourceUrl: "Bron-URL",
      },
      sources: {
        manufacturer: "Fabrikant",
        admin_import: "Admin-import",
        admin_manual: "Admin handmatig",
        user_entered: "Gebruiker ingevoerd",
      },
      statuses: {
        draft: "Concept",
        active: "Actief",
        superseded: "Vervangen",
        rejected: "Afgewezen",
      },
      supersededNote:
        "Dit referentie-record is in de bibliotheek vervangen. De fiets blijft gekoppeld aan de opgeslagen recordversie.",
      unavailable: "Niet beschikbaar",
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
    fields: {
      brand: "Brand",
      model: "Model",
      year: "Year",
      frameSize: "Frame size",
      version: "Version",
      source: "Source",
      status: "Status",
      stack: "Stack",
      reach: "Reach",
      seatTubeAngle: "Seat tube angle",
      headTubeAngle: "Head tube angle",
      sourceUrl: "Source URL",
    },
    sources: {
      manufacturer: "Manufacturer",
      admin_import: "Admin import",
      admin_manual: "Admin manual",
      user_entered: "User entered",
    },
    statuses: {
      draft: "Draft",
      active: "Active",
      superseded: "Superseded",
      rejected: "Rejected",
    },
    supersededNote:
      "This reference record has been superseded in the library. The bike remains linked to the saved record version.",
    unavailable: "Unavailable",
  };
}

function formatValue(value: number | string | null, unavailable: string) {
  return value === null ? unavailable : String(value);
}

export function buildGeometryCardItems(
  locale: Locale,
  linkedGeometry: LinkedGeometryDetail
) {
  const copy = getGeometryCardCopy(locale);

  return [
    { label: copy.fields.brand, value: formatValue(linkedGeometry.brandName, copy.unavailable) },
    { label: copy.fields.model, value: formatValue(linkedGeometry.modelName, copy.unavailable) },
    { label: copy.fields.year, value: formatValue(linkedGeometry.modelYearLabel, copy.unavailable) },
    { label: copy.fields.frameSize, value: linkedGeometry.sizeLabel },
    { label: copy.fields.version, value: String(linkedGeometry.version) },
    { label: copy.fields.source, value: copy.sources[linkedGeometry.source] },
    { label: copy.fields.status, value: copy.statuses[linkedGeometry.status] },
    { label: copy.fields.stack, value: formatValue(linkedGeometry.stack, copy.unavailable) },
    { label: copy.fields.reach, value: formatValue(linkedGeometry.reach, copy.unavailable) },
    {
      label: copy.fields.seatTubeAngle,
      value: formatValue(linkedGeometry.seatTubeAngle, copy.unavailable),
    },
    {
      label: copy.fields.headTubeAngle,
      value: formatValue(linkedGeometry.headTubeAngle, copy.unavailable),
    },
    {
      label: copy.fields.sourceUrl,
      value: formatValue(linkedGeometry.sourceUrl, copy.unavailable),
    },
  ];
}

export function GeometryLinkCard({
  locale,
  state,
  linkedGeometry,
}: {
  locale: Locale;
  state: GeometryLinkState;
  linkedGeometry: LinkedGeometryDetail | null;
}) {
  const copy = getGeometryCardCopy(locale);

  if (state !== "linked" || !linkedGeometry) {
    return (
      <Card variant="bordered" className="dashboard-card-surface">
        <CardHeader>
          <CardTitle>{copy.unlinkedTitle}</CardTitle>
          <CardDescription>
            {state === "missing_record"
              ? copy.missingRecordDescription
              : copy.unlinkedDescription}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const items = buildGeometryCardItems(locale, linkedGeometry);

  return (
    <Card variant="bordered" className="dashboard-card-surface">
      <CardHeader>
        <CardTitle>{copy.linkedTitle}</CardTitle>
        <CardDescription>{copy.linkedDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)]/25 px-4 py-3"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
                {item.label}
              </p>
              <p className="mt-2 break-words text-sm font-medium text-[color:var(--foreground)]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
        {linkedGeometry.status === "superseded" ? (
          <p className="text-sm text-[color:var(--muted-foreground)]">{copy.supersededNote}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
