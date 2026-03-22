"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/SegmentedControl";
import { StatusPill } from "@/components/admin/shared/StatusPill";
import { adminRiderRecords } from "@/components/admin/contracts";

export default function AdminRiderDataPage() {
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("all");
  const [review, setReview] = useState("all");

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return adminRiderRecords.filter((record) => {
      const matchesSearch =
        !normalized ||
        record.name.toLowerCase().includes(normalized) ||
        record.email.toLowerCase().includes(normalized);
      const matchesPlan = plan === "all" || record.plan === plan;
      const matchesReview =
        review === "all" ||
        (review === "queue" && record.reviewStatus === "queue") ||
        (review === "reviewed" && record.reviewStatus === "reviewed") ||
        (review === "flagged" && record.reviewStatus === "flagged");

      return matchesSearch && matchesPlan && matchesReview;
    });
  }, [plan, review, search]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Total riders
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{adminRiderRecords.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {adminRiderRecords.filter((record) => record.reviewStatus === "queue").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Flagged
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {adminRiderRecords.filter((record) => record.reviewStatus === "flagged").length}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>Rider data review queue</CardTitle>
          <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_auto]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email"
              aria-label="Search riders"
            />
            <SegmentedControl
              value={plan}
              onValueChange={(value) => setPlan(String(value))}
              size="sm"
              aria-label="Plan filter"
            >
              <SegmentedControlItem value="all" size="sm">
                All
              </SegmentedControlItem>
              <SegmentedControlItem value="free" size="sm">
                Free
              </SegmentedControlItem>
              <SegmentedControlItem value="pro" size="sm">
                Pro
              </SegmentedControlItem>
              <SegmentedControlItem value="premium" size="sm">
                Premium
              </SegmentedControlItem>
            </SegmentedControl>
            <Select
              value={review}
              onChange={(event) => setReview(event.target.value)}
              options={[
                { value: "all", label: "All review states" },
                { value: "queue", label: "Queue" },
                { value: "reviewed", label: "Reviewed" },
                { value: "flagged", label: "Flagged" },
              ]}
            />
            <Button variant="outline" render={<Link href="/admin/rider-data" />}>Clear</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Rider</th>
                  <th className="px-4 py-3 font-medium">Measurements</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Review</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <tr key={record.userId} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-4">
                      <div className="font-medium">{record.name}</div>
                      <div className="text-xs text-[color:var(--muted-foreground)]">{record.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2 text-xs text-[color:var(--muted-foreground)]">
                        <span>{record.heightCm} cm</span>
                        <span>{record.inseamCm} cm inseam</span>
                        <span>{record.weightKg} kg</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill tone={record.plan === "premium" ? "success" : record.plan === "pro" ? "info" : "neutral"}>
                        {record.plan}
                      </StatusPill>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <StatusPill tone={record.reviewStatus === "queue" ? "warning" : record.reviewStatus === "flagged" ? "danger" : "neutral"}>
                          {record.reviewStatus}
                        </StatusPill>
                        {record.flags.map((flag) => (
                          <StatusPill key={flag} tone="info">
                            {flag.replaceAll("_", " ")}
                          </StatusPill>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Button variant="outline" size="sm" render={<Link href={`/admin/rider-data/${record.userId}`} />}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
