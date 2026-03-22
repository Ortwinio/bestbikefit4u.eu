"use client";

import Link from "next/link";
import { useState } from "react";
import { AccessibleDialog } from "@/components/ui/AccessibleDialog";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { StatusPill } from "@/components/admin/shared/StatusPill";
import { adminGeometryBrands } from "@/components/admin/contracts";

export default function GeometryBrandsPage() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm text-[color:var(--muted-foreground)]">Geometry brands</div>
          <h1 className="text-3xl font-semibold tracking-tight">Brand catalog</h1>
        </div>
        <Button onClick={() => setShowDialog(true)}>New brand</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Models</th>
                <th className="px-4 py-3 font-medium">Coverage</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminGeometryBrands.map((brand) => (
                <tr key={brand.brandId} className="border-t border-[color:var(--border)]">
                  <td className="px-4 py-4">
                    <div className="font-medium">{brand.name}</div>
                    <div className="text-xs text-[color:var(--muted-foreground)]">{brand.slug}</div>
                  </td>
                  <td className="px-4 py-4">{brand.modelCount}</td>
                  <td className="px-4 py-4">
                    <StatusPill tone={brand.recordCoverage > 0.8 ? "success" : "warning"}>
                      {`${Math.round(brand.recordCoverage * 100)}%`}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-4">
                    <Button variant="outline" size="sm" render={<Link href={`/admin/geometry/brands/${brand.brandId}`} />}>
                      View models
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
        title="Create brand"
        description="Local UI stub until createGeometryBrand is wired."
      >
        <div className="space-y-3">
          <Input label="Name" placeholder="Brand name" />
          <Input label="Slug" placeholder="brand-slug" />
          <Input label="Website" placeholder="https://example.com" />
          <Textarea label="Notes" rows={3} placeholder="Internal note" />
          <Button onClick={() => setShowDialog(false)}>Save locally</Button>
        </div>
      </AccessibleDialog>
    </div>
  );
}
