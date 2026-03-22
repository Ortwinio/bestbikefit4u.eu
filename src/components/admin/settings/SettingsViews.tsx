"use client";

import { useState } from "react";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Select,
  SegmentedControl,
  SegmentedControlItem,
  Textarea,
  useToast,
} from "@/components/ui";
import {
  AdminMetricCard,
  AdminSectionCard,
  AdminStatusPill,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "@/components/admin/layout/AdminUi";
import {
  ADMIN_ROLE_OPTIONS,
  FEATURE_FLAG_ROLES,
  ROLE_MANAGEMENT_ROLES,
  formatAdminDateTime,
  getAdminRoleTone,
  isAllowedRole,
  type AdminRole,
} from "./settings-utils";

type SettingsTab = "roles" | "flags" | "gdpr" | "system";

export function SettingsManagementView() {
  const toast = useToast();
  const currentAdmin = useQuery(api.admin.queries.getCurrentAdminUser, {});
  const adminUsers = usePaginatedQuery(api.admin.queries.listUsers, { adminRole: "admin_only" }, { initialNumItems: 50 });
  const featureFlags = useQuery(api.admin.queries.getFeatureFlags);
  const gdprRequests = usePaginatedQuery(api.admin.queries.listGdprRequests, {}, { initialNumItems: 20 });
  const setFeatureFlag = useMutation(api.admin.mutations.setFeatureFlag);
  const requestGdprExport = useMutation(api.admin.mutations.requestGdprExport);
  const requestGdprErasure = useMutation(api.admin.mutations.requestGdprErasure);
  const [tab, setTab] = useState<SettingsTab>("roles");
  const [exportEmail, setExportEmail] = useState("");
  const [exportNotes, setExportNotes] = useState("");
  const [erasureEmail, setErasureEmail] = useState("");
  const [erasureNotes, setErasureNotes] = useState("");
  const [busyFlag, setBusyFlag] = useState<string | null>(null);
  const [busyGdpr, setBusyGdpr] = useState<"export" | "erasure" | null>(null);

  if (currentAdmin === undefined || featureFlags === undefined || adminUsers.status === "LoadingFirstPage" || gdprRequests.status === "LoadingFirstPage") {
    return <LoadingState label="Loading settings..." />;
  }

  if (!currentAdmin) {
    return (
      <ErrorState
        title="Admin access required"
        description="Settings are only available to authenticated admin accounts."
      />
    );
  }

  const canManageFlags = isAllowedRole(currentAdmin.adminRole, FEATURE_FLAG_ROLES);
  const canManageRoles = isAllowedRole(currentAdmin.adminRole, ROLE_MANAGEMENT_ROLES);

  async function handleToggleFlag(key: string, nextValue: boolean, description?: string) {
    setBusyFlag(key);
    try {
      await setFeatureFlag({ key, value: nextValue, description });
      toast.success({ description: "Feature flag updated." });
    } catch (error) {
      toast.error({ description: error instanceof Error ? error.message : "Feature flag update failed." });
    } finally {
      setBusyFlag(null);
    }
  }

  async function handleRequest(kind: "export" | "erasure") {
    const requesterEmail = kind === "export" ? exportEmail.trim() : erasureEmail.trim();
    const notes = kind === "export" ? exportNotes.trim() : erasureNotes.trim();
    if (!requesterEmail) {
      toast.error({ description: "Requester email is required." });
      return;
    }

    setBusyGdpr(kind);
    try {
      if (kind === "export") {
        await requestGdprExport({ requesterEmail, notes: notes || undefined });
        setExportEmail("");
        setExportNotes("");
      } else {
        await requestGdprErasure({ requesterEmail, notes: notes || undefined });
        setErasureEmail("");
        setErasureNotes("");
      }
      toast.success({ description: `GDPR ${kind} request recorded.` });
    } catch (error) {
      toast.error({ description: error instanceof Error ? error.message : "GDPR request failed." });
    } finally {
      setBusyGdpr(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <AdminMetricCard label="Admin users" value={adminUsers.results.length} description="Users with live admin roles." />
        <AdminMetricCard label="Feature flags" value={featureFlags.length} description="Runtime flags in Convex." />
        <AdminMetricCard label="GDPR requests" value={gdprRequests.results.length} description="Loaded recent GDPR requests." />
        <AdminMetricCard label="Your role" value={currentAdmin.adminRole ?? "none"} description="Current admin permission context." />
      </section>

      <AdminSectionCard title="Settings" description="Live settings surfaces backed by Convex admin queries and mutations.">
        <SegmentedControl aria-label="Settings sections" value={tab} onValueChange={(value) => setTab(value as SettingsTab)} size="sm">
          <SegmentedControlItem value="roles">Roles</SegmentedControlItem>
          <SegmentedControlItem value="flags">Feature flags</SegmentedControlItem>
          <SegmentedControlItem value="gdpr">GDPR</SegmentedControlItem>
          <SegmentedControlItem value="system">System</SegmentedControlItem>
        </SegmentedControl>

        <div className="mt-6">
          {tab === "roles" ? (
            <AdminTable>
              <AdminTableHead columns={["User", "Email", "Role", "Updated"]} />
              <tbody>
                {adminUsers.results.map((user) => (
                  <AdminTableRow key={String(user._id)}>
                    <AdminTableCell className="font-medium">{user.displayName ?? user.name ?? "Unknown"}</AdminTableCell>
                    <AdminTableCell>{user.email ?? "—"}</AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusPill tone={getAdminRoleTone(user.adminRole)}>
                        {user.adminRole ?? "none"}
                      </AdminStatusPill>
                    </AdminTableCell>
                    <AdminTableCell>{formatAdminDateTime(user.lastLoginAt ?? user.createdAt ?? user._creationTime)}</AdminTableCell>
                  </AdminTableRow>
                ))}
              </tbody>
            </AdminTable>
          ) : null}

          {tab === "flags" ? (
            featureFlags.length === 0 ? (
              <EmptyState title="No feature flags" description="Convex returned no feature flag rows." />
            ) : (
              <AdminTable>
                <AdminTableHead columns={["Key", "Status", "Description", "Updated", "Action"]} />
                <tbody>
                  {featureFlags.map((flag) => (
                    <AdminTableRow key={String(flag._id)}>
                      <AdminTableCell className="font-medium">{flag.key}</AdminTableCell>
                      <AdminTableCell>
                        <AdminStatusPill tone={flag.value ? "success" : "neutral"}>
                          {flag.value ? "Enabled" : "Disabled"}
                        </AdminStatusPill>
                      </AdminTableCell>
                      <AdminTableCell>{flag.description ?? "—"}</AdminTableCell>
                      <AdminTableCell>{formatAdminDateTime(flag.updatedAt)}</AdminTableCell>
                      <AdminTableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!canManageFlags}
                          isLoading={busyFlag === flag.key}
                          onClick={() => void handleToggleFlag(flag.key, !flag.value, flag.description)}
                        >
                          Toggle
                        </Button>
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </tbody>
              </AdminTable>
            )
          ) : null}

          {tab === "gdpr" ? (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <AdminSectionCard title="Request export" description="Record a GDPR export request.">
                  <div className="space-y-3">
                    <Input value={exportEmail} onChange={(event) => setExportEmail(event.currentTarget.value)} placeholder="user@example.com" />
                    <Textarea value={exportNotes} onChange={(event) => setExportNotes(event.currentTarget.value)} placeholder="Notes" rows={3} />
                    <Button isLoading={busyGdpr === "export"} onClick={() => void handleRequest("export")}>
                      Request export
                    </Button>
                  </div>
                </AdminSectionCard>
                <AdminSectionCard title="Request erasure" description="Record a GDPR erasure request.">
                  <div className="space-y-3">
                    <Input value={erasureEmail} onChange={(event) => setErasureEmail(event.currentTarget.value)} placeholder="user@example.com" />
                    <Textarea value={erasureNotes} onChange={(event) => setErasureNotes(event.currentTarget.value)} placeholder="Notes" rows={3} />
                    <Button isLoading={busyGdpr === "erasure"} onClick={() => void handleRequest("erasure")}>
                      Request erasure
                    </Button>
                  </div>
                </AdminSectionCard>
              </div>

              <AdminTable>
                <AdminTableHead columns={["Requester", "Type", "Status", "Received", "Fulfilled"]} />
                <tbody>
                  {gdprRequests.results.map((request) => (
                    <AdminTableRow key={String(request._id)}>
                      <AdminTableCell className="font-medium">{request.requesterEmail}</AdminTableCell>
                      <AdminTableCell>{request.requestType}</AdminTableCell>
                      <AdminTableCell>
                        <AdminStatusPill tone={request.status === "fulfilled" ? "success" : request.status === "failed" ? "danger" : "warning"}>
                          {request.status}
                        </AdminStatusPill>
                      </AdminTableCell>
                      <AdminTableCell>{formatAdminDateTime(request.receivedAt)}</AdminTableCell>
                      <AdminTableCell>{formatAdminDateTime(request.fulfilledAt)}</AdminTableCell>
                    </AdminTableRow>
                  ))}
                </tbody>
              </AdminTable>
            </div>
          ) : null}

          {tab === "system" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <SystemField label="Current admin role" value={currentAdmin.adminRole ?? "none"} />
              <SystemField label="Can manage roles" value={canManageRoles ? "Yes" : "No"} />
              <SystemField label="Can manage flags" value={canManageFlags ? "Yes" : "No"} />
              <SystemField label="Loaded admin users" value={String(adminUsers.results.length)} />
            </div>
          ) : null}
        </div>
      </AdminSectionCard>
    </div>
  );
}

function SystemField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">{label}</div>
      <div className="mt-2 text-sm text-[color:var(--foreground)]">{value}</div>
    </div>
  );
}
