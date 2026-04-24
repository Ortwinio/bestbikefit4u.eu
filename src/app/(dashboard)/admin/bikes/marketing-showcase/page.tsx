"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LoadingState,
} from "@/components/ui";
import { StatusPill } from "@/components/admin/shared/StatusPill";

function formatDate(value: number | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminBikeMarketingShowcasePage() {
  const bikes = useQuery(api.admin.queries.listAdminMarketingShowcaseBikes);
  const setEligible = useMutation(api.admin.bikeMarketing.setMarketingEligible);

  if (bikes === undefined) {
    return <LoadingState label="Loading bikes..." />;
  }

  const eligible = bikes.filter((b) => b.marketingEligible);
  const candidates = bikes.filter((b) => !b.marketingEligible && b.photoStorageId);

  async function toggle(bikeId: Id<"bikes">, eligible: boolean) {
    await setEligible({ bikeId, eligible });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Marketing Showcase</h1>
        <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
          Manage bikes shown in the homepage bike showcase carousel. Only bikes with brand, model, and
          geometry data are listed here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Currently in showcase ({eligible.length} / 5)</CardTitle>
        </CardHeader>
        <CardContent>
          {eligible.length === 0 ? (
            <p className="text-sm text-[color:var(--muted-foreground)]">No bikes in showcase yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--border)] text-left text-xs text-[color:var(--muted-foreground)]">
                  <th className="pb-2 pr-4">Bike</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Geometry</th>
                  <th className="pb-2 pr-4">Photo</th>
                  <th className="pb-2 pr-4">Approved</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {eligible.map((bike) => (
                  <tr key={String(bike._id)} className="border-t border-[color:var(--border)]">
                    <td className="py-3 pr-4">
                      <div className="font-medium">
                        {bike.brand} {bike.model}
                      </div>
                      <div className="text-xs text-[color:var(--muted-foreground)]">{bike.name}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusPill tone="neutral">{bike.bikeType}</StatusPill>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusPill tone={bike.hasGeometry ? "success" : "warning"}>
                        {bike.hasGeometry
                          ? `Linked · ${bike.geometryStatus ?? "?"}`
                          : "Manual / none"}
                      </StatusPill>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusPill tone={bike.photoStorageId ? "success" : "warning"}>
                        {bike.photoStorageId ? "Photo set" : "No photo"}
                      </StatusPill>
                    </td>
                    <td className="py-3 pr-4 text-xs text-[color:var(--muted-foreground)]">
                      {formatDate(bike.marketingEligibleAt)}
                    </td>
                    <td className="py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggle(bike._id as Id<"bikes">, false)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eligible candidates ({candidates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <p className="text-sm text-[color:var(--muted-foreground)]">No eligible candidates found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--border)] text-left text-xs text-[color:var(--muted-foreground)]">
                  <th className="pb-2 pr-4">Bike</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Geometry</th>
                  <th className="pb-2 pr-4">Photo</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {candidates.map((bike) => (
                  <tr key={String(bike._id)} className="border-t border-[color:var(--border)]">
                    <td className="py-3 pr-4">
                      <div className="font-medium">
                        {bike.brand} {bike.model}
                      </div>
                      <div className="text-xs text-[color:var(--muted-foreground)]">{bike.name}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusPill tone="neutral">{bike.bikeType}</StatusPill>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusPill tone={bike.hasGeometry ? "success" : "warning"}>
                        {bike.hasGeometry
                          ? `Linked · ${bike.geometryStatus ?? "?"}`
                          : "Manual / none"}
                      </StatusPill>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusPill tone={bike.photoStorageId ? "success" : "warning"}>
                        {bike.photoStorageId ? "Photo set" : "No photo"}
                      </StatusPill>
                    </td>
                    <td className="py-3">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => toggle(bike._id as Id<"bikes">, true)}
                        disabled={eligible.length >= 5}
                      >
                        Add to showcase
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
