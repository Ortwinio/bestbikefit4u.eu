"use client";

import Link from "next/link";
import { api } from "../../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  LoadingState,
} from "@/components/ui";
import { StatusPill as SharedStatusPill } from "@/components/admin/shared/StatusPill";

const GEOMETRY_TEMPLATE_PATH = "/templates/geometry-import-template.csv";

export default function GeometryHubPage() {
  const brands = useQuery(api.admin.queries.listGeometryBrands, {});
  const summary = useQuery(api.admin.queries.getGeometryHubSummary, {});

  if (brands === undefined || summary === undefined) {
    return <LoadingState label="Loading geometry hub..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-[color:var(--muted-foreground)]">Geometry library</div>
        <h1 className="text-3xl font-semibold tracking-tight">Geometry hub</h1>
        <p className="mt-2 max-w-2xl text-[color:var(--muted-foreground)]">
          CSV imports create brands, models, and draft geometry records directly in Convex. Review
          imported records here and continue into the brand library to approve or edit them.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Brands</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-semibold">{summary.brandCount}</div>
            <Button render={<Link href="/admin/geometry/brands" />}>Open brand library</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Models</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-semibold">{summary.modelCount}</div>
            <div className="text-sm text-[color:var(--muted-foreground)]">
              Imported models become visible under their brand immediately.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-semibold">{summary.recordCount}</div>
            <div className="flex flex-wrap gap-2">
              <SharedStatusPill tone="warning">{summary.draftRecordCount} draft</SharedStatusPill>
              <SharedStatusPill tone="success">{summary.activeRecordCount} active</SharedStatusPill>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Imports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-[color:var(--muted-foreground)]">
              Upload a geometry CSV and create draft records for review.
            </div>
            <div className="flex flex-wrap gap-2">
              <Button render={<Link href="/admin/geometry/import" />}>Open CSV import</Button>
              <Button variant="outline" render={<Link href={GEOMETRY_TEMPLATE_PATH} download />}>
                Download CSV template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {summary.recentRecords.length === 0 ? (
        <EmptyState
          title="No geometry records yet"
          description="Import a CSV or create the first brand and model to start filling the geometry library."
          action={<Button render={<Link href="/admin/geometry/import" />}>Import geometry CSV</Button>}
        />
      ) : (
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Recent geometry records</CardTitle>
              <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                The newest imported or created records appear first.
              </p>
            </div>
            <Button variant="outline" render={<Link href="/admin/geometry/brands" />}>
              Browse full library
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Brand / model</th>
                  <th className="px-4 py-3 font-medium">Size</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Version</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentRecords.map((record) => (
                  <tr key={String(record._id)} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-4">
                      <div className="font-medium">{record.brandName}</div>
                      <div className="text-xs text-[color:var(--muted-foreground)]">{record.modelName}</div>
                    </td>
                    <td className="px-4 py-4">{record.sizeLabel}</td>
                    <td className="px-4 py-4">
                      <SharedStatusPill tone="info">{record.source}</SharedStatusPill>
                    </td>
                    <td className="px-4 py-4">
                      <SharedStatusPill tone={record.status === "active" ? "success" : "warning"}>
                        {record.status}
                      </SharedStatusPill>
                    </td>
                    <td className="px-4 py-4">v{record.version}</td>
                    <td className="px-4 py-4">
                      <Button variant="outline" size="sm" render={<Link href={`/admin/geometry/${String(record._id)}`} />}>
                        Open record
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {brands.length === 0 ? (
        <EmptyState
          title="No geometry brands yet"
          description="Create the first brand to start populating models and records."
          action={<Button render={<Link href="/admin/geometry/brands" />}>Create a brand</Button>}
        />
      ) : null}
    </div>
  );
}
