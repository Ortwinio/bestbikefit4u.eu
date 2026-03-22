"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button, EmptyState, Input, LoadingState, Select } from "@/components/ui";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "@/components/admin/layout/AdminUi";
import { formatAdminDate, formatAdminRelativeDate, normalizeAdminOrganizationRow } from "@/components/admin/shared/live-admin-data";

type TypeFilter = "all" | "bike_shop" | "enterprise" | "fitter_studio" | "brand";
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

function typeTone(type: string) {
  switch (type) {
    case "enterprise":
      return "success";
    case "fitter_studio":
      return "info";
    case "brand":
      return "warning";
    default:
      return "neutral";
  }
}

function summaryValue(label: string, value: string | number) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">{value}</div>
    </div>
  );
}

export function OrganizationsAdminClient() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [suspension, setSuspension] = useState<SuspensionFilter>("all");
  const deferredSearch = useDeferredValue(search);

  const queryArgs = {
    type: type === "all" ? undefined : type,
    suspended: suspension === "suspended" ? true : undefined,
  } as const;

  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.queries.listOrganizations,
    queryArgs,
    { initialNumItems: 20 }
  );

  const organizations = results.map(normalizeAdminOrganizationRow);
  const filteredOrganizations = organizations.filter((organization) => {
    const searchTerm = deferredSearch.trim().toLowerCase();
    if (!searchTerm) return true;
    return (
      organization.name.toLowerCase().includes(searchTerm) ||
      organization.billingEmail.toLowerCase().includes(searchTerm) ||
      String(organization.ownerUserId).toLowerCase().includes(searchTerm)
    );
  });

  if (status === "LoadingFirstPage" && organizations.length === 0) {
    return <LoadingState label="Loading organizations..." />;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Command center"
        title="Organizations"
        description="Live organization records from Convex with filterable operational views."
        actions={
          <Button render={<Link href="/admin/users" />} variant="outline">
            Open users
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {summaryValue("Loaded orgs", organizations.length)}
        {summaryValue("Seats used", organizations.reduce((sum, organization) => sum + organization.usedSeats, 0))}
        {summaryValue("Suspended", organizations.filter((organization) => Boolean(organization.suspendedAt)).length)}
      </section>

      <AdminSectionCard title="Filters" description="Search the live Convex organization list.">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="Search by name, billing email, or owner id"
          />
          <Select
            aria-label="Organization type filter"
            value={type}
            onChange={(event) => setType(event.currentTarget.value as TypeFilter)}
            options={typeOptions.map((option) => ({ value: option.value, label: option.label }))}
          />
          <Select
            aria-label="Suspension filter"
            value={suspension}
            onChange={(event) => setSuspension(event.currentTarget.value as SuspensionFilter)}
            options={suspensionOptions.map((option) => ({ value: option.value, label: option.label }))}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[color:var(--muted-foreground)]">
          <span>
            Showing {filteredOrganizations.length} loaded organization{filteredOrganizations.length === 1 ? "" : "s"}
            {status === "LoadingMore" ? " while fetching more..." : ""}
          </span>
          <button
            type="button"
            className="font-medium text-[color:var(--foreground)] hover:underline"
            onClick={() => {
              setSearch("");
              setType("all");
              setSuspension("all");
            }}
          >
            Clear filters
          </button>
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Organizations"
        description="Rows stay live as you filter and load more results from Convex."
      >
        {filteredOrganizations.length === 0 ? (
          <EmptyState
            title="No organizations found"
            description="No live organization rows matched the current filters."
          />
        ) : (
          <AdminTable>
            <AdminTableHead
              columns={["Name", "Type", "Billing email", "Seats", "Suspension", "Created", "Action"]}
            />
            <tbody>
              {filteredOrganizations.map((organization) => (
                <AdminTableRow key={organization.id}>
                  <AdminTableCell className="font-medium">{organization.name}</AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusPill tone={typeTone(organization.type)}>
                      {organization.type.replaceAll("_", " ")}
                    </AdminStatusPill>
                  </AdminTableCell>
                  <AdminTableCell>{organization.billingEmail}</AdminTableCell>
                  <AdminTableCell>
                    {organization.usedSeats} / {organization.maxSeats || "—"}
                  </AdminTableCell>
                  <AdminTableCell>
                    {organization.suspendedAt ? (
                      <AdminStatusPill tone="warning">
                        Suspended · {formatAdminDate(organization.suspendedAt)}
                      </AdminStatusPill>
                    ) : (
                      "Active"
                    )}
                  </AdminTableCell>
                  <AdminTableCell>{formatAdminRelativeDate(organization.createdAt)}</AdminTableCell>
                  <AdminTableCell>
                    <Button
                      render={<Link href={`/admin/organizations/${organization.id}`} />}
                      size="sm"
                      variant="outline"
                    >
                      View
                    </Button>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </tbody>
          </AdminTable>
        )}

        {status !== "Exhausted" ? (
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              variant="secondary"
              isLoading={status === "LoadingMore"}
              onClick={() => loadMore(20)}
            >
              Load more
            </Button>
          </div>
        ) : null}
      </AdminSectionCard>
    </div>
  );
}
