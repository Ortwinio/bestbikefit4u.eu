"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/SegmentedControl";
import { StatusPill } from "@/components/admin/shared/StatusPill";
import { adminBikeRecords } from "@/components/admin/contracts";

export default function AdminBikesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [linked, setLinked] = useState("all");

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return adminBikeRecords.filter((bike) => {
      const matchesSearch =
        !normalized ||
        bike.brand.toLowerCase().includes(normalized) ||
        bike.model.toLowerCase().includes(normalized) ||
        bike.ownerName.toLowerCase().includes(normalized);
      const matchesCategory = category === "all" || bike.category === category;
      const matchesLinked =
        linked === "all" ||
        (linked === "linked" && Boolean(bike.geometryRecordId)) ||
        (linked === "unlinked" && !bike.geometryRecordId);
      return matchesSearch && matchesCategory && matchesLinked;
    });
  }, [category, linked, search]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm text-[color:var(--muted-foreground)]">Total bikes</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold">{adminBikeRecords.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-[color:var(--muted-foreground)]">Geometry linked</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold">{adminBikeRecords.filter((bike) => bike.geometryRecordId).length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-[color:var(--muted-foreground)]">Owners</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold">{new Set(adminBikeRecords.map((bike) => bike.ownerUserId)).size}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>Bike catalogue</CardTitle>
          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search bikes or owners" />
            <SegmentedControl
              value={category}
              onValueChange={(value) => setCategory(String(value))}
              size="sm"
              aria-label="Bike category filter"
            >
              <SegmentedControlItem value="all" size="sm">All</SegmentedControlItem>
              <SegmentedControlItem value="road" size="sm">Road</SegmentedControlItem>
              <SegmentedControlItem value="gravel" size="sm">Gravel</SegmentedControlItem>
              <SegmentedControlItem value="city" size="sm">City</SegmentedControlItem>
            </SegmentedControl>
            <Select
              value={linked}
              onChange={(event) => setLinked(event.target.value)}
              options={[
                { value: "all", label: "All linkage states" },
                { value: "linked", label: "Geometry linked" },
                { value: "unlinked", label: "No geometry link" },
              ]}
            />
            <Button variant="outline">Load more</Button>
          </div>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[color:var(--border)] text-[color:var(--muted-foreground)]">
              <tr>
                <th className="py-3 font-medium">Bike</th>
                <th className="py-3 font-medium">Owner</th>
                <th className="py-3 font-medium">Geometry</th>
                <th className="py-3 font-medium">Created</th>
                <th className="py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bike) => (
                <tr key={bike.bikeId} className="border-b border-[color:var(--border)]">
                  <td className="py-4">
                    <div className="font-medium">{bike.brand} {bike.model}</div>
                    <div className="text-xs text-[color:var(--muted-foreground)]">Size {bike.size}</div>
                  </td>
                  <td className="py-4">
                    <div>{bike.ownerName}</div>
                    <div className="text-xs text-[color:var(--muted-foreground)]">{bike.ownerEmail}</div>
                  </td>
                  <td className="py-4">
                    {bike.geometryRecordId ? (
                      <StatusPill tone="success">{bike.geometryLabel ?? "linked"}</StatusPill>
                    ) : (
                      <StatusPill tone="warning">unlinked</StatusPill>
                    )}
                  </td>
                  <td className="py-4 text-[color:var(--muted-foreground)]">{bike.createdAt}</td>
                  <td className="py-4">
                    <Button variant="outline" size="sm" render={<Link href={`/admin/bikes/${bike.bikeId}`} />}>View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
