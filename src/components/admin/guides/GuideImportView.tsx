"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button, Input, Select, useToast } from "@/components/ui";
import {
  AdminMetricCard,
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "@/components/admin/layout/AdminUi";
import {
  formatGuideStatusLabel,
  guideStatusTone,
} from "@/components/admin/guides/guide-admin-shared";

type Locale = "en" | "nl";

type ImportJsonRecord = {
  backlogOrder?: number;
  slug: string;
  path: string;
  locale: Locale;
  cluster: string;
  status?: string;
  pageTitle: string;
  metaTitle: string;
  h1: string;
  pageBrief: string;
  primaryCtaLabel: string;
  primaryCtaTarget: string;
  internalLinkTargets: string[];
  notesOrRedirects?: string;
  libraryBody: string;
  metaDescription: string;
  relatedKeywords?: string[];
  backlogSeoHints?: unknown;
  heroImageFileName?: string;
  heroImagePublicPath?: string;
};

type ParsedImportFile = {
  fileName: string;
  record: ImportJsonRecord;
};

type ImportRow = {
  slug: string;
  cluster: string;
  en?: ParsedImportFile;
  nl?: ParsedImportFile;
  ready: boolean;
};

type RowImportResult = {
  state: "success" | "error";
  message: string;
};

type ExistingGuideRecord = {
  _id: string;
  slug: string;
  status: "draft" | "in_review" | "published" | "unpublished";
  updatedAt: number;
  deletedAt: number | null;
};

function stripLocalePrefix(value: string) {
  return value.replace(/^\/(en|nl)(?=\/|$)/, "") || "/";
}

function stripGuidePrefix(value: string) {
  return value.replace(/^\/?guides\/?/, "").replace(/^guides\/?/, "").trim();
}

function getBareSlug(slug: string) {
  return stripGuidePrefix(slug.trim());
}

function buildImportRows(files: ParsedImportFile[]) {
  const grouped = new Map<string, { en?: ParsedImportFile; nl?: ParsedImportFile }>();

  for (const file of files) {
    const slug = getBareSlug(file.record.slug);
    const existing = grouped.get(slug) ?? {};
    existing[file.record.locale] = file;
    grouped.set(slug, existing);
  }

  return Array.from(grouped.entries())
    .map(([slug, pair]) => ({
      slug,
      en: pair.en,
      nl: pair.nl,
      ready: Boolean(pair.en && pair.nl),
      cluster: pair.en?.record.cluster ?? pair.nl?.record.cluster ?? "unknown",
    }))
    .sort((left, right) => left.slug.localeCompare(right.slug));
}

function buildImportPayload(
  enRecord: ImportJsonRecord,
  nlRecord: ImportJsonRecord,
  overwrite: boolean
) {
  const slug = getBareSlug(enRecord.slug);
  const relatedGuidePaths = enRecord.internalLinkTargets
    .map((value) => stripLocalePrefix(value.trim()))
    .filter(Boolean);

  return {
    slug,
    path: stripLocalePrefix(enRecord.path),
    cluster: enRecord.cluster,
    backlogOrder: enRecord.backlogOrder,
    importStatus: enRecord.status,
    importNotes: enRecord.notesOrRedirects,
    pageTitle: { en: enRecord.pageTitle, nl: nlRecord.pageTitle },
    h1: { en: enRecord.h1, nl: nlRecord.h1 },
    metaTitle: { en: enRecord.metaTitle, nl: nlRecord.metaTitle },
    metaDescription: { en: enRecord.metaDescription, nl: nlRecord.metaDescription },
    pageBrief: { en: enRecord.pageBrief, nl: nlRecord.pageBrief },
    libraryBody: { en: enRecord.libraryBody, nl: nlRecord.libraryBody },
    heroImageFileName: enRecord.heroImageFileName,
    heroImagePublicPath: enRecord.heroImagePublicPath,
    relatedGuidePaths,
    relatedKeywords: enRecord.relatedKeywords?.map((value) => value.trim()).filter(Boolean),
    seoHints: enRecord.backlogSeoHints,
    primaryCtaTarget: stripLocalePrefix(enRecord.primaryCtaTarget),
    primaryCtaLabel: {
      en: enRecord.primaryCtaLabel,
      nl: nlRecord.primaryCtaLabel,
    },
    relatedGuides: relatedGuidePaths.map((value) => stripGuidePrefix(value)),
    robotsIndex: true,
    tableOfContents: false,
    publishedAt: Date.now(),
    lastUpdatedAt: Date.now(),
    overwrite,
  };
}

function getImportSelectionSummary(count: number) {
  return `${count} guide pair${count === 1 ? "" : "s"} selected`;
}

export function GuideImportView() {
  const toast = useToast();
  const importGuideFromAdmin = useMutation(api.guides.mutations.importGuideFromAdmin);
  const existingGuides =
    (useQuery(api.guides.queries.getGuideImportStatusOverview, {}) as ExistingGuideRecord[] | undefined) ?? [];
  const [files, setFiles] = useState<ParsedImportFile[]>([]);
  const [overwriteMode, setOverwriteMode] = useState<"skip" | "overwrite">("skip");
  const [rowFilter, setRowFilter] = useState<"all" | "ready" | "missing_locale" | "new" | "existing">("all");
  const [slugFilter, setSlugFilter] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowResults, setRowResults] = useState<Record<string, RowImportResult>>({});

  const existingGuideMap = useMemo(
    () => new Map(existingGuides.map((guide) => [guide.slug, guide])),
    [existingGuides]
  );

  const importRows = useMemo(() => {
    const normalizedSearch = slugFilter.trim().toLowerCase();
    return buildImportRows(files).filter((row) => {
      const existingGuide = existingGuideMap.get(row.slug);

      if (normalizedSearch && !row.slug.toLowerCase().includes(normalizedSearch)) {
        return false;
      }

      switch (rowFilter) {
        case "ready":
          return row.ready;
        case "missing_locale":
          return !row.ready;
        case "new":
          return !existingGuide;
        case "existing":
          return Boolean(existingGuide);
        case "all":
        default:
          return true;
      }
    });
  }, [existingGuideMap, files, rowFilter, slugFilter]);

  const readyRows = useMemo(
    () => importRows.filter((row) => row.ready),
    [importRows]
  );
  const allRows = useMemo(
    () => buildImportRows(files),
    [files]
  );
  const allReadyRows = useMemo(
    () => allRows.filter((row) => row.ready),
    [allRows]
  );
  const selectedReadyRows = useMemo(
    () => allReadyRows.filter((row) => selectedSlugs.includes(row.slug)),
    [allReadyRows, selectedSlugs]
  );
  const missingLocaleCount = allRows.filter((row) => !row.ready).length;
  const existingCount = allRows.filter((row) => existingGuideMap.has(row.slug)).length;
  const publishedCount = allRows.filter((row) => existingGuideMap.get(row.slug)?.status === "published").length;
  const draftCount = allRows.filter((row) => existingGuideMap.get(row.slug)?.status === "draft").length;

  const handleFileSelection = async (nextFiles: FileList | null) => {
    if (!nextFiles?.length) {
      setFiles([]);
      setSelectedSlugs([]);
      setRowResults({});
      setError(null);
      return;
    }

    try {
      const parsed = await Promise.all(
        Array.from(nextFiles).map(async (file) => ({
          fileName: file.name,
          record: JSON.parse(await file.text()) as ImportJsonRecord,
        }))
      );
      const validFiles = parsed.filter(
        (file) => file.record.locale === "en" || file.record.locale === "nl"
      );
      const nextRows = buildImportRows(validFiles);
      setFiles(validFiles);
      setSelectedSlugs(nextRows.filter((row) => row.ready).map((row) => row.slug));
      setRowResults({});
      setError(null);
    } catch (parseError) {
      console.error("Failed to parse import files:", parseError);
      setError("One or more JSON files could not be parsed.");
    }
  };

  const toggleSlugSelection = (slug: string) => {
    setSelectedSlugs((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug]
    );
  };

  const handleImport = async () => {
    if (selectedReadyRows.length === 0) {
      setError("Select at least one complete EN/NL pair before importing.");
      return;
    }

    setIsImporting(true);
    setError(null);
    const nextResults: Record<string, RowImportResult> = {};
    let importedCount = 0;
    let failedCount = 0;

    for (const row of selectedReadyRows) {
      if (!row.en?.record || !row.nl?.record) {
        continue;
      }

      try {
        const result = await importGuideFromAdmin(
          buildImportPayload(
            row.en.record,
            row.nl.record,
            overwriteMode === "overwrite"
          ) as never
        );
        const outcome =
          typeof result === "object" && result && "outcome" in result
            ? String((result as { outcome?: string }).outcome ?? "imported")
            : "imported";
        nextResults[row.slug] = {
          state: "success",
          message: `Import ${outcome}.`,
        };
        importedCount += 1;
      } catch (importError) {
        console.error("Guide import failed:", importError);
        nextResults[row.slug] = {
          state: "error",
          message: importError instanceof Error ? importError.message : "Guide import failed.",
        };
        failedCount += 1;
      }
    }

    setRowResults(nextResults);
    setSelectedSlugs((current) =>
      current.filter((slug) => nextResults[slug]?.state !== "success")
    );

    if (failedCount > 0) {
      setError(`${failedCount} guide pair${failedCount === 1 ? "" : "s"} failed to import.`);
    }

    if (importedCount > 0) {
      toast.success({
        description: `Imported ${importedCount} guide pair${importedCount === 1 ? "" : "s"}.`,
      });
    }

    setIsImporting(false);
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Product / Guides"
        title="Import JSON guides"
        description="Upload the EN and NL guide JSON files from the CMS import pack, inspect missing locale pairs, and batch-import the selected guides into Convex."
        actions={
          <>
            <Button variant="outline" render={<Link href="/admin/guides/new" />}>
              New guide
            </Button>
            <Button variant="outline" render={<Link href="/admin/guides" />}>
              Back to guides
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <AdminMetricCard label="Loaded files" value={files.length} description="JSON files currently loaded" />
        <AdminMetricCard label="Detected slugs" value={allRows.length} description="Unique guide slugs from upload" />
        <AdminMetricCard label="Ready pairs" value={allReadyRows.length} description="Rows with both EN and NL files" />
        <AdminMetricCard label="Missing locale" value={missingLocaleCount} description="Rows still missing EN or NL" />
        <AdminMetricCard label="Existing guides" value={existingCount} description="Rows already present in Convex" />
        <AdminMetricCard label="Selected" value={selectedReadyRows.length} description={getImportSelectionSummary(selectedReadyRows.length)} />
      </section>

      <AdminSectionCard
        title="Import source"
        description="Load guide JSON files in batches. The importer groups rows by slug and only imports selected rows with both EN and NL."
      >
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_minmax(12rem,1fr)]">
          <Input
            type="file"
            label="JSON files"
            accept=".json,application/json"
            multiple
            onChange={(event) => void handleFileSelection(event.currentTarget.files)}
          />
          <Select
            label="Existing guides"
            value={overwriteMode}
            onChange={(event) => setOverwriteMode(event.currentTarget.value as "skip" | "overwrite")}
            options={[
              { value: "skip", label: "Skip existing guides" },
              { value: "overwrite", label: "Overwrite existing guides" },
            ]}
          />
          <Select
            label="Row filter"
            value={rowFilter}
            onChange={(event) =>
              setRowFilter(
                event.currentTarget.value as "all" | "ready" | "missing_locale" | "new" | "existing"
              )
            }
            options={[
              { value: "all", label: "All loaded rows" },
              { value: "ready", label: "Ready pairs only" },
              { value: "missing_locale", label: "Missing locale only" },
              { value: "new", label: "Not imported yet" },
              { value: "existing", label: "Already in Convex" },
            ]}
          />
          <Input
            label="Slug filter"
            value={slugFilter}
            onChange={(event) => setSlugFilter(event.currentTarget.value)}
            placeholder="Filter by slug"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setSelectedSlugs(allReadyRows.map((row) => row.slug))}
          >
            Select all ready
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setSelectedSlugs(
                allReadyRows
                  .filter((row) => !existingGuideMap.has(row.slug))
                  .map((row) => row.slug)
              )
            }
          >
            Select only new
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setSelectedSlugs([])}
          >
            Clear selection
          </Button>
        </div>
        <p className="mt-4 text-sm text-[color:var(--muted-foreground)]">
          Existing guide status is shown from Convex so you can see whether a slug is already published, in review, unpublished, or still in draft before batch import.
        </p>
        {publishedCount > 0 || draftCount > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <AdminStatusPill tone="success">Published in Convex: {publishedCount}</AdminStatusPill>
            <AdminStatusPill tone="neutral">Draft in Convex: {draftCount}</AdminStatusPill>
          </div>
        ) : null}
      </AdminSectionCard>

      <AdminSectionCard
        title="Batch import"
        description="Import selected ready pairs. Incomplete rows stay visible so you can see which locale is missing."
      >
        {error ? (
          <div className="rounded-2xl border border-[color:var(--danger)]/30 bg-[color:color-mix(in_oklch,var(--danger)_10%,var(--card)_90%)] p-4 text-sm text-[color:var(--foreground)]">
            {error}
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" onClick={() => void handleImport()} isLoading={isImporting}>
            Import selected pairs
          </Button>
          <AdminStatusPill tone="info">{getImportSelectionSummary(selectedReadyRows.length)}</AdminStatusPill>
          <AdminStatusPill tone="warning">
            Missing locale pairs: {missingLocaleCount}
          </AdminStatusPill>
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Detected guide rows"
        description="Each row shows uploaded EN/NL presence and the current guide state in Convex."
      >
        {importRows.length === 0 ? (
          <p className="text-sm text-[color:var(--muted-foreground)]">No JSON files loaded yet.</p>
        ) : (
          <AdminTable>
            <AdminTableHead
              columns={["Select", "Slug", "Cluster", "Uploaded EN", "Uploaded NL", "File pair", "Current guide", "Batch result"]}
            />
            <tbody>
              {importRows.map((row) => {
                const existingGuide = existingGuideMap.get(row.slug);
                const isSelected = selectedSlugs.includes(row.slug);
                const rowResult = rowResults[row.slug];

                return (
                  <AdminTableRow key={row.slug}>
                    <AdminTableCell>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!row.ready || isImporting}
                        onChange={() => toggleSlugSelection(row.slug)}
                        aria-label={`Select ${row.slug} for import`}
                        className="h-4 w-4 rounded border border-[color:var(--border)]"
                      />
                    </AdminTableCell>
                    <AdminTableCell className="font-medium">
                      <div className="space-y-1">
                        <div>{row.slug}</div>
                        <div className="text-xs text-[color:var(--muted-foreground)]">
                          {row.en?.record.path ?? row.nl?.record.path ?? "No path"}
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>{row.cluster}</AdminTableCell>
                    <AdminTableCell>
                      <div className="space-y-1">
                        <AdminStatusPill tone={row.en ? "success" : "warning"}>
                          {row.en ? "EN loaded" : "EN missing"}
                        </AdminStatusPill>
                        <div className="text-xs text-[color:var(--muted-foreground)]">
                          {row.en?.fileName ?? "No EN file"}
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="space-y-1">
                        <AdminStatusPill tone={row.nl ? "success" : "warning"}>
                          {row.nl ? "NL loaded" : "NL missing"}
                        </AdminStatusPill>
                        <div className="text-xs text-[color:var(--muted-foreground)]">
                          {row.nl?.fileName ?? "No NL file"}
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusPill tone={row.ready ? "success" : "warning"}>
                        {row.ready ? "Ready to import" : "Missing locale pair"}
                      </AdminStatusPill>
                    </AdminTableCell>
                    <AdminTableCell>
                      {existingGuide ? (
                        <div className="space-y-1">
                          <AdminStatusPill tone={guideStatusTone(existingGuide.status)}>
                            {formatGuideStatusLabel(existingGuide.status)}
                          </AdminStatusPill>
                          <div className="text-xs text-[color:var(--muted-foreground)]">
                            {overwriteMode === "overwrite" ? "Will be overwritten" : "Will be skipped if unchanged"}
                          </div>
                        </div>
                      ) : (
                        <AdminStatusPill tone="neutral">Not imported</AdminStatusPill>
                      )}
                    </AdminTableCell>
                    <AdminTableCell>
                      {rowResult ? (
                        <div className="space-y-1">
                          <AdminStatusPill tone={rowResult.state === "success" ? "success" : "danger"}>
                            {rowResult.state === "success" ? "Imported" : "Failed"}
                          </AdminStatusPill>
                          <div className="max-w-xs text-xs text-[color:var(--muted-foreground)]">
                            {rowResult.message}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-[color:var(--muted-foreground)]">
                          No result yet
                        </span>
                      )}
                    </AdminTableCell>
                  </AdminTableRow>
                );
              })}
            </tbody>
          </AdminTable>
        )}
      </AdminSectionCard>
    </div>
  );
}
