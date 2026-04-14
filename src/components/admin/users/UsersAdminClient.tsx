"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button, EmptyState, Input, LoadingState, Select, SegmentedControl, SegmentedControlItem } from "@/components/ui";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "@/components/admin/layout/AdminUi";
import { formatAdminDate, formatAdminRelativeDate, normalizeAdminUserRow } from "@/components/admin/shared/live-admin-data";
import { formatAdminRoleLabel } from "../auth/admin-auth-shared";
import { getDefaultUserSortDirection, sortAdminUsers, type UserSortDirection, type UserSortKey } from "./user-table-sort";

type TierFilter = "all" | "free" | "pro" | "premium";
type RoleFilter = "all" | "admin-only" | "none";
type SuspensionFilter = "all" | "suspended";

const roleOptions = [
  { value: "all", label: "All" },
  { value: "admin-only", label: "Admin only" },
  { value: "none", label: "No admin role" },
] as const;

const suspensionOptions = [
  { value: "all", label: "All" },
  { value: "suspended", label: "Suspended only" },
] as const;

function tierTone(tier: string | null) {
  switch (tier) {
    case "premium":
      return "success";
    case "pro":
      return "info";
    case "free":
    default:
      return "neutral";
  }
}

function tierLabel(tier: string | null) {
  return tier ?? "free";
}

function summaryValue(label: string, value: string | number) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">{value}</div>
    </div>
  );
}

export function UsersAdminClient() {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<TierFilter>("all");
  const [role, setRole] = useState<RoleFilter>("all");
  const [suspended, setSuspended] = useState<SuspensionFilter>("all");
  const [sortKey, setSortKey] = useState<UserSortKey>("lastLoginAt");
  const [sortDirection, setSortDirection] = useState<UserSortDirection>("desc");
  const deferredSearch = useDeferredValue(search);

  const queryArgs = {
    search: deferredSearch.trim() || undefined,
    tier: tier === "all" ? undefined : tier,
    adminRole:
      role === "admin-only" ? "admin_only" : role === "none" ? "none" : undefined,
    suspended: suspended === "suspended" ? true : undefined,
  } as const;

  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.queries.listUsers,
    queryArgs,
    { initialNumItems: 20 }
  );

  const users = results.map(normalizeAdminUserRow);
  const sortedUsers = sortAdminUsers(users, sortKey, sortDirection);

  function handleSort(nextSortKey: UserSortKey) {
    if (sortKey === nextSortKey) {
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection(getDefaultUserSortDirection(nextSortKey));
  }

  if (status === "LoadingFirstPage" && users.length === 0) {
    return <LoadingState label="Loading users..." />;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Command center"
        title="Users"
        description="Live user records from Convex with filterable operational views."
        actions={
          <Button render={<Link href="/admin/organizations" />} variant="outline">
            Open organizations
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {summaryValue("Loaded users", users.length)}
        {summaryValue("Admin roles", users.filter((user) => Boolean(user.adminRole)).length)}
        {summaryValue("Suspended", users.filter((user) => Boolean(user.suspendedAt)).length)}
      </section>

      <AdminSectionCard title="Filters" description="Search the live Convex user list.">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="Search by name or email"
          />
          <SegmentedControl
            aria-label="Tier filter"
            className="w-full"
            value={tier}
            onValueChange={(value) => setTier(value as TierFilter)}
          >
            <SegmentedControlItem value="all">All</SegmentedControlItem>
            <SegmentedControlItem value="free">Free</SegmentedControlItem>
            <SegmentedControlItem value="pro">Pro</SegmentedControlItem>
            <SegmentedControlItem value="premium">Premium</SegmentedControlItem>
          </SegmentedControl>
          <Select
            aria-label="Admin role filter"
            value={role}
            onChange={(event) => setRole(event.currentTarget.value as RoleFilter)}
            options={roleOptions.map((option) => ({ value: option.value, label: option.label }))}
          />
          <Select
            aria-label="Suspension filter"
            value={suspended}
            onChange={(event) => setSuspended(event.currentTarget.value as SuspensionFilter)}
            options={suspensionOptions.map((option) => ({ value: option.value, label: option.label }))}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[color:var(--muted-foreground)]">
          <span>
            Showing {sortedUsers.length} loaded user{sortedUsers.length === 1 ? "" : "s"}
            {status === "LoadingMore" ? " while fetching more..." : ""}
          </span>
          <button
            type="button"
            className="font-medium text-[color:var(--foreground)] hover:underline"
            onClick={() => {
              setSearch("");
              setTier("all");
              setRole("all");
              setSuspended("all");
            }}
          >
            Clear filters
          </button>
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Users"
        description="Rows stay live as you filter and load more results from Convex."
      >
        {sortedUsers.length === 0 ? (
          <EmptyState
            title="No users found"
            description="No live user rows matched the current filters."
          />
        ) : (
          <AdminTable>
            <AdminTableHead
              columns={[
                { key: "name", label: "Name", sortable: true },
                { key: "email", label: "Email", sortable: true },
                { key: "tier", label: "Tier", sortable: true },
                { key: "adminRole", label: "Admin role", sortable: true },
                { key: "suspension", label: "Suspension", sortable: true },
                { key: "createdAt", label: "Joined", sortable: true },
                { key: "lastLoginAt", label: "Last login", sortable: true },
                { key: "action", label: "Action" },
              ]}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={(columnKey) => handleSort(columnKey as UserSortKey)}
            />
            <tbody>
              {sortedUsers.map((user) => (
                <AdminTableRow key={user.id}>
                  <AdminTableCell className="font-medium">
                    <div className="space-y-1">
                      <div>{user.name}</div>
                      <div className="text-xs text-[color:var(--muted-foreground)]">ID {user.id}</div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>{user.email}</AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusPill tone={tierTone(user.tier)}>
                      {tierLabel(user.tier)}
                    </AdminStatusPill>
                  </AdminTableCell>
                  <AdminTableCell>
                    {user.adminRole ? (
                      <AdminStatusPill tone="info">{formatAdminRoleLabel(user.adminRole)}</AdminStatusPill>
                    ) : (
                      "—"
                    )}
                  </AdminTableCell>
                  <AdminTableCell>
                    {user.suspendedAt ? (
                      <AdminStatusPill tone="warning">
                        Suspended · {formatAdminDate(user.suspendedAt)}
                      </AdminStatusPill>
                    ) : (
                      "Active"
                    )}
                  </AdminTableCell>
                  <AdminTableCell>{formatAdminRelativeDate(user.createdAt)}</AdminTableCell>
                  <AdminTableCell>{formatAdminRelativeDate(user.lastLoginAt)}</AdminTableCell>
                  <AdminTableCell>
                    <Button render={<Link href={`/admin/users/${user.id}`} />} size="sm" variant="outline">
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
