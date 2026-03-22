"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { useAction, usePaginatedQuery, useQuery } from "convex/react";
import type { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Select,
} from "@/components/ui";
import {
  AUDIT_READ_ROLES,
  formatAuditDateTime,
  formatAuditRelativeDate,
  getAdminName,
  getAuditActionLabel,
  getAuditTargetHref,
  getAuditTargetLabel,
  parseAuditPayload,
  summarizeAuditPayload,
  type AuditTargetType,
} from "./audit-utils";

const AUDIT_TARGET_OPTIONS: Array<{ value: AuditTargetType | "all"; label: string }> = [
  { value: "all", label: "All targets" },
  { value: "user", label: "Users" },
  { value: "organization", label: "Organizations" },
  { value: "release", label: "Releases" },
  { value: "geometry_record", label: "Geometry records" },
  { value: "fit_run", label: "Fit runs" },
  { value: "message", label: "Messages" },
  { value: "engine_version", label: "Engine versions" },
  { value: "feature_flag", label: "Feature flags" },
  { value: "plan", label: "Plans" },
];

function formatActionForTarget(row: {
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  payload?: string | null;
  occurredAt: number;
}) {
  return {
    actionLabel: getAuditActionLabel(row.action),
    targetLabel: getAuditTargetLabel(row.targetType),
    targetHref: getAuditTargetHref(row.targetType, row.targetId),
    payload: parseAuditPayload(row.payload),
    payloadSummary: summarizeAuditPayload(row.payload),
    relativeTime: formatAuditRelativeDate(row.occurredAt),
  };
}

export function AuditLogPage() {
  const currentAdmin = useQuery(api.admin.queries.getCurrentAdminUser, {});
  const adminRoster = usePaginatedQuery(
    api.admin.queries.listUsers,
    currentAdmin ? { adminRole: "admin_only" } : "skip",
    { initialNumItems: 20 }
  );
  const [adminFilter, setAdminFilter] = useState<"all" | "mine" | string>("all");
  const [targetFilter, setTargetFilter] = useState<AuditTargetType | "all">("all");
  const [targetId, setTargetId] = useState("");
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const exportAuditLogsCsv = useAction(api.admin.actions.exportAuditLogsCsv);
  const canReadAudit = Boolean(currentAdmin && AUDIT_READ_ROLES.has(currentAdmin.adminRole as never));

  const auditArgs =
    currentAdmin && canReadAudit
      ? {
          adminUserId:
            adminFilter === "all"
              ? undefined
              : adminFilter === "mine"
                ? currentAdmin._id
                : (adminFilter as Id<"users">),
          targetType: targetFilter === "all" ? undefined : targetFilter,
          targetId: targetId.trim() || undefined,
        }
      : "skip";

  const auditLogs = usePaginatedQuery(api.admin.queries.listAuditLogs, auditArgs, {
    initialNumItems: 20,
  });

  const adminOptions = useMemo(() => {
    const options = [
      { value: "all", label: "All admins" },
      { value: "mine", label: "My actions" },
    ];

    for (const admin of adminRoster.results) {
      options.push({
        value: String(admin._id),
        label: getAdminName(admin),
      });
    }

    return options;
  }, [adminRoster.results]);

  const adminNameMap = useMemo(() => {
    const entries: Array<[string, string]> = adminRoster.results.map((admin) => [
      String(admin._id),
      getAdminName(admin),
    ]);
    if (currentAdmin) {
      entries.unshift([String(currentAdmin._id), getAdminName(currentAdmin)]);
    }
    return new Map(entries);
  }, [adminRoster.results, currentAdmin]);

  const rows = auditLogs.status === "LoadingFirstPage" ? [] : auditLogs.results;

  if (currentAdmin === undefined) {
    return <LoadingState label="Loading audit log..." />;
  }

  if (!currentAdmin) {
    return (
      <EmptyState
        title="Admin access required"
        description="Audit logs are only available to authenticated admin accounts."
      />
    );
  }

  if (adminRoster.status === "LoadingFirstPage" || (canReadAudit && auditLogs.status === "LoadingFirstPage")) {
    return <LoadingState label="Loading audit log..." />;
  }

  if (!canReadAudit) {
    return (
      <ErrorState
        title="Audit log access is backend-gated"
        description="The current admin role cannot read audit logs yet. Audit visibility is limited to super_admin, ops_admin, support_admin, and qa_manager roles."
      />
    );
  }

  const currentAdminId = currentAdmin._id;

  async function handleExport() {
    const csv = await exportAuditLogsCsv({
      adminUserId:
        adminFilter === "all"
          ? undefined
          : adminFilter === "mine"
            ? currentAdminId
            : (adminFilter as Id<"users">),
      targetType: targetFilter === "all" ? undefined : targetFilter,
      targetId: targetId.trim() || undefined,
    });

    const blob = new Blob([csv.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "audit-log.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-[color:var(--muted-foreground)]">Admin / Audit</div>
          <h1 className="text-3xl font-semibold tracking-tight">Audit log</h1>
          <p className="mt-2 max-w-2xl text-[color:var(--muted-foreground)]">
            Live admin activity backed by Convex audit rows and an export action.
          </p>
        </div>
        <Button variant="outline" onClick={() => void handleExport()}>
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Loaded rows
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{rows.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Visible admins
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{adminRoster.results.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Current role
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-medium">{currentAdmin.adminRole}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[color:var(--muted-foreground)]">
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-medium">
            {targetFilter === "all" ? "All targets" : targetFilter.replaceAll("_", " ")}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>Filters</CardTitle>
          <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_0.8fr_auto]">
            <Select
              value={adminFilter}
              onChange={(event) => setAdminFilter(event.target.value)}
              options={adminOptions}
            />
            <Select
              value={targetFilter}
              onChange={(event) => setTargetFilter(event.target.value as AuditTargetType | "all")}
              options={AUDIT_TARGET_OPTIONS}
            />
            <Input
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
              placeholder="Filter exact target ID"
            />
            <Button
              variant="outline"
              onClick={() => {
                setAdminFilter("all");
                setTargetFilter("all");
                setTargetId("");
              }}
            >
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState
              title="No audit entries matched"
              description="Try broadening the admin or target filters."
            />
          ) : (
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Admin</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Target</th>
                    <th className="px-4 py-3 font-medium">Summary</th>
                    <th className="px-4 py-3 font-medium">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const expanded = expandedIds.includes(String(row._id));
                    const derived = formatActionForTarget(row);
                    const adminName = adminNameMap.get(String(row.adminUserId)) ?? String(row.adminUserId);

                    return (
                      <Fragment key={String(row._id)}>
                        <tr className="border-t border-[color:var(--border)]">
                          <td className="px-4 py-4 align-top">
                            <button
                              type="button"
                              className="text-left"
                              onClick={() =>
                                setExpandedIds((current) =>
                                  current.includes(String(row._id))
                                    ? current.filter((id) => id !== String(row._id))
                                    : [...current, String(row._id)]
                                )
                              }
                            >
                              <div className="font-medium">{derived.relativeTime}</div>
                              <div className="text-xs text-[color:var(--muted-foreground)]">
                                {formatAuditDateTime(row.occurredAt)}
                              </div>
                            </button>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="font-medium">{adminName}</div>
                            <div className="text-xs text-[color:var(--muted-foreground)]">
                              {String(row.adminUserId)}
                            </div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 font-medium"
                              onClick={() =>
                                setExpandedIds((current) =>
                                  current.includes(String(row._id))
                                    ? current.filter((id) => id !== String(row._id))
                                    : [...current, String(row._id)]
                                )
                              }
                            >
                              {derived.actionLabel}
                            </Button>
                          </td>
                          <td className="px-4 py-4 align-top">
                            {derived.targetHref ? (
                              <Button variant="outline" size="sm" render={<Link href={derived.targetHref} />}>
                                {String(row.targetId ?? derived.targetLabel)}
                              </Button>
                            ) : (
                              <div className="font-medium">{String(row.targetId ?? "—")}</div>
                            )}
                            <div className="text-xs text-[color:var(--muted-foreground)]">
                              {derived.targetLabel}
                            </div>
                          </td>
                          <td className="px-4 py-4 align-top text-[color:var(--muted-foreground)]">
                            {derived.payloadSummary}
                          </td>
                          <td className="px-4 py-4 align-top">{row.reason ?? "—"}</td>
                        </tr>
                        {expanded ? (
                          <tr className="border-t border-[color:var(--border)] bg-[color:var(--secondary)]">
                            <td colSpan={6} className="px-4 py-4">
                              <div className="grid gap-4 xl:grid-cols-2">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                                    Payload
                                  </p>
                                  <pre className="mt-2 overflow-auto rounded-[var(--radius-md)] bg-[color:var(--card)] p-4 text-xs leading-6">
                                    {JSON.stringify(derived.payload, null, 2)}
                                  </pre>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                                      Reason
                                    </p>
                                    <p className="mt-1 text-sm">{row.reason ?? "No reason provided."}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                                      Context
                                    </p>
                                    <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                                      Audit rows are immutable Convex records. Use the target link to inspect the affected resource.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm text-[color:var(--muted-foreground)]">
              {auditLogs.status === "Exhausted" ? "All entries loaded" : "More entries available"}
            </div>
            <Button
              variant="outline"
              isLoading={auditLogs.status === "LoadingMore"}
              disabled={auditLogs.status !== "CanLoadMore"}
              onClick={() => auditLogs.loadMore(20)}
            >
              Load more
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AuditLogPage;
