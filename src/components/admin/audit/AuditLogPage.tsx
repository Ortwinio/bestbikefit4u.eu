"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
} from "@/components/admin/layout/AdminUi";

type AuditAction =
  | "user.tier_change"
  | "user.suspend"
  | "user.restore"
  | "billing.trial_start"
  | "billing.trial_end"
  | "geometry.approve"
  | "release.status_change"
  | "fit_run.reviewed"
  | "message.create"
  | "message.publish"
  | "feature_flag.set"
  | "gdpr.export"
  | "gdpr.anonymize";

type AuditTargetType =
  | "user"
  | "organization"
  | "release"
  | "geometry_record"
  | "fit_run"
  | "message"
  | "engine_version";

type AuditRow = {
  id: string;
  time: string;
  admin: string;
  role: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetName: string;
  targetHref: string;
  payload: Record<string, unknown>;
  reason?: string;
  details: string;
};

const ACTION_LABELS: Record<AuditAction, string> = {
  "user.tier_change": "Changed user plan",
  "user.suspend": "Suspended user",
  "user.restore": "Restored user",
  "billing.trial_start": "Started trial",
  "billing.trial_end": "Ended trial",
  "geometry.approve": "Approved geometry record",
  "release.status_change": "Changed release status",
  "fit_run.reviewed": "Reviewed fit run",
  "message.create": "Created dashboard message",
  "message.publish": "Published dashboard message",
  "feature_flag.set": "Changed feature flag",
  "gdpr.export": "Exported user data",
  "gdpr.anonymize": "Anonymized user account",
};

const auditRows: AuditRow[] = [
  {
    id: "audit_001",
    time: "2026-03-22 09:31",
    admin: "Morgan Reed",
    role: "super_admin",
    action: "feature_flag.set",
    targetType: "engine_version",
    targetName: "manual_review_queue_enabled",
    targetHref: "/admin/settings",
    payload: { key: "manual_review_queue_enabled", value: true },
    reason: "Keep review flow enabled during rollout",
    details: "Updated system feature flag value from off to on.",
  },
  {
    id: "audit_002",
    time: "2026-03-21 16:14",
    admin: "Tess Novak",
    role: "support_admin",
    action: "message.publish",
    targetType: "message",
    targetName: "Spring upgrade prompt",
    targetHref: "/admin/messages/msg_001",
    payload: { messageId: "msg_001", audience: "pro users" },
    details: "Published a dashboard message to the pro tier audience.",
  },
  {
    id: "audit_003",
    time: "2026-03-20 11:07",
    admin: "Morgan Reed",
    role: "super_admin",
    action: "user.tier_change",
    targetType: "user",
    targetName: "Ellie Vermeer",
    targetHref: "/admin/rider-data/user_ellie",
    payload: { fromTier: "free", toTier: "premium" },
    reason: "Promo onboarding upgrade",
    details: "User tier was manually updated after the support review.",
  },
  {
    id: "audit_004",
    time: "2026-03-19 13:02",
    admin: "Alex Morgan",
    role: "billing_admin",
    action: "billing.trial_start",
    targetType: "user",
    targetName: "Omar de Wit",
    targetHref: "/admin/rider-data/user_omar",
    payload: { plan: "pro", durationDays: 14 },
    reason: "Seasonal trial extension",
    details: "Extended the trial window for a pro-tier account.",
  },
];

function formatRelativeTime(timeString: string) {
  const date = new Date(timeString.replace(" ", "T"));
  const diffDays = Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

function roleTone(role: string) {
  switch (role) {
    case "super_admin":
      return "danger";
    case "billing_admin":
      return "warning";
    case "support_admin":
      return "info";
    default:
      return "neutral";
  }
}

export function AuditLogPage() {
  const [adminFilter, setAdminFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [expandedIds, setExpandedIds] = useState<string[]>(["audit_001"]);

  const filteredRows = useMemo(
    () =>
      auditRows.filter((row) => {
        const matchesAdmin = adminFilter === "all" || row.admin === adminFilter;
        const matchesAction =
          actionFilter === "all" ||
          row.action.startsWith(actionFilter);
        const matchesTarget = targetFilter === "all" || row.targetType === targetFilter;
        const rowDate = row.time.slice(0, 10);
        const matchesFrom = !fromDate || rowDate >= fromDate;
        const matchesTo = !toDate || rowDate <= toDate;
        return matchesAdmin && matchesAction && matchesTarget && matchesFrom && matchesTo;
      }),
    [actionFilter, adminFilter, fromDate, targetFilter, toDate]
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin / Audit"
        title="Audit log"
        description="Immutable chronology of admin actions, with filters and expandable payload context."
        actions={<Button variant="outline">Export CSV</Button>}
      />

      <AdminSectionCard
        title="Filters"
        description="Refine the audit view by admin, action prefix, target type, or date range."
      >
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,0.7fr))]">
          <Select
            value={adminFilter}
            onChange={(event) => setAdminFilter(event.currentTarget.value)}
            options={[
              { value: "all", label: "All admins" },
              { value: "Morgan Reed", label: "Morgan Reed" },
              { value: "Tess Novak", label: "Tess Novak" },
              { value: "Alex Morgan", label: "Alex Morgan" },
            ]}
          />
          <Select
            value={actionFilter}
            onChange={(event) => setActionFilter(event.currentTarget.value)}
            options={[
              { value: "all", label: "All actions" },
              { value: "user.", label: "User actions" },
              { value: "billing.", label: "Billing actions" },
              { value: "message.", label: "Message actions" },
              { value: "gdpr.", label: "GDPR actions" },
              { value: "feature_flag.", label: "Feature flags" },
            ]}
          />
          <Select
            value={targetFilter}
            onChange={(event) => setTargetFilter(event.currentTarget.value as typeof targetFilter)}
            options={[
              { value: "all", label: "All targets" },
              { value: "user", label: "User" },
              { value: "organization", label: "Organization" },
              { value: "release", label: "Release" },
              { value: "geometry_record", label: "Geometry record" },
              { value: "fit_run", label: "Fit run" },
              { value: "message", label: "Message" },
              { value: "engine_version", label: "Engine version" },
            ]}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.currentTarget.value)} />
            <Input type="date" value={toDate} onChange={(event) => setToDate(event.currentTarget.value)} />
          </div>
        </div>
      </AdminSectionCard>

      <AdminSectionCard title="Entries" description="Newest filtered events first. Click a row to expand the payload.">
        <AdminTable>
          <AdminTableHead columns={["Time", "Admin", "Action", "Target", "Details", "Reason"]} />
          <tbody>
            {filteredRows.map((row) => {
              const expanded = expandedIds.includes(row.id);
              return (
                <Fragment key={row.id}>
                  <tr key={row.id} className="border-t border-[color:var(--border)]">
                    <AdminTableCell>
                      <button
                        type="button"
                        className="text-left"
                        title={row.time}
                        onClick={() =>
                          setExpandedIds((current) =>
                            current.includes(row.id)
                              ? current.filter((entryId) => entryId !== row.id)
                              : [...current, row.id]
                          )
                        }
                      >
                        <div className="font-medium">{formatRelativeTime(row.time)}</div>
                        <div className="text-xs text-[color:var(--muted-foreground)]">{row.time}</div>
                      </button>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{row.admin}</span>
                        <AdminStatusPill tone={roleTone(row.role)}>{row.role}</AdminStatusPill>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusPill tone="info">{ACTION_LABELS[row.action]}</AdminStatusPill>
                    </AdminTableCell>
                    <AdminTableCell>
                      <Button variant="ghost" size="sm" className="h-auto p-0 font-medium" render={<Link href={row.targetHref} />}>
                        {row.targetName}
                      </Button>
                      <div className="text-xs text-[color:var(--muted-foreground)]">{row.targetType}</div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <button
                        type="button"
                        className="text-sm font-medium text-[color:var(--foreground)] hover:underline"
                        onClick={() =>
                          setExpandedIds((current) =>
                            current.includes(row.id)
                              ? current.filter((entryId) => entryId !== row.id)
                              : [...current, row.id]
                          )
                        }
                      >
                        {expanded ? "Hide details" : "Show details"}
                      </button>
                    </AdminTableCell>
                    <AdminTableCell>{row.reason ?? "—"}</AdminTableCell>
                  </tr>
                  {expanded ? (
                    <tr key={`${row.id}-details`} className="border-t border-[color:var(--border)] bg-[color:var(--secondary)]">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="grid gap-4 xl:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Payload</p>
                            <pre className="mt-2 overflow-auto rounded-[var(--radius-md)] bg-[color:var(--card)] p-4 text-xs leading-6">
{JSON.stringify(row.payload, null, 2)}
                            </pre>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Reason</p>
                              <p className="mt-1 text-sm">{row.reason ?? "No reason provided."}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Context</p>
                              <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{row.details}</p>
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
        </AdminTable>
      </AdminSectionCard>
    </div>
  );
}

export default AuditLogPage;
