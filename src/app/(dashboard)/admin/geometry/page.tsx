"use client";

import Link from "next/link";
import { api } from "../../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState, LoadingState } from "@/components/ui";
import { ErrorState } from "@/components/ui";

const GEOMETRY_TEMPLATE_PATH = "/templates/geometry-import-template.csv";

export default function GeometryHubPage() {
  const brands = useQuery(api.admin.queries.listGeometryBrands, {});

  if (brands === undefined) {
    return <LoadingState label="Loading geometry hub..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-[color:var(--muted-foreground)]">Geometry library</div>
        <h1 className="text-3xl font-semibold tracking-tight">Geometry hub</h1>
        <p className="mt-2 max-w-2xl text-[color:var(--muted-foreground)]">
          Live admin entry point for brand, model, record, and import workflows.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Brands</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-semibold">{brands.length}</div>
            <Button render={<Link href="/admin/geometry/brands" />}>Open brand library</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Imports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-[color:var(--muted-foreground)]">
              CSV import preview runs live, but persistence is still backend-limited.
            </div>
            <div className="flex flex-wrap gap-2">
              <Button render={<Link href="/admin/geometry/import" />}>Preview CSV import</Button>
              <Button variant="outline" render={<Link href={GEOMETRY_TEMPLATE_PATH} download />}>
                Download CSV template
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-[color:var(--muted-foreground)]">
              Manage live records through brand and model detail pages.
            </div>
            <Button render={<Link href="/admin/geometry/brands" />}>Browse records</Button>
          </CardContent>
        </Card>
      </div>

      {brands.length === 0 ? (
        <EmptyState
          title="No geometry brands yet"
          description="Create the first brand to start populating models and records."
          action={<Button render={<Link href="/admin/geometry/brands" />}>Create a brand</Button>}
        />
      ) : null}

      <ErrorState
        title="Geometry import persistence is still backend-limited"
        description="The import action can preview and parse CSV, but there is no end-to-end persisted import pipeline yet."
      />
    </div>
  );
}
