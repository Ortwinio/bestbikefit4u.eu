"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { AccessibleDialog, Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SegmentedControl, SegmentedControlItem, Textarea } from "@/components/ui";
import { cn } from "@/utils/cn";
import type { AdminOrganizationRow, AdminOrganizationType } from "./admin-organizations-data";

type OrganizationsAdminClientProps = {
  organizations: AdminOrganizationRow[];
};

type TypeFilter = "all" | AdminOrganizationType;
type SuspensionFilter = "all" | "suspended";

const typeOptions = [
  { value: "all", label: "All" },
  { value: "bike_shop", label: "Bike shop" },
  { value: "enterprise", label: "Enterprise" },
  { value: "fitter_studio", label: "Studio" },
  { value: "brand", label: "Brand" },
] as const;

const suspensionOptions = [
  { value: "all", label: "All" },
  { value: "suspended", label: "Suspended only" },
] as const;

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const diffDays = Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const months = Math.round(diffDays / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

function statusClassName(suspended: boolean) {
  return suspended
    ? "border border-[color:color-mix(in_oklch,var(--warning)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--card))] text-[color:var(--foreground)]"
    : "border border-[color:color-mix(in_oklch,var(--success)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--success)_10%,var(--card))] text-[color:var(--foreground)]";
}

function typeClassName(type: AdminOrganizationType) {
  switch (type) {
    case "enterprise":
      return "border border-[color:color-mix(in_oklch,var(--primary)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_10%,var(--card))]";
    case "fitter_studio":
      return "border border-[color:color-mix(in_oklch,var(--secondary)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--secondary)_10%,var(--card))]";
    case "brand":
      return "border border-[color:color-mix(in_oklch,var(--accent)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--accent)_10%,var(--card))]";
    case "bike_shop":
    default:
      return "border border-[color:var(--border)] bg-[color:var(--secondary)]";
  }
}

function StatCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
          {label}
        </div>
        <div className="mt-2 text-3xl font-semibold text-[color:var(--foreground)]">{value}</div>
        <div className="mt-1 text-sm text-[color:var(--muted-foreground)]">{hint}</div>
      </CardContent>
    </Card>
  );
}

export function OrganizationsAdminClient({ organizations }: OrganizationsAdminClientProps) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [suspension, setSuspension] = useState<SuspensionFilter>("all");
  const [visibleCount, setVisibleCount] = useState(3);
  const deferredSearch = useDeferredValue(search);

  const filteredOrganizations = organizations.filter((organization) => {
    const query = deferredSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      organization.name.toLowerCase().includes(query) ||
      organization.ownerEmail.toLowerCase().includes(query) ||
      organization.billingEmail.toLowerCase().includes(query);
    const matchesType = type === "all" || organization.type === type;
    const matchesSuspension = suspension === "all" || (suspension === "suspended" && organization.suspended);
    return matchesSearch && matchesType && matchesSuspension;
  });

  const visibleOrganizations = filteredOrganizations.slice(0, visibleCount);
  const totalSuspended = organizations.filter((organization) => organization.suspended).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
            Admin / Users & Accounts
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">
            Organizations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
            Review partner accounts, seat usage, suspension state, and billing contact details.
          </p>
        </div>
        <Button render={<Link href="./users" />} variant="outline">
          View users
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Organizations" value={organizations.length} hint="All B2B accounts in scope" />
        <StatCard label="Suspended" value={totalSuspended} hint="Accounts that need attention" />
        <StatCard label="Seats used" value={organizations.reduce((sum, organization) => sum + organization.seatsUsed, 0)} hint="Across all organizations" />
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Organization filters</CardTitle>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,1fr))]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Search by name, owner, or billing email"
            />
            <SegmentedControl
              aria-label="Organization type filter"
              className="w-full"
              value={type}
              onValueChange={(value) => setType(value as TypeFilter)}
            >
              <SegmentedControlItem value="all">All</SegmentedControlItem>
              <SegmentedControlItem value="bike_shop">Shop</SegmentedControlItem>
              <SegmentedControlItem value="enterprise">Enterprise</SegmentedControlItem>
            </SegmentedControl>
            <Select
              aria-label="Suspension filter"
              value={suspension}
              onChange={(event) => setSuspension(event.currentTarget.value as SuspensionFilter)}
              options={suspensionOptions.map((option) => ({ value: option.value, label: option.label }))}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3 text-sm text-[color:var(--muted-foreground)]">
            <span>
              Showing {visibleOrganizations.length} of {filteredOrganizations.length} matching organizations
            </span>
            <button
              type="button"
              className="font-medium text-[color:var(--foreground)] hover:underline"
              onClick={() => {
                setSearch("");
                setType("all");
                setSuspension("all");
                setVisibleCount(3);
              }}
            >
              Clear filters
            </button>
          </div>

          {visibleOrganizations.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--border)] p-8 text-center text-sm text-[color:var(--muted-foreground)]">
              No organizations match your filters.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[color:var(--border)]">
              <table className="min-w-full divide-y divide-[color:var(--border)] text-sm">
                <thead className="bg-[color:var(--secondary)] text-left text-xs uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Owner email</th>
                    <th className="px-4 py-3">Seats used</th>
                    <th className="px-4 py-3">Suspension</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--border)] bg-[color:var(--card)]">
                  {visibleOrganizations.map((organization) => (
                    <tr key={organization.id} className="align-top">
                      <td className="px-4 py-4 font-medium text-[color:var(--foreground)]">{organization.name}</td>
                      <td className="px-4 py-4">
                        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize", typeClassName(organization.type))}>
                          {organization.type.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[color:var(--foreground)]">{organization.ownerEmail}</td>
                      <td className="px-4 py-4 text-[color:var(--foreground)]">
                        {organization.seatsUsed} / {organization.maxSeats}
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", statusClassName(organization.suspended))}>
                          {organization.suspended ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[color:var(--muted-foreground)]">
                        {formatRelativeDate(organization.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button render={<Link href={`./${organization.id}`} />} size="sm" variant="outline">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {visibleOrganizations.length < filteredOrganizations.length ? (
            <div className="flex justify-center">
              <Button type="button" variant="secondary" onClick={() => setVisibleCount((count) => count + 3)}>
                Load more
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function OrganizationQuickActionShell() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setIsDialogOpen(true)}>
        Open quick action
      </Button>
      <AccessibleDialog
        open={isDialogOpen}
        title="Quick action"
        description="Placeholder action surface for the planned organization mutations."
        onClose={() => setIsDialogOpen(false)}
      >
        <div className="space-y-3">
          <Textarea placeholder="Reason or note" />
          <Button type="button" className="w-full" onClick={() => setIsDialogOpen(false)}>
            Confirm
          </Button>
        </div>
      </AccessibleDialog>
    </>
  );
}
