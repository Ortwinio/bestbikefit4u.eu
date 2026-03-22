"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "../../../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import {
  AccessibleDialog,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  LoadingState,
  Textarea,
} from "@/components/ui";
import { StatusPill as SharedStatusPill } from "@/components/admin/shared/StatusPill";

function BrandRow({
  brand,
}: {
  brand: {
    _id: Id<"geometry_brands">;
    name: string;
    slug: string;
    website?: string | null;
  };
}) {
  const models = useQuery(api.admin.queries.listGeometryModels, { brandId: brand._id });

  if (models === undefined) {
    return (
      <tr className="border-t border-[color:var(--border)]">
        <td className="px-4 py-4" colSpan={4}>
          <div className="text-sm text-[color:var(--muted-foreground)]">
            Loading live brand metrics...
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-[color:var(--border)]">
      <td className="px-4 py-4">
        <div className="font-medium">{brand.name}</div>
        <div className="text-xs text-[color:var(--muted-foreground)]">{brand.slug}</div>
      </td>
      <td className="px-4 py-4">
        <SharedStatusPill tone={models.length > 0 ? "success" : "warning"}>
          {models.length} models
        </SharedStatusPill>
      </td>
      <td className="px-4 py-4 text-sm text-[color:var(--muted-foreground)]">
        {brand.website ?? "No website"}
      </td>
      <td className="px-4 py-4">
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/admin/geometry/brands/${String(brand._id)}`} />}
        >
          View models
        </Button>
      </td>
    </tr>
  );
}

export default function GeometryBrandsPage() {
  const brands = useQuery(api.admin.queries.listGeometryBrands, {});
  const createBrand = useMutation(api.admin.mutations.createGeometryBrand);
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [website, setWebsite] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (brands === undefined) {
    return <LoadingState label="Loading geometry brands..." />;
  }

  async function handleCreateBrand() {
    setIsSaving(true);
    try {
      await createBrand({
        name,
        slug,
        website: website.trim() || undefined,
      });
      setShowDialog(false);
      setName("");
      setSlug("");
      setWebsite("");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm text-[color:var(--muted-foreground)]">Geometry brands</div>
          <h1 className="text-3xl font-semibold tracking-tight">Brand catalog</h1>
        </div>
        <Button onClick={() => setShowDialog(true)}>New brand</Button>
      </div>

      {brands.length === 0 ? (
        <EmptyState
          title="No brands yet"
          description="Create the first geometry brand to start adding models and records."
          action={<Button onClick={() => setShowDialog(true)}>Create brand</Button>}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Live brands</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Brand</th>
                  <th className="px-4 py-3 font-medium">Models</th>
                  <th className="px-4 py-3 font-medium">Website</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <BrandRow
                    key={String(brand._id)}
                    brand={brand}
                  />
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <AccessibleDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        title="Create brand"
        description="This writes directly to the live geometry library."
      >
        <div className="space-y-3">
          <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Brand name" />
          <Input label="Slug" value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="brand-slug" />
          <Input label="Website" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://example.com" />
          <Textarea label="Notes" rows={3} placeholder="Optional internal notes" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button isLoading={isSaving} disabled={!name.trim() || !slug.trim()} onClick={() => void handleCreateBrand()}>
              Create brand
            </Button>
          </div>
        </div>
      </AccessibleDialog>
    </div>
  );
}
