"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  AccessibleDialog,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SegmentedControl,
  SegmentedControlItem,
  Textarea,
  FieldLabel,
} from "@/components/ui";
import {
  AdminMetricCard,
  AdminSectionCard,
  AdminStatusPill,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
} from "@/components/admin/layout/AdminUi";

type AdminRole =
  | "super_admin"
  | "ops_admin"
  | "support_admin"
  | "fit_specialist"
  | "geometry_manager"
  | "billing_admin"
  | "qa_manager"
  | "analyst";

type SettingsTab = "roles" | "flags" | "gdpr" | "system";

type AdminRoleRow = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  assignedBy: string;
  assignedAt: string;
};

type FeatureFlagRow = {
  key: string;
  value: boolean;
  description: string;
  updatedBy: string;
  updatedAt: string;
};

type GdprRequestRow = {
  id: string;
  type: "export" | "erasure";
  requesterEmail: string;
  receivedAt: string;
  fulfilledAt?: string;
  notes: string;
};

const roleRows: AdminRoleRow[] = [
  {
    id: "admin_001",
    name: "Morgan Reed",
    email: "morgan@example.com",
    role: "super_admin",
    assignedBy: "System",
    assignedAt: "2026-01-12",
  },
  {
    id: "admin_002",
    name: "Tess Novak",
    email: "tess@example.com",
    role: "support_admin",
    assignedBy: "Morgan Reed",
    assignedAt: "2026-02-18",
  },
  {
    id: "admin_003",
    name: "Alex Morgan",
    email: "alex@example.com",
    role: "billing_admin",
    assignedBy: "Morgan Reed",
    assignedAt: "2026-03-01",
  },
];

const featureFlags: FeatureFlagRow[] = [
  {
    key: "strava_connect_enabled",
    value: true,
    description: "Global toggle for Strava OAuth.",
    updatedBy: "Morgan Reed",
    updatedAt: "2026-03-10",
  },
  {
    key: "new_user_registration_enabled",
    value: true,
    description: "Allow new signups into the rider dashboard.",
    updatedBy: "Tess Novak",
    updatedAt: "2026-03-11",
  },
  {
    key: "pro_upgrade_enabled",
    value: true,
    description: "Show upgrade CTAs to free users.",
    updatedBy: "Morgan Reed",
    updatedAt: "2026-03-14",
  },
  {
    key: "manual_review_queue_enabled",
    value: true,
    description: "Send low-confidence fits to the review queue.",
    updatedBy: "Alex Morgan",
    updatedAt: "2026-03-15",
  },
];

const gdprRequests: GdprRequestRow[] = [
  {
    id: "gdpr_001",
    type: "export",
    requesterEmail: "ellie@example.com",
    receivedAt: "2026-03-12",
    fulfilledAt: "2026-03-13",
    notes: "Delivered data export after identity check.",
  },
  {
    id: "gdpr_002",
    type: "erasure",
    requesterEmail: "sara@example.com",
    receivedAt: "2026-03-16",
    notes: "Pending final confirmation for anonymization.",
  },
];

function formatDate(dateString?: string) {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(dateString));
}

function roleTone(role: AdminRole) {
  switch (role) {
    case "super_admin":
      return "danger";
    case "ops_admin":
    case "billing_admin":
      return "warning";
    case "support_admin":
      return "info";
    case "fit_specialist":
    case "geometry_manager":
    case "qa_manager":
      return "success";
    case "analyst":
    default:
      return "neutral";
  }
}

function flagTone(value: boolean) {
  return value ? "success" : "neutral";
}

function FieldBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <FieldLabel label={label} />
      {children}
    </div>
  );
}

export function SettingsManagementView() {
  const [tab, setTab] = useState<SettingsTab>("roles");
  const [flags, setFlags] = useState(featureFlags);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminRole, setAdminRole] = useState<AdminRole>("support_admin");
  const [adminReason, setAdminReason] = useState("");
  const [exportTarget, setExportTarget] = useState("ellie@example.com");
  const [exportReason, setExportReason] = useState("");
  const [anonymizeTarget, setAnonymizeTarget] = useState("sara@example.com");
  const [anonymizeReason, setAnonymizeReason] = useState("");
  const [confirmPhrase, setConfirmPhrase] = useState("");

  const enabledFlags = useMemo(() => flags.filter((flag) => flag.value).length, [flags]);

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="System settings"
        description="Role management, feature flags, GDPR tooling, and system info."
        actions={
          <Button variant="outline" size="sm" onClick={() => setIsAddAdminOpen(true)}>
            Add admin
          </Button>
        }
      >
        <SegmentedControl
          aria-label="Settings sections"
          value={tab}
          onValueChange={(value) => setTab(value as SettingsTab)}
          size="sm"
          className="flex-wrap"
        >
          <SegmentedControlItem value="roles" size="sm">Admin roles</SegmentedControlItem>
          <SegmentedControlItem value="flags" size="sm">Feature flags</SegmentedControlItem>
          <SegmentedControlItem value="gdpr" size="sm">GDPR tooling</SegmentedControlItem>
          <SegmentedControlItem value="system" size="sm">System info</SegmentedControlItem>
        </SegmentedControl>

        <div className="mt-6 space-y-6">
          {tab === "roles" ? (
            <div className="space-y-6">
              <AdminTable>
                <AdminTableHead columns={["Name", "Email", "Role", "Assigned by", "Assigned at", "Actions"]} />
                <tbody>
                  {roleRows.map((row) => (
                    <tr key={row.id} className="border-t border-[color:var(--border)]">
                      <AdminTableCell className="font-medium">{row.name}</AdminTableCell>
                      <AdminTableCell>{row.email}</AdminTableCell>
                      <AdminTableCell>
                        <AdminStatusPill tone={roleTone(row.role)}>{row.role}</AdminStatusPill>
                      </AdminTableCell>
                      <AdminTableCell>{row.assignedBy}</AdminTableCell>
                      <AdminTableCell>{formatDate(row.assignedAt)}</AdminTableCell>
                      <AdminTableCell>
                        <Button variant="outline" size="sm">
                          Remove
                        </Button>
                      </AdminTableCell>
                    </tr>
                  ))}
                </tbody>
              </AdminTable>

              <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
                <CardHeader>
                  <CardTitle className="text-base">Role reference</CardTitle>
                  <CardDescription>Planned permission map for the admin surface.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-hidden">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-[color:var(--secondary)]">
                      <tr>
                        <th className="px-3 py-2">Role</th>
                        <th className="px-3 py-2">Plan</th>
                        <th className="px-3 py-2">Fit reviews</th>
                        <th className="px-3 py-2">Geometry</th>
                        <th className="px-3 py-2">Releases</th>
                        <th className="px-3 py-2">Impersonation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["super_admin", "✓", "✓", "✓", "✓", "✓"],
                        ["ops_admin", "✓", "—", "—", "Partial", "—"],
                        ["support_admin", "—", "—", "—", "—", "✓"],
                        ["fit_specialist", "—", "✓", "—", "—", "—"],
                        ["geometry_manager", "—", "—", "✓", "—", "—"],
                        ["billing_admin", "✓", "—", "—", "—", "—"],
                        ["qa_manager", "—", "—", "—", "✓", "—"],
                        ["analyst", "—", "—", "—", "—", "—"],
                      ].map((row) => (
                        <tr key={row[0]} className="border-t border-[color:var(--border)]">
                          {row.map((cell) => (
                            <td key={cell} className="px-3 py-2">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {tab === "flags" ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <AdminMetricCard label="Flags" value={flags.length} description="System toggles in the working set" />
                <AdminMetricCard label="Enabled" value={enabledFlags} description="Flags currently on" />
                <AdminMetricCard label="Disabled" value={flags.length - enabledFlags} description="Flags currently off" />
              </div>
              <AdminTable>
                <AdminTableHead columns={["Key", "Description", "Value", "Updated by", "Updated at", "Actions"]} />
                <tbody>
                  {flags.map((flag, index) => (
                    <tr key={flag.key} className="border-t border-[color:var(--border)]">
                      <AdminTableCell className="font-medium">{flag.key}</AdminTableCell>
                      <AdminTableCell>{flag.description}</AdminTableCell>
                      <AdminTableCell>
                        <AdminStatusPill tone={flagTone(flag.value)}>{flag.value ? "Enabled" : "Disabled"}</AdminStatusPill>
                      </AdminTableCell>
                      <AdminTableCell>{flag.updatedBy}</AdminTableCell>
                      <AdminTableCell>{formatDate(flag.updatedAt)}</AdminTableCell>
                      <AdminTableCell>
                        <Button
                          variant={flag.value ? "outline" : "default"}
                          size="sm"
                          onClick={() =>
                            setFlags((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, value: !entry.value } : entry
                              )
                            )
                          }
                        >
                          {flag.value ? "Turn off" : "Turn on"}
                        </Button>
                      </AdminTableCell>
                    </tr>
                  ))}
                </tbody>
              </AdminTable>
            </div>
          ) : null}

          {tab === "gdpr" ? (
            <div className="grid gap-6 xl:grid-cols-3">
              <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
                <CardHeader>
                  <CardTitle className="text-base">Data export</CardTitle>
                  <CardDescription>Collect all data for a rider and export it as JSON.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FieldBlock label="User email or ID">
                    <Input value={exportTarget} onChange={(event) => setExportTarget(event.currentTarget.value)} />
                  </FieldBlock>
                  <Textarea label="Reason" rows={4} value={exportReason} onChange={(event) => setExportReason(event.currentTarget.value)} />
                </CardContent>
                <CardFooter className="justify-end">
                  <Button>Export user data</Button>
                </CardFooter>
              </Card>

              <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
                <CardHeader>
                  <CardTitle className="text-base">Account anonymization</CardTitle>
                  <CardDescription>Irreversible removal of personal data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FieldBlock label="User email or ID">
                    <Input value={anonymizeTarget} onChange={(event) => setAnonymizeTarget(event.currentTarget.value)} />
                  </FieldBlock>
                  <Textarea label="Reason" rows={4} value={anonymizeReason} onChange={(event) => setAnonymizeReason(event.currentTarget.value)} />
                  <FieldBlock label="Confirmation phrase">
                    <Input value={confirmPhrase} onChange={(event) => setConfirmPhrase(event.currentTarget.value)} placeholder="Type DELETE to continue" />
                  </FieldBlock>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button variant="destructive" onClick={() => setIsConfirmOpen(true)}>
                    Anonymize account
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
                <CardHeader>
                  <CardTitle className="text-base">Active GDPR requests</CardTitle>
                  <CardDescription>Manual request log for external export or erasure cases.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {gdprRequests.map((request) => (
                    <div key={request.id} className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4 text-sm">
                      <div className="flex items-center gap-2">
                        <AdminStatusPill tone={request.type === "export" ? "info" : "warning"}>{request.type}</AdminStatusPill>
                        <span className="font-medium">{request.requesterEmail}</span>
                      </div>
                      <p className="mt-2 text-[color:var(--muted-foreground)]">
                        Received {formatDate(request.receivedAt)} {request.fulfilledAt ? `· Fulfilled ${formatDate(request.fulfilledAt)}` : "· Pending"}
                      </p>
                      <p className="mt-2">{request.notes}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : null}

          {tab === "system" ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <AdminMetricCard label="Deployment" value="prod:elegant-panther-767" description="Current production Convex deployment" />
                <AdminMetricCard label="Fit engine" value="v1.18.0" description="Contract-shaped admin preview" />
                <AdminMetricCard label="Feature flags" value={enabledFlags} description="Currently enabled flags" />
                <AdminMetricCard label="Admin panel" value="0.1.0" description="Current UI contract build" />
              </div>
              <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
                <CardHeader>
                  <CardTitle className="text-base">System details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {[
                    ["Convex deployment", "prod:elegant-panther-767"],
                    ["Database tables", "feature_flags, billing_events, dashboard_messages, feedback_items"],
                    ["Last deploy", "2026-03-22"],
                    ["Locale system", "NL + EN"],
                    ["Admin shell", "Prototyper UI"],
                    ["Backups", "Enabled"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">{label}</p>
                      <p className="mt-2 text-sm font-medium">{value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </AdminSectionCard>

      <AccessibleDialog
        open={isAddAdminOpen}
        title="Add admin"
        description="Search a user, select a role, and add a required reason."
        onClose={() => setIsAddAdminOpen(false)}
      >
        <div className="space-y-4">
          <FieldBlock label="User email">
            <Input value={adminEmail} onChange={(event) => setAdminEmail(event.currentTarget.value)} />
          </FieldBlock>
          <Select
            label="Role"
            value={adminRole}
            onChange={(event) => setAdminRole(event.currentTarget.value as AdminRole)}
            options={[
              { value: "super_admin", label: "super_admin" },
              { value: "ops_admin", label: "ops_admin" },
              { value: "support_admin", label: "support_admin" },
              { value: "fit_specialist", label: "fit_specialist" },
              { value: "geometry_manager", label: "geometry_manager" },
              { value: "billing_admin", label: "billing_admin" },
              { value: "qa_manager", label: "qa_manager" },
              { value: "analyst", label: "analyst" },
            ]}
          />
          <Textarea label="Reason" rows={4} value={adminReason} onChange={(event) => setAdminReason(event.currentTarget.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddAdminOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsAddAdminOpen(false)}>Add admin</Button>
          </div>
        </div>
      </AccessibleDialog>

      <AccessibleDialog
        open={isConfirmOpen}
        title="Confirm anonymization"
        description="Type DELETE to confirm the irreversible removal."
        onClose={() => setIsConfirmOpen(false)}
      >
        <div className="space-y-4">
          <Textarea label="Reason" rows={4} value={anonymizeReason} onChange={(event) => setAnonymizeReason(event.currentTarget.value)} />
          <FieldBlock label="Confirmation phrase">
            <Input value={confirmPhrase} onChange={(event) => setConfirmPhrase(event.currentTarget.value)} />
          </FieldBlock>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setIsConfirmOpen(false)} disabled={confirmPhrase.trim() !== "DELETE"}>
              Anonymize
            </Button>
          </div>
        </div>
      </AccessibleDialog>
    </div>
  );
}
