"use client";

import Link from "next/link";
import { use, useState } from "react";
import { api } from "../../../../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "../../../../../../../convex/_generated/dataModel";
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
  Select,
  Textarea,
} from "@/components/ui";
import { StatusPill as SharedStatusPill } from "@/components/admin/shared/StatusPill";

interface PageProps {
  params: Promise<{ brandId: string }>;
}

type ModelCategory = "road" | "gravel" | "mtb" | "tt" | "endurance" | "city" | "other";

export default function GeometryBrandPage({ params }: PageProps) {
  const { brandId } = use(params);
  const typedBrandId = brandId as Id<"geometry_brands">;
  const brands = useQuery(api.admin.queries.listGeometryBrands, {});
  const models = useQuery(
    api.admin.queries.listGeometryModels,
    typedBrandId ? { brandId: typedBrandId } : "skip"
  );
  const createModel = useMutation(api.admin.mutations.createGeometryModel);
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ModelCategory>("road");
  const [yearStart, setYearStart] = useState("");
  const [yearEnd, setYearEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const brand = brands?.find((item) => String(item._id) === brandId) ?? null;

  if (brands === undefined || (brand && models === undefined)) {
    return <LoadingState label="Loading geometry brand..." />;
  }

  if (!brand) {
    return (
      <EmptyState
        title="Brand not found"
        description="The requested geometry brand is no longer available."
        action={
          <Button variant="outline" render={<Link href="/admin/geometry/brands" />}>
            Back to brands
          </Button>
        }
      />
    );
  }

  async function handleCreateModel() {
    setIsSaving(true);
    try {
      await createModel({
        brandId: typedBrandId,
        name,
        category,
        yearStart: yearStart.trim() ? Number(yearStart) : undefined,
        yearEnd: yearEnd.trim() ? Number(yearEnd) : undefined,
        notes: notes.trim() || undefined,
      });
      setShowDialog(false);
      setName("");
      setCategory("road");
      setYearStart("");
      setYearEnd("");
      setNotes("");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm text-[color:var(--muted-foreground)]">Brand detail</div>
          <h1 className="text-3xl font-semibold tracking-tight">{brand.name}</h1>
          <p className="mt-2 text-[color:var(--muted-foreground)]">
            {brand.website ?? "No website"} · {brand.slug}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/admin/geometry/brands" />}>
            Back
          </Button>
          <Button onClick={() => setShowDialog(true)}>New model</Button>
        </div>
      </div>

      {models === undefined ? (
        <LoadingState label="Loading brand models..." />
      ) : models.length === 0 ? (
        <EmptyState
          title="No models yet"
          description="Add the first model to start attaching size records."
          action={<Button onClick={() => setShowDialog(true)}>Create model</Button>}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Live models</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Model</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Years</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {models.map((model) => (
                  <tr key={String(model._id)} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-4">
                      <div className="font-medium">{model.name}</div>
                    </td>
                    <td className="px-4 py-4">
                      <SharedStatusPill tone="info">{model.category}</SharedStatusPill>
                    </td>
                    <td className="px-4 py-4">
                      {model.yearStart ?? "?"} - {model.yearEnd ?? "?"}
                    </td>
                    <td className="px-4 py-4 text-[color:var(--muted-foreground)]">
                      {model.notes ?? "No notes"}
                    </td>
                    <td className="px-4 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        render={
                          <Link
                            href={`/admin/geometry/brands/${brandId}/models/${String(model._id)}`}
                          />
                        }
                      >
                        View sizes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <AccessibleDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        title="Create model"
        description="This writes a live geometry model in Convex."
      >
        <div className="space-y-3">
          <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Model name" />
          <Select
            label="Category"
            value={category}
            onChange={(event) => setCategory(event.target.value as ModelCategory)}
            options={[
              { value: "road", label: "Road" },
              { value: "gravel", label: "Gravel" },
              { value: "mtb", label: "MTB" },
              { value: "tt", label: "TT" },
              { value: "endurance", label: "Endurance" },
              { value: "city", label: "City" },
              { value: "other", label: "Other" },
            ]}
          />
          <Input label="Year start" value={yearStart} onChange={(event) => setYearStart(event.target.value)} placeholder="2024" />
          <Input label="Year end" value={yearEnd} onChange={(event) => setYearEnd(event.target.value)} placeholder="2026" />
          <Textarea label="Notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional internal notes" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button isLoading={isSaving} disabled={!name.trim()} onClick={() => void handleCreateModel()}>
              Create model
            </Button>
          </div>
        </div>
      </AccessibleDialog>
    </div>
  );
}
