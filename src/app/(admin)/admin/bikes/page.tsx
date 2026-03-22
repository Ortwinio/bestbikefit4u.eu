"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  LoadingState,
  Select,
} from "@/components/ui";
import { ErrorState } from "@/components/ui";
import { api } from "../../../../../convex/_generated/api";
import {
  usePaginatedQuery,
  useQuery,
  type PaginatedQueryItem,
} from "convex/react";
import { StatusPill as SharedStatusPill } from "@/components/admin/shared/StatusPill";

type BikeRow = PaginatedQueryItem<typeof api.admin.queries.listAllBikes>;

function formatDate(value?: number | string | null) {
  if (value === undefined || value === null || value === "") {
    return "Not set";
  }

  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function BikeSnapshotRow({ bike }: { bike: BikeRow }) {
  const detail = useQuery(api.admin.queries.getAdminBikeDetail, { bikeId: bike._id });

  if (detail === undefined) {
    return (
      <tr className="border-t border-[color:var(--border)]">
        <td className="px-4 py-4" colSpan={5}>
          <div className="text-sm text-[color:var(--muted-foreground)]">
            Loading live bike snapshot...
          </div>
        </td>
      </tr>
    );
  }

  const owner = detail?.owner;
  const fitRuns = detail?.fitRuns ?? [];
  const geometryRecord = detail?.geometryRecord ?? null;

  return (
    <tr className="border-t border-[color:var(--border)]">
      <td className="px-4 py-4 align-top">
        <div className="font-medium">{bike.name}</div>
        <div className="text-xs text-[color:var(--muted-foreground)]">
          {bike.brand ?? "No brand"} / {bike.model ?? "No model"}
        </div>
      </td>
      <td className="px-4 py-4 align-top">
        {owner ? (
          <div>
            <div className="font-medium">{owner.displayName ?? owner.name ?? owner.email}</div>
            <div className="text-xs text-[color:var(--muted-foreground)]">{owner.email}</div>
          </div>
        ) : (
          <SharedStatusPill tone="warning">Owner missing</SharedStatusPill>
        )}
      </td>
      <td className="px-4 py-4 align-top">
        {geometryRecord ? (
          <div className="flex flex-wrap gap-2">
            <SharedStatusPill tone={geometryRecord.status === "active" ? "success" : "warning"}>
              {geometryRecord.sizeLabel} v{geometryRecord.version}
            </SharedStatusPill>
            <SharedStatusPill tone="info">{geometryRecord.source}</SharedStatusPill>
          </div>
        ) : (
          <SharedStatusPill tone="warning">No geometry linked</SharedStatusPill>
        )}
      </td>
      <td className="px-4 py-4 align-top">
        <div className="flex flex-wrap gap-2">
          <SharedStatusPill tone={fitRuns.length > 0 ? "info" : "neutral"}>
            {fitRuns.length} fit runs
          </SharedStatusPill>
          <SharedStatusPill tone="neutral">{formatDate(bike.createdAt)}</SharedStatusPill>
        </div>
      </td>
      <td className="px-4 py-4 align-top">
        <Button variant="outline" size="sm" render={<Link href={`/admin/bikes/${bike._id}`} />}>
          View detail
        </Button>
      </td>
    </tr>
  );
}

export default function AdminBikesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [linked, setLinked] = useState("all");

  const queryArgs = useMemo(
    () => ({
      search: search.trim() || undefined,
      category: category === "all" ? undefined : category,
      hasGeometry:
        linked === "all" ? undefined : linked === "linked",
    }),
    [category, linked, search]
  );

  const { results, status, isLoading, loadMore } = usePaginatedQuery(
    api.admin.queries.listAllBikes,
    queryArgs,
    { initialNumItems: 12 }
  );

  const visibleResults = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return results;

    return results.filter((bike) => {
      return (
        bike.name.toLowerCase().includes(normalized) ||
        (bike.brand ?? "").toLowerCase().includes(normalized) ||
        (bike.model ?? "").toLowerCase().includes(normalized)
      );
    });
  }, [results, search]);

  if (status === "LoadingFirstPage") {
    return <LoadingState label="Loading bike catalogue..." />;
  }

  const linkedCount = results.filter((bike) => Boolean(bike.geometryRecordId)).length;
  const ownerCount = new Set(results.map((bike) => String(bike.userId))).size;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Loaded bikes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{results.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Geometry linked
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{linkedCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Owners
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{ownerCount}</CardContent>
        </Card>
      </div>

      <ErrorState
        title="Bike search is still partially backend-limited"
        description="Category and geometry-link filters are live against Convex, but the backend query still ignores the text search argument. Search is therefore applied to the loaded page locally until that query is updated."
      />

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>Live bike catalogue</CardTitle>
          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search bikes or owners"
              aria-label="Search bikes"
            />
            <Select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              options={[
                { value: "all", label: "All categories" },
                { value: "road", label: "Road" },
                { value: "gravel", label: "Gravel" },
                { value: "mountain", label: "Mountain" },
                { value: "hybrid", label: "Hybrid" },
                { value: "tt_triathlon", label: "TT / triathlon" },
                { value: "cyclocross", label: "Cyclocross" },
                { value: "touring", label: "Touring" },
                { value: "city", label: "City" },
              ]}
            />
            <Select
              value={linked}
              onChange={(event) => setLinked(event.target.value)}
              options={[
                { value: "all", label: "All linkage states" },
                { value: "linked", label: "Geometry linked" },
                { value: "unlinked", label: "No geometry link" },
              ]}
            />
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setLinked("all");
              }}
            >
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!visibleResults.length ? (
            <EmptyState
              title="No bikes matched the current filters"
              description="Broaden the category or linkage filter, or clear the search."
            />
          ) : (
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Bike</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                    <th className="px-4 py-3 font-medium">Geometry</th>
                    <th className="px-4 py-3 font-medium">Live snapshot</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleResults.map((bike) => (
                    <BikeSnapshotRow key={String(bike._id)} bike={bike} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm text-[color:var(--muted-foreground)]">
              {isLoading ? "Loading more bikes..." : status === "Exhausted" ? "All bikes loaded" : "More bikes available"}
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
