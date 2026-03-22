"use client";

import { useState } from "react";
import Link from "next/link";
import { AccessibleDialog, Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SegmentedControl, SegmentedControlItem, Textarea } from "@/components/ui";
import { cn } from "@/utils/cn";
import type { AdminUserDetail, AdminUserPlan, AdminUserRole } from "./admin-users-data";

type TabKey =
  | "overview"
  | "profile"
  | "bikes"
  | "fit-history"
  | "integrations"
  | "license"
  | "feedback"
  | "messages"
  | "audit";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "profile", label: "Rider Profile" },
  { key: "bikes", label: "Bikes" },
  { key: "fit-history", label: "Fit History" },
  { key: "integrations", label: "Integrations" },
  { key: "license", label: "License" },
  { key: "feedback", label: "Feedback" },
  { key: "messages", label: "Messages" },
  { key: "audit", label: "Audit Trail" },
];

const planOptions = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "premium", label: "Premium" },
] as const;

const roleOptions = [
  { value: "super_admin", label: "super_admin" },
  { value: "ops_admin", label: "ops_admin" },
  { value: "support_admin", label: "support_admin" },
  { value: "fit_specialist", label: "fit_specialist" },
  { value: "geometry_manager", label: "geometry_manager" },
  { value: "billing_admin", label: "billing_admin" },
  { value: "qa_manager", label: "qa_manager" },
  { value: "analyst", label: "analyst" },
] as const;

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

function badgeClassName(kind: "free" | "pro" | "premium" | "admin" | "warning" | "success" | "muted") {
  switch (kind) {
    case "premium":
      return "border border-[color:color-mix(in_oklch,var(--primary)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_10%,var(--card))]";
    case "pro":
      return "border border-[color:color-mix(in_oklch,var(--secondary)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--secondary)_10%,var(--card))]";
    case "admin":
      return "border border-[color:color-mix(in_oklch,var(--warning)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--card))]";
    case "warning":
      return "border border-[color:color-mix(in_oklch,var(--warning)_34%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_14%,var(--card))]";
    case "success":
      return "border border-[color:color-mix(in_oklch,var(--success)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--success)_10%,var(--card))]";
    case "free":
    case "muted":
    default:
      return "border border-[color:var(--border)] bg-[color:var(--secondary)]";
  }
}

function badge({ children, kind = "muted" }: { children: string; kind?: "free" | "pro" | "premium" | "admin" | "warning" | "success" | "muted" }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize text-[color:var(--foreground)]", badgeClassName(kind))}>
      {children}
    </span>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <h3 className="text-base font-semibold text-[color:var(--foreground)]">{children}</h3>;
}

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">{value}</div>
    </div>
  );
}

export function UserDetailClient({ user }: { user: AdminUserDetail }) {
  const [tab, setTab] = useState<TabKey>("overview");
  const [notice, setNotice] = useState<string | null>(null);
  const [plan, setPlan] = useState<AdminUserPlan>(user.row.plan);
  const [planReason, setPlanReason] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [messageType, setMessageType] = useState("inbox_card");
  const [messageBody, setMessageBody] = useState("");
  const [adminRole, setAdminRole] = useState<AdminUserRole | "none">(user.row.adminRole ?? "none");
  const [roleReason, setRoleReason] = useState("");
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isImpersonateDialogOpen, setIsImpersonateDialogOpen] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState(user.row.suspendedReason ?? "");
  const [impersonationReason, setImpersonationReason] = useState("");

  const openFeedbackCount = user.feedback.filter((item) => item.status !== "closed").length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">Admin / Users & Accounts</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">{user.row.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {badge({ children: user.row.plan, kind: user.row.plan })}
            {user.row.adminRole ? badge({ children: user.row.adminRole.replaceAll("_", " "), kind: "admin" }) : null}
            {user.row.stravaConnected ? badge({ children: "Strava connected", kind: "success" }) : badge({ children: "Strava not connected", kind: "warning" })}
            {user.row.suspendedAt ? badge({ children: "Suspended", kind: "warning" }) : null}
          </div>
          <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{user.row.email}</p>
        </div>
        <Button render={<Link href="./" />} variant="outline">
          Back to users
        </Button>
      </div>

      {notice ? (
        <div className="rounded-[var(--radius-lg)] border border-[color:color-mix(in_oklch,var(--primary)_24%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_8%,var(--card))] p-4 text-sm text-[color:var(--foreground)]">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryStat label="Bikes" value={user.row.bikesCount} />
        <SummaryStat label="Fit runs" value={user.row.fitRunsCount} />
        <SummaryStat label="Open feedback" value={openFeedbackCount} />
        <SummaryStat label="Last login" value={formatDate(user.row.lastLoginAt)} />
      </div>

      <SegmentedControl
        aria-label="User detail tabs"
        value={tab}
        onValueChange={(value) => setTab(value as TabKey)}
        size="sm"
      >
        {tabs.map((item) => (
          <SegmentedControlItem key={item.key} value={item.key}>
            {item.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>

      {tab === "overview" ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Account overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Joined</div>
                  <div className="mt-1 text-sm text-[color:var(--foreground)]">{formatDate(user.row.joinedAt)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Last login</div>
                  <div className="mt-1 text-sm text-[color:var(--foreground)]">{formatDate(user.row.lastLoginAt)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Account type</div>
                  <div className="mt-1 text-sm text-[color:var(--foreground)]">{badge({ children: user.row.plan, kind: user.row.plan })}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Admin role</div>
                  <div className="mt-1 text-sm text-[color:var(--foreground)]">
                    {user.row.adminRole ? badge({ children: user.row.adminRole.replaceAll("_", " "), kind: "admin" }) : "None"}
                  </div>
                </div>
              </div>

              {user.row.suspendedAt ? (
                <div className="rounded-[var(--radius-lg)] border border-[color:color-mix(in_oklch,var(--warning)_24%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_8%,var(--card))] p-4 text-sm text-[color:var(--foreground)]">
                  <div className="font-medium">Suspended</div>
                  <div className="mt-1 text-[color:var(--muted-foreground)]">{user.row.suspendedReason ?? "No reason recorded"}</div>
                  <div className="mt-1 text-xs text-[color:var(--muted-foreground)]">{user.row.suspendedAt ? formatDate(user.row.suspendedAt) : ""}</div>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-3">
                <Button type="button" variant="outline" onClick={() => setNotice("Planned mutation: `changeUserTier`")}>Change plan</Button>
                <Button type="button" variant="outline" onClick={() => setIsSuspendDialogOpen(true)}>Suspend account</Button>
                <Button type="button" variant="outline" onClick={() => setIsImpersonateDialogOpen(true)}>View as user</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  aria-label="User plan"
                  value={plan}
                  onChange={(event) => setPlan(event.currentTarget.value as AdminUserPlan)}
                  options={planOptions.map((option) => ({ value: option.value, label: option.label }))}
                />
                <Textarea
                  value={planReason}
                  onChange={(event) => setPlanReason(event.currentTarget.value)}
                  placeholder="Reason for the plan change"
                  rows={3}
                />
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => setNotice(`Planned mutation: \`changeUserTier\` for ${user.row.email} -> ${plan}. Reason: ${planReason || "n/a"}`)}
                >
                  Apply change
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Send dashboard message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input value={messageTitle} onChange={(event) => setMessageTitle(event.currentTarget.value)} placeholder="Message title" />
                <Select
                  aria-label="Message type"
                  value={messageType}
                  onChange={(event) => setMessageType(event.currentTarget.value)}
                  options={[
                    { value: "inbox_card", label: "Inbox card" },
                    { value: "banner", label: "Banner" },
                    { value: "support_reply", label: "Support reply" },
                  ]}
                />
                <Textarea
                  value={messageBody}
                  onChange={(event) => setMessageBody(event.currentTarget.value)}
                  placeholder="Write the dashboard message body"
                  rows={4}
                />
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => setNotice(`Planned mutation: \`createDashboardMessage\` for ${user.row.email}.`)}
                >
                  Send message
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin role</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  aria-label="Admin role"
                  value={adminRole}
                  onChange={(event) => setAdminRole(event.currentTarget.value as AdminUserRole | "none")}
                  options={[
                    { value: "none", label: "Remove admin access" },
                    ...roleOptions.map((option) => ({ value: option.value, label: option.label })),
                  ]}
                />
                <Textarea
                  value={roleReason}
                  onChange={(event) => setRoleReason(event.currentTarget.value)}
                  placeholder="Reason for role change"
                  rows={3}
                />
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => setNotice(`Planned mutation: \`setAdminRole\` -> ${adminRole}.`)}
                >
                  Save role
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === "profile" ? (
        <Card>
          <CardHeader>
            <CardTitle>Rider profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ProfileField label="Height" value={`${user.riderProfile.heightCm} cm`} />
              <ProfileField label="Inseam" value={`${user.riderProfile.inseamCm} cm`} />
              <ProfileField label="Arm length" value={`${user.riderProfile.armLengthCm} cm`} />
              <ProfileField label="Torso length" value={`${user.riderProfile.torsoLengthCm} cm`} />
              <ProfileField label="Shoulder width" value={`${user.riderProfile.shoulderWidthCm} cm`} />
              <ProfileField label="Flexibility" value={user.riderProfile.flexibility} />
              <ProfileField label="Core stability" value={`${user.riderProfile.coreStability}/5`} />
              <ProfileField label="Injury history" value={user.riderProfile.injuryHistory.join(", ")} />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "bikes" ? (
        <Card>
          <CardHeader>
            <CardTitle>Bikes</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="min-w-full divide-y divide-[color:var(--border)] text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                <tr>
                  <th className="py-3 pr-4">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Geometry</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {user.bikes.map((bike) => (
                  <tr key={bike.id}>
                    <td className="py-3 pr-4 font-medium text-[color:var(--foreground)]">{bike.name}</td>
                    <td className="px-4 py-3 text-[color:var(--foreground)]">{bike.category}</td>
                    <td className="px-4 py-3 text-[color:var(--foreground)]">{bike.size}</td>
                    <td className="px-4 py-3">{bike.geometryLinked ? badge({ children: "Linked", kind: "success" }) : badge({ children: "Unlinked", kind: "warning" })}</td>
                    <td className="px-4 py-3 text-right">
                      <Button render={<Link href={`../bikes/${bike.id}`} />} size="sm" variant="outline">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      {tab === "fit-history" ? (
        <Card>
          <CardHeader>
            <CardTitle>Fit history</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="min-w-full divide-y divide-[color:var(--border)] text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                <tr>
                  <th className="py-3 pr-4">Bike</th>
                  <th className="px-4 py-3">Engine</th>
                  <th className="px-4 py-3">Completed</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {user.fitHistory.map((fit) => (
                  <tr key={fit.id}>
                    <td className="py-3 pr-4 font-medium text-[color:var(--foreground)]">{fit.bike}</td>
                    <td className="px-4 py-3 text-[color:var(--foreground)]">{fit.engineVersion}</td>
                    <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{formatDate(fit.completedAt)}</td>
                    <td className="px-4 py-3">{badge({ children: fit.confidence, kind: fit.confidence === "High" ? "success" : fit.confidence === "Medium" ? "premium" : "warning" })}</td>
                    <td className="px-4 py-3 text-right">
                      <Button render={<Link href={`../fit-runs/${fit.id}`} />} size="sm" variant="outline">
                        Trace
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      {tab === "integrations" ? (
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.integrations.length === 0 ? (
              <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--border)] p-6 text-sm text-[color:var(--muted-foreground)]">
                No integrations connected.
              </div>
            ) : user.integrations.map((integration) => (
              <div key={integration.provider} className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-[color:var(--foreground)]">{integration.provider}</div>
                  {badge({ children: integration.status, kind: integration.status === "active" ? "success" : "warning" })}
                </div>
                <div className="mt-2 text-sm text-[color:var(--muted-foreground)]">{integration.notes}</div>
                <div className="mt-1 text-xs text-[color:var(--muted-foreground)]">Last sync {integration.lastSync}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {tab === "license" ? (
        <Card>
          <CardHeader>
            <CardTitle>License</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <ProfileField label="Current plan" value={user.license.currentPlan} />
              <ProfileField label="Assigned at" value={formatDate(user.license.assignedAt)} />
              <ProfileField label="Trial ends" value={user.license.trialEndsAt ? formatDate(user.license.trialEndsAt) : "No trial"} />
            </div>

            <div>
              <SectionTitle>Plan change history</SectionTitle>
              <table className="mt-4 min-w-full divide-y divide-[color:var(--border)] text-sm">
                <thead className="text-left text-xs uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                  <tr>
                    <th className="py-3 pr-4">Date</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--border)]">
                {user.license.history.map((entry) => (
                  <tr key={`${entry.action}-${entry.time}`}>
                    <td className="py-3 pr-4 text-[color:var(--muted-foreground)]">{formatDate(entry.time)}</td>
                      <td className="px-4 py-3 font-medium text-[color:var(--foreground)]">{entry.action}</td>
                      <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{entry.reason}</td>
                      <td className="px-4 py-3 text-[color:var(--foreground)]">{entry.admin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "feedback" ? (
        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.feedback.map((item) => (
              <div key={item.id} className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-medium text-[color:var(--foreground)]">{item.title}</div>
                  {badge({ children: item.type.replace("_", " "), kind: item.type === "bug" ? "warning" : "muted" })}
                  {badge({ children: item.status, kind: "muted" })}
                </div>
                {item.linkedRelease ? <div className="mt-2 text-sm text-[color:var(--muted-foreground)]">Linked release: {item.linkedRelease}</div> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {tab === "messages" ? (
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.messages.length === 0 ? (
              <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--border)] p-6 text-sm text-[color:var(--muted-foreground)]">
                No dashboard messages received yet.
              </div>
            ) : user.messages.map((message) => (
              <div key={message.id} className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-medium text-[color:var(--foreground)]">{message.title}</div>
                  {badge({ children: message.type, kind: "muted" })}
                  {badge({ children: message.state, kind: message.state === "read" ? "success" : "warning" })}
                </div>
                <div className="mt-2 text-sm text-[color:var(--muted-foreground)]">{formatDate(message.receivedAt)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {tab === "audit" ? (
        <Card>
          <CardHeader>
            <CardTitle>Audit trail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.auditTrail.map((entry) => (
              <div key={`${entry.action}-${entry.time}`} className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium text-[color:var(--foreground)]">{entry.action}</div>
                  <div className="text-xs text-[color:var(--muted-foreground)]">{formatDate(entry.time)}</div>
                </div>
                <div className="mt-2 text-sm text-[color:var(--muted-foreground)]">Target: {entry.target}</div>
                <div className="mt-1 text-sm text-[color:var(--muted-foreground)]">Admin: {entry.admin}</div>
                <div className="mt-1 text-sm text-[color:var(--muted-foreground)]">Reason: {entry.reason}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <AccessibleDialog
        open={isSuspendDialogOpen}
        title="Suspend account"
        description="This placeholder dialog mirrors the planned admin mutation flow."
        onClose={() => setIsSuspendDialogOpen(false)}
      >
        <div className="space-y-4">
          <Textarea
            value={suspensionReason}
            onChange={(event) => setSuspensionReason(event.currentTarget.value)}
            placeholder="Reason for suspension"
            rows={4}
          />
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              setIsSuspendDialogOpen(false);
              setNotice("Planned mutation: `suspendUser`.");
            }}
          >
            Confirm suspension
          </Button>
        </div>
      </AccessibleDialog>

      <AccessibleDialog
        open={isRestoreDialogOpen}
        title="Restore account"
        description="Re-enable access for the selected user."
        onClose={() => setIsRestoreDialogOpen(false)}
      >
        <div className="space-y-4">
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              setIsRestoreDialogOpen(false);
              setNotice("Planned mutation: `restoreUser`.");
            }}
          >
            Restore access
          </Button>
        </div>
      </AccessibleDialog>

      <AccessibleDialog
        open={isImpersonateDialogOpen}
        title="View as user"
        description="This is the planned impersonation flow for support admins."
        onClose={() => setIsImpersonateDialogOpen(false)}
      >
        <div className="space-y-4">
          <Input
            value={impersonationReason}
            onChange={(event) => setImpersonationReason(event.currentTarget.value)}
            placeholder="Reason for impersonation"
          />
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              setIsImpersonateDialogOpen(false);
              setNotice("Planned action: `startImpersonation`.");
            }}
          >
            Open new tab
          </Button>
        </div>
      </AccessibleDialog>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">{label}</div>
      <div className="mt-2 text-sm leading-6 text-[color:var(--foreground)]">{value}</div>
    </div>
  );
}
