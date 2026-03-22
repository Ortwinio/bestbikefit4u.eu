"use client";

import Link from "next/link";
import { use, useState } from "react";
import { AccessibleDialog } from "@/components/ui/AccessibleDialog";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { StatusPill } from "@/components/admin/shared/StatusPill";
import { adminGeometryBrands, adminGeometryModels } from "@/components/admin/contracts";

interface PageProps {
  params: Promise<{ brandId: string }>;
}

export default function GeometryBrandPage({ params }: PageProps) {
  const { brandId } = use(params);
  const brand = adminGeometryBrands.find((item) => item.brandId === brandId) ?? adminGeometryBrands[0];
  const models = adminGeometryModels.filter((item) => item.brandId === brand.brandId);
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm text-[color:var(--muted-foreground)]">Brand detail</div>
          <h1 className="text-3xl font-semibold tracking-tight">{brand.name}</h1>
          <p className="mt-2 text-[color:var(--muted-foreground)]">{brand.website}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/admin/geometry/brands" />}>Back</Button>
          <Button onClick={() => setShowDialog(true)}>New model</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Models</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Years</th>
                <th className="px-4 py-3 font-medium">Sizes</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr key={model.modelId} className="border-t border-[color:var(--border)]">
                  <td className="px-4 py-4">{model.name}</td>
                  <td className="px-4 py-4"><StatusPill>{model.category}</StatusPill></td>
                  <td className="px-4 py-4">{model.yearStart} - {model.yearEnd}</td>
                  <td className="px-4 py-4">{model.activeSizeCount}</td>
                  <td className="px-4 py-4">
                    <Button variant="outline" size="sm" render={<Link href={`/admin/geometry/brands/${brand.brandId}/models/${model.modelId}`} />}>
                      View sizes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <AccessibleDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        title="Create model"
        description="Local UI stub until createGeometryModel is wired."
      >
        <div className="space-y-3">
          <Input label="Name" placeholder="Model name" />
          <Select
            label="Category"
            value="road"
            onChange={() => {}}
            options={[
              { value: "road", label: "Road" },
              { value: "gravel", label: "Gravel" },
              { value: "mtb", label: "MTB" },
              { value: "city", label: "City" },
              { value: "other", label: "Other" },
            ]}
          />
          <Input label="Year start" placeholder="2024" />
          <Input label="Year end" placeholder="2026" />
          <Textarea label="Notes" rows={3} placeholder="Internal note" />
          <Button onClick={() => setShowDialog(false)}>Save locally</Button>
        </div>
      </AccessibleDialog>
    </div>
  );
}

