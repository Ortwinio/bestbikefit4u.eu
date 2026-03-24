"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  EmptyState,
  Input,
  LoadingState,
  Select,
} from "@/components/ui";
import { api } from "../../../../../convex/_generated/api";
import {
  usePaginatedQuery,
  useQuery,
  type PaginatedQueryItem,
} from "convex/react";
import { StatusPill as SharedStatusPill } from "@/components/admin/shared/StatusPill";

type RiderRow = PaginatedQueryItem<typeof api.admin.queries.listUsers>;

function toneForTier(tier?: string | null) {
  if (tier === "premium") return "success";
  if (tier === "pro") return "info";
  return "neutral";
}

function RiderSnapshotRow({ user }: { user: RiderRow }) {
  const riderData = useQuery(api.admin.queries.getAdminRiderData, { userId: user._id });

  if (riderData === undefined) {
    return (
      <tr className="border-t border-[color:var(--border)]">
        <td className="px-4 py-4" colSpan={5}>
          <div className="text-sm text-[color:var(--muted-foreground)]">
            Loading live rider snapshot...
          </div>
        </td>
      </tr>
    );
  }

  const profile = riderData?.profile ?? null;
  const bikeCount = riderData?.bikes.length ?? 0;
  const fitCount = riderData?.fitSessions.length ?? 0;
  const flagCount = riderData?.measurementFlags.length ?? 0;

  return (
    <tr className="border-t border-[color:var(--border)]">
      <td className="px-4 py-4 align-top">
        <div className="font-medium">{user.displayName ?? user.name ?? user.email}</div>
        <div className="text-xs text-[color:var(--muted-foreground)]">{user.email}</div>
      </td>
      <td className="px-4 py-4 align-top">
        <div className="flex flex-wrap gap-2">
          <SharedStatusPill tone={toneForTier(user.tier)}>{user.tier ?? "free"}</SharedStatusPill>
          {user.adminRole ? <SharedStatusPill tone="warning">{user.adminRole}</SharedStatusPill> : null}
          {user.suspendedAt ? <SharedStatusPill tone="danger">suspended</SharedStatusPill> : null}
        </div>
      </td>
      <td className="px-4 py-4 align-top">
        {profile ? (
          <div className="grid gap-1 text-xs text-[color:var(--muted-foreground)]">
            <div>Height: {profile.heightCm ?? "n/a"} cm</div>
            <div>Inseam: {profile.inseamCm ?? "n/a"} cm</div>
            <div>Weight: {profile.weightKg ?? "n/a"} kg</div>
          </div>
        ) : (
          <SharedStatusPill tone="warning">Profile missing</SharedStatusPill>
        )}
      </td>
      <td className="px-4 py-4 align-top">
        <div className="flex flex-wrap gap-2">
          <SharedStatusPill tone={bikeCount > 0 ? "success" : "neutral"}>
            {bikeCount} bikes
          </SharedStatusPill>
          <SharedStatusPill tone={fitCount > 0 ? "info" : "neutral"}>
            {fitCount} fit runs
          </SharedStatusPill>
          <SharedStatusPill tone={flagCount > 0 ? "warning" : "success"}>
            {flagCount} flags
          </SharedStatusPill>
        </div>
      </td>
      <td className="px-4 py-4 align-top">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" render={<Link href={`/admin/rider-data/${user._id}`} />}>
            View detail
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminRiderDataPage() {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("all");
  const [adminRole, setAdminRole] = useState("all");
  const [suspended, setSuspended] = useState("all");

  const queryArgs = useMemo(
    () => ({
      search: search.trim() || undefined,
      tier: tier === "all" ? undefined : tier,
      adminRole: adminRole === "all" ? undefined : adminRole,
      suspended:
        suspended === "all" ? undefined : suspended === "suspended" ? true : false,
    }),
    [adminRole, search, suspended, tier]
  );

  const { results, status, isLoading, loadMore } = usePaginatedQuery(
    api.admin.queries.listUsers,
    queryArgs,
    { initialNumItems: 12 }
  );

  const summary = useMemo(() => {
    const loadedAdmins = results.filter((user) => Boolean(user.adminRole)).length;
    const loadedSuspended = results.filter((user) => Boolean(user.suspendedAt)).length;
    const loadedPremium = results.filter((user) => user.tier === "premium").length;
    return { loadedAdmins, loadedSuspended, loadedPremium };
  }, [results]);

  if (status === "LoadingFirstPage") {
    return <LoadingState label="Loading rider data..." />;
  }

  const hasRows = results.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Loaded riders
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{results.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Premium
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{summary.loadedPremium}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Suspended / admin
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {summary.loadedSuspended} / {summary.loadedAdmins}
          </CardContent>
        </Card>
      </div>

      <ErrorState
        title="Rider review workflow is backend-limited"
        description="Live rider profiles, bikes, fit sessions, and audit logs are available, but the backend still lacks a rider queue query plus note/flag mutations, so this page exposes the live admin surface instead of a fake review queue."
      />

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>Live rider data</CardTitle>
          <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_auto]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email"
              aria-label="Search riders"
            />
            <Select
              value={tier}
              onChange={(event) => setTier(event.target.value)}
              options={[
                { value: "all", label: "All tiers" },
                { value: "free", label: "Free" },
                { value: "pro", label: "Pro" },
                { value: "premium", label: "Premium" },
              ]}
            />
            <Select
              value={adminRole}
              onChange={(event) => setAdminRole(event.target.value)}
              options={[
                { value: "all", label: "All access" },
                { value: "admin_only", label: "Admins only" },
                { value: "none", label: "No admin role" },
              ]}
            />
            <Select
              value={suspended}
              onChange={(event) => setSuspended(event.target.value)}
              options={[
                { value: "all", label: "All accounts" },
                { value: "active", label: "Active" },
                { value: "suspended", label: "Suspended" },
              ]}
            />
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setTier("all");
                setAdminRole("all");
                setSuspended("all");
              }}
            >
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!hasRows ? (
            <EmptyState
              title="No riders matched the current filters"
              description="Try broadening the tier, access, or suspension filters."
            />
          ) : (
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Rider</th>
                    <th className="px-4 py-3 font-medium">Access</th>
                    <th className="px-4 py-3 font-medium">Measurements</th>
                    <th className="px-4 py-3 font-medium">Live snapshot</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((user) => (
                    <RiderSnapshotRow key={String(user._id)} user={user} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm text-[color:var(--muted-foreground)]">
              {isLoading ? "Loading more riders..." : status === "Exhausted" ? "All riders loaded" : "More riders available"}
            </div>
            <Button
              variant="outline"
              isLoading={status === "LoadingMore"}
              disabled={status !== "CanLoadMore"}
              onClick={() => loadMore(12)}
            >
              Load more
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
