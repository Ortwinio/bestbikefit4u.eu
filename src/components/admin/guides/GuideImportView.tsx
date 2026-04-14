"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button, Input, Select, useToast } from "@/components/ui";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
} from "@/components/admin/layout/AdminUi";

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

function stripLocalePrefix(value: string) {
  return value.replace(/^\/(en|nl)(?=\/|$)/, "") || "/";
}

function stripGuidePrefix(value: string) {
  return value.replace(/^\/?guides\/?/, "").replace(/^guides\/?/, "").trim();
}

function getBareSlug(slug: string) {
  return stripGuidePrefix(slug.trim());
}

function buildImportPayload(enRecord: ImportJsonRecord, nlRecord: ImportJsonRecord, overwrite: boolean) {
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

export function GuideImportView() {
  const toast = useToast();
  const importGuideFromAdmin = useMutation(api.guides.mutations.importGuideFromAdmin);
  const [files, setFiles] = useState<ParsedImportFile[]>([]);
  const [overwriteMode, setOverwriteMode] = useState<"skip" | "overwrite">("skip");
  const [slugFilter, setSlugFilter] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importRows = useMemo(() => {
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
      .filter((row) => (slugFilter.trim() ? row.slug.includes(slugFilter.trim()) : true))
      .sort((left, right) => left.slug.localeCompare(right.slug));
  }, [files, slugFilter]);

  const readyRows = importRows.filter((row) => row.ready);

  const handleFileSelection = async (nextFiles: FileList | null) => {
    if (!nextFiles?.length) {
      setFiles([]);
      return;
    }

    try {
      const parsed = await Promise.all(
        Array.from(nextFiles).map(async (file) => ({
          fileName: file.name,
          record: JSON.parse(await file.text()) as ImportJsonRecord,
        }))
      );
      setFiles(parsed.filter((file) => file.record.locale === "en" || file.record.locale === "nl"));
      setError(null);
    } catch (parseError) {
      console.error("Failed to parse import files:", parseError);
      setError("One or more JSON files could not be parsed.");
    }
  };

  const handleImport = async () => {
    if (readyRows.length === 0) {
      setError("Load at least one matching EN/NL pair before importing.");
      return;
    }

    setIsImporting(true);
    setError(null);
    try {
      for (const row of readyRows) {
        if (!row.en?.record || !row.nl?.record) {
          continue;
        }

        await importGuideFromAdmin(
          buildImportPayload(
            row.en.record,
            row.nl.record,
            overwriteMode === "overwrite"
          ) as never
        );
      }

      toast.success({
        description: `Imported ${readyRows.length} guide pair${readyRows.length === 1 ? "" : "s"}.`,
      });
    } catch (importError) {
      console.error("Guide import failed:", importError);
      setError(importError instanceof Error ? importError.message : "Guide import failed.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Product / Guides"
        title="Import JSON guides"
        description="Upload the EN and NL guide JSON files from the CMS import pack and import them directly into Convex."
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

      <AdminSectionCard
        title="Import source"
        description="Select one or more JSON files. The importer pairs records by slug and requires both EN and NL."
      >
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(14rem,1fr)_minmax(14rem,1fr)]">
          <Input
            type="file"
            label="JSON files"
            accept=".json,application/json"
            multiple
            onChange={(event) => void handleFileSelection(event.currentTarget.files)}
          />
          <Select
            label="Existing slugs"
            value={overwriteMode}
            onChange={(event) => setOverwriteMode(event.currentTarget.value as "skip" | "overwrite")}
            options={[
              { value: "skip", label: "Skip existing guides" },
              { value: "overwrite", label: "Overwrite existing guides" },
            ]}
          />
          <Input
            label="Slug filter"
            value={slugFilter}
            onChange={(event) => setSlugFilter(event.currentTarget.value)}
            placeholder="Optional slug filter"
          />
        </div>
        <p className="mt-4 text-sm text-[color:var(--muted-foreground)]">
          JSON import is now available in the CMS. Image copying is still handled by the CLI import script because it writes to the public media folder.
        </p>
      </AdminSectionCard>

      <AdminSectionCard
        title="Import checklist"
        description="Review the import pairs before writing them to Convex."
      >
        <div className="flex flex-wrap gap-3 text-sm text-[color:var(--muted-foreground)]">
          <AdminStatusPill tone="neutral">Loaded files: {files.length}</AdminStatusPill>
          <AdminStatusPill tone="success">Ready pairs: {readyRows.length}</AdminStatusPill>
          <AdminStatusPill tone={importRows.some((row) => !row.ready) ? "warning" : "success"}>
            Missing locale pairs: {importRows.filter((row) => !row.ready).length}
          </AdminStatusPill>
        </div>
        {error ? (
          <div className="mt-4 rounded-2xl border border-[color:var(--danger)]/30 bg-[color:color-mix(in_oklch,var(--danger)_10%,var(--card)_90%)] p-4 text-sm text-[color:var(--foreground)]">
            {error}
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" onClick={() => void handleImport()} isLoading={isImporting}>
            Import ready guides
          </Button>
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Detected pairs"
        description="Each slug needs both language files before the record can be imported."
      >
        {importRows.length === 0 ? (
          <p className="text-sm text-[color:var(--muted-foreground)]">No JSON files loaded yet.</p>
        ) : (
          <div className="space-y-3">
            {importRows.map((row) => (
              <div
                key={row.slug}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
              >
                <div className="space-y-1">
                  <p className="font-medium">{row.slug}</p>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    Cluster: {row.cluster}
                  </p>
                  <p className="text-xs text-[color:var(--muted-foreground)]">
                    EN: {row.en?.fileName ?? "missing"} | NL: {row.nl?.fileName ?? "missing"}
                  </p>
                </div>
                <AdminStatusPill tone={row.ready ? "success" : "warning"}>
                  {row.ready ? "Ready" : "Missing pair"}
                </AdminStatusPill>
              </div>
            ))}
          </div>
        )}
      </AdminSectionCard>
    </div>
  );
}
