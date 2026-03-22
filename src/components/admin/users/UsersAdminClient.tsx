"use client";

import { useDeferredValue, useState, type ReactNode } from "react";
import Link from "next/link";
import { AccessibleDialog, Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SegmentedControl, SegmentedControlItem, Textarea } from "@/components/ui";
import { cn } from "@/utils/cn";
import type { AdminUserRow, AdminUserPlan } from "./admin-users-data";

type UsersAdminClientProps = {
  users: AdminUserRow[];
};

type PlanFilter = "all" | AdminUserPlan;
type RoleFilter = "all" | "admin-only" | "none";
type SuspendedFilter = "all" | "suspended";

const roleOptions = [
  { value: "all", label: "All" },
  { value: "admin-only", label: "Admin only" },
  { value: "none", label: "No admin role" },
] as const;

const suspendedOptions = [
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

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

function pillClassName(kind: "free" | "pro" | "premium" | "admin" | "warning" | "success" | "muted") {
  switch (kind) {
    case "premium":
      return "border border-[color:color-mix(in_oklch,var(--primary)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_10%,var(--card))] text-[color:var(--foreground)]";
    case "pro":
      return "border border-[color:color-mix(in_oklch,var(--secondary)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--secondary)_10%,var(--card))] text-[color:var(--foreground)]";
    case "free":
      return "border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--muted-foreground)]";
    case "admin":
      return "border border-[color:color-mix(in_oklch,var(--warning)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--card))] text-[color:var(--foreground)]";
    case "warning":
      return "border border-[color:color-mix(in_oklch,var(--warning)_36%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_15%,var(--card))] text-[color:var(--foreground)]";
    case "success":
      return "border border-[color:color-mix(in_oklch,var(--success)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--success)_12%,var(--card))] text-[color:var(--foreground)]";
    case "muted":
    default:
      return "border border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]";
  }
}

function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint: string }) {
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

export function UsersAdminClient({ users }: UsersAdminClientProps) {
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState<PlanFilter>("all");
  const [role, setRole] = useState<RoleFilter>("all");
  const [suspended, setSuspended] = useState<SuspendedFilter>("all");
  const [visibleCount, setVisibleCount] = useState(4);
  const deferredSearch = useDeferredValue(search);

  const filteredUsers = users.filter((user) => {
    const searchTerm = deferredSearch.trim().toLowerCase();
    const matchesSearch =
      !searchTerm ||
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm);
    const matchesPlan = plan === "all" || user.plan === plan;
    const matchesRole =
      role === "all" ||
      (role === "admin-only" && Boolean(user.adminRole)) ||
      (role === "none" && !user.adminRole);
    const matchesSuspended =
      suspended === "all" || (suspended === "suspended" && Boolean(user.suspendedAt));

    return matchesSearch && matchesPlan && matchesRole && matchesSuspended;
  });

  const visibleUsers = filteredUsers.slice(0, visibleCount);
  const totalSuspended = users.filter((user) => user.suspendedAt).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
            Admin / Users & Accounts
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">
            Users
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
            Search, inspect, and manage rider accounts from a single operational surface.
          </p>
        </div>
        <Button render={<Link href="./organizations" />} variant="outline">
          View organizations
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total users" value={users.length} hint="All rider accounts in the working set" />
        <StatCard label="Suspended" value={totalSuspended} hint="Accounts currently blocked from access" />
        <StatCard label="Admin roles" value={users.filter((user) => user.adminRole).length} hint="Accounts with admin access" />
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>User filters</CardTitle>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Search by name or email"
            />
            <SegmentedControl
              aria-label="Plan filter"
              className="w-full"
              value={plan}
              onValueChange={(value) => setPlan(value as PlanFilter)}
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
              aria-label="Suspended filter"
              value={suspended}
              onChange={(event) => setSuspended(event.currentTarget.value as SuspendedFilter)}
              options={suspendedOptions.map((option) => ({ value: option.value, label: option.label }))}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3 text-sm text-[color:var(--muted-foreground)]">
            <span>
              Showing {visibleUsers.length} of {filteredUsers.length} matching users
            </span>
            <button
              type="button"
              className="font-medium text-[color:var(--foreground)] hover:underline"
              onClick={() => {
                setSearch("");
                setPlan("all");
                setRole("all");
                setSuspended("all");
                setVisibleCount(4);
              }}
            >
              Clear filters
            </button>
          </div>

          {visibleUsers.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--border)] p-8 text-center text-sm text-[color:var(--muted-foreground)]">
              No users match your filters.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[color:var(--border)]">
              <table className="min-w-full divide-y divide-[color:var(--border)] text-sm">
                <thead className="bg-[color:var(--secondary)] text-left text-xs uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Strava</th>
                    <th className="px-4 py-3">Bikes</th>
                    <th className="px-4 py-3">Fit runs</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3">Admin role</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--border)] bg-[color:var(--card)]">
                  {visibleUsers.map((user) => (
                    <tr key={user.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="font-medium text-[color:var(--foreground)]">{user.name}</div>
                        <div className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                          Last login {formatRelativeDate(user.lastLoginAt)}
                        </div>
                        {user.suspendedAt ? (
                          <div className={cn("mt-2 inline-flex rounded-full px-2.5 py-1 text-xs", pillClassName("warning"))}>
                            Suspended
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-[color:var(--foreground)]">{user.email}</td>
                      <td className="px-4 py-4">
                        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize", pillClassName(user.plan))}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[color:var(--foreground)]">{user.stravaConnected ? "✓" : "—"}</td>
                      <td className="px-4 py-4 text-[color:var(--foreground)]">{user.bikesCount}</td>
                      <td className="px-4 py-4 text-[color:var(--foreground)]">{user.fitRunsCount}</td>
                      <td className="px-4 py-4 text-[color:var(--muted-foreground)]">{formatRelativeDate(user.joinedAt)}</td>
                      <td className="px-4 py-4">
                        {user.adminRole ? (
                          <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize", pillClassName("admin"))}>
                            {user.adminRole.replaceAll("_", " ")}
                          </span>
                        ) : (
                          <span className="text-[color:var(--muted-foreground)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button render={<Link href={`./${user.id}`} />} size="sm" variant="outline">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {visibleUsers.length < filteredUsers.length ? (
            <div className="flex justify-center">
              <Button type="button" variant="secondary" onClick={() => setVisibleCount((count) => count + 4)}>
                Load more
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function UsersDetailShell({ children }: { children: ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}
