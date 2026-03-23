"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import {
  Button,
  EmptyState,
  Input,
  LoadingState,
  Select,
  SegmentedControl,
  SegmentedControlItem,
  Textarea,
  useToast,
} from "@/components/ui";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusPill,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "@/components/admin/layout/AdminUi";
import { formatAdminDate, formatAdminRelativeDate, formatAdminDateTime } from "@/components/admin/shared/admin-format";
import { displayAdminUserName } from "@/components/admin/shared/live-admin-data";
import { formatAdminRoleLabel } from "../auth/admin-auth-shared";

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
  { key: "profile", label: "Profile" },
  { key: "bikes", label: "Bikes" },
  { key: "fit-history", label: "Fit History" },
  { key: "integrations", label: "Integrations" },
  { key: "license", label: "License" },
  { key: "feedback", label: "Feedback" },
  { key: "messages", label: "Messages" },
  { key: "audit", label: "Audit" },
];

const tierOptions = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "premium", label: "Premium" },
] as const;

const roleOptions = [
  { value: "none", label: "Remove admin access" },
  { value: "super_admin", label: "super_admin" },
  { value: "ops_admin", label: "ops_admin" },
  { value: "support_admin", label: "support_admin" },
  { value: "fit_specialist", label: "fit_specialist" },
  { value: "geometry_manager", label: "geometry_manager" },
  { value: "billing_admin", label: "billing_admin" },
  { value: "qa_manager", label: "qa_manager" },
  { value: "analyst", label: "analyst" },
] as const;

const messageTypeOptions = [
  { value: "banner", label: "Banner" },
  { value: "inbox_card", label: "Inbox card" },
  { value: "sticky_warning", label: "Sticky warning" },
  { value: "support_reply", label: "Support reply" },
] as const;

const messagePriorityOptions = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

type UserDetailData = {
  user: Doc<"users"> | null;
  bikes: Doc<"bikes">[];
  fitRuns: Doc<"fitSessions">[];
  integration: Doc<"integrations"> | null;
  subscriptions: Doc<"subscriptions">[];
  feedbackItems: Doc<"feedback_items">[];
  messageReceipts: Doc<"message_receipts">[];
  auditLogs: Doc<"admin_audit_logs">[];
  bikeCount: number;
  fitRunCount: number;
  stravaConnected: boolean;
};

type RiderData = {
  user: Doc<"users"> | null;
  profile: Doc<"profiles"> | null;
  bikes: Doc<"bikes">[];
  fitSessions: Doc<"fitSessions">[];
  questionnaireResponses: Doc<"questionnaireResponses">[];
  recommendations: Doc<"recommendations">[];
  validationCaptures: Doc<"validationCaptures">[];
  rideFeedbackEntries: Doc<"rideFeedbackEntries">[];
  emailReports: Doc<"emailReports">[];
  measurementFlags: string[];
};

function userTierTone(tier: string | null) {
  switch (tier) {
    case "premium":
      return "success";
    case "pro":
      return "info";
    default:
      return "neutral";
  }
}

function adminRoleTone(role: string | null) {
  return role ? "info" : "neutral";
}

function liveStat(label: string, value: string | number) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">{value}</div>
    </div>
  );
}

function getMutationErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function UserDetailClient({ userId }: { userId: string }) {
  const toast = useToast();
  const [tab, setTab] = useState<TabKey>("overview");
  const [tier, setTier] = useState<"free" | "pro" | "premium">("free");
  const [tierReason, setTierReason] = useState("");
  const [adminRole, setAdminRole] = useState<"none" | (typeof roleOptions)[number]["value"]>("none");
  const [roleReason, setRoleReason] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [messageType, setMessageType] = useState<(typeof messageTypeOptions)[number]["value"]>("inbox_card");
  const [messagePriority, setMessagePriority] = useState<(typeof messagePriorityOptions)[number]["value"]>("normal");
  const [impersonationReason, setImpersonationReason] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const resolvedUserId = userId as Id<"users">;
  const detail = useQuery(api.admin.queries.getUserDetail, { userId: resolvedUserId }) as UserDetailData | undefined;
  const riderData = useQuery(api.admin.queries.getAdminRiderData, { userId: resolvedUserId }) as RiderData | null | undefined;
  const currentAdmin = useQuery(api.admin.queries.getCurrentAdminUser);
  const changeUserTier = useMutation(api.admin.mutations.changeUserTier);
  const suspendUser = useMutation(api.admin.mutations.suspendUser);
  const restoreUser = useMutation(api.admin.mutations.restoreUser);
  const setAdminRoleMutation = useMutation(api.admin.mutations.setAdminRole);
  const createDashboardMessage = useMutation(api.admin.mutations.createDashboardMessage);
  const startImpersonation = useAction(api.admin.actions.startImpersonation);

  const liveUser = detail?.user ?? riderData?.user ?? null;
  const profile = riderData?.profile ?? null;
  const canChangeTier = currentAdmin?.adminRole
    ? ["super_admin", "billing_admin", "ops_admin"].includes(currentAdmin.adminRole)
    : false;
  const canChangeRole = currentAdmin?.adminRole === "super_admin";
  const canSuspend = currentAdmin?.adminRole
    ? ["super_admin", "support_admin", "ops_admin"].includes(currentAdmin.adminRole)
    : false;
  const canImpersonate = Boolean(currentAdmin);

  useEffect(() => {
    if (!liveUser) {
      return;
    }

    setTier(liveUser.tier ?? "free");
    setAdminRole(liveUser.adminRole ?? "none");
    setSuspendReason(liveUser.suspendedReason ?? "");
  }, [liveUser?._id, liveUser?.tier, liveUser?.adminRole, liveUser?.suspendedReason]);

  if (detail === undefined || riderData === undefined || currentAdmin === undefined) {
    return <LoadingState label="Loading user..." />;
  }

  if (!liveUser) {
    return (
      <EmptyState
        title="User not found"
        description="Convex returned no live user record for this route."
        action={
          <Button render={<Link href="/admin/users" />} variant="outline">
            Back to users
          </Button>
        }
      />
    );
  }

  const summaryBikes = riderData?.bikes ?? detail.bikes;
  const summaryFitRuns = riderData?.fitSessions ?? detail.fitRuns;
  const subscriptions = detail.subscriptions ?? [];
  const feedbackItems = detail.feedbackItems ?? [];
  const receipts = detail.messageReceipts ?? [];
  const auditLogs = detail.auditLogs ?? [];

  const runMutation = async (
    action: string,
    handler: () => Promise<unknown>,
    successDescription: string
  ) => {
    setPendingAction(action);
    try {
      await handler();
      toast.success({ description: successDescription });
    } catch (error) {
      toast.error({ description: getMutationErrorMessage(error) });
    } finally {
      setPendingAction(null);
    }
  };

  const handleChangeTier = async () => {
    if (!canChangeTier) return;
    await runMutation(
      "tier",
      async () => {
        await changeUserTier({
          userId: resolvedUserId,
          tier,
          reason: tierReason.trim() || "Admin tier update",
        });
      },
      `Tier updated to ${tier}.`
    );
  };

  const handleSuspend = async () => {
    if (!canSuspend) return;
    await runMutation(
      "suspend",
      async () => {
        await suspendUser({
          userId: resolvedUserId,
          reason: suspendReason.trim() || "Admin suspension",
        });
      },
      "User suspended."
    );
  };

  const handleRestore = async () => {
    if (!canSuspend) return;
    await runMutation(
      "restore",
      async () => {
        await restoreUser({
          userId: resolvedUserId,
          reason: "Admin restore",
        });
      },
      "User restored."
    );
  };

  const handleSaveRole = async () => {
    if (!canChangeRole) return;
    await runMutation(
      "role",
      async () => {
        await setAdminRoleMutation({
          userId: resolvedUserId,
          role: adminRole === "none" ? undefined : adminRole,
          reason: roleReason.trim() || "Admin role update",
        });
      },
      "Admin role updated."
    );
  };

  const handleSendMessage = async () => {
    await runMutation(
      "message",
      async () => {
        await createDashboardMessage({
          title: messageTitle.trim() || `Message for ${displayAdminUserName(liveUser)}`,
          body: messageBody.trim() || "Admin message",
          type: messageType,
          priority: messagePriority,
          locale: "all",
          dismissible: true,
          requiresAcknowledgement: false,
          startsAt: Date.now(),
          targets: [{ targetType: "user", targetValue: String(resolvedUserId) }],
        });
      },
      "Dashboard message created."
    );
  };

  const handleImpersonate = async () => {
    if (!canImpersonate) return;
    setPendingAction("impersonate");
    try {
      const result = await startImpersonation({
        userId: resolvedUserId,
        reason: impersonationReason.trim() || "Admin support review",
      });
      toast.success({
        description: `Impersonation token created for ${String(result.userId)}.`,
      });
      setImpersonationReason("");
    } catch (error) {
      toast.error({ description: getMutationErrorMessage(error) });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Command center"
        title={displayAdminUserName(liveUser)}
        description={liveUser.email ?? "Live user record from Convex."}
        actions={
          <Button render={<Link href="/admin/users" />} variant="outline">
            Back to users
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <AdminStatusPill tone={userTierTone(liveUser.tier ?? null)}>{liveUser.tier ?? "free"}</AdminStatusPill>
        {liveUser.adminRole ? (
          <AdminStatusPill tone={adminRoleTone(liveUser.adminRole)}>
            {formatAdminRoleLabel(liveUser.adminRole)}
          </AdminStatusPill>
        ) : (
          <AdminStatusPill tone="neutral">No admin role</AdminStatusPill>
        )}
        <AdminStatusPill tone={detail.stravaConnected ? "success" : "warning"}>
          {detail.stravaConnected ? "Strava connected" : "Strava not connected"}
        </AdminStatusPill>
        <AdminStatusPill tone={liveUser.suspendedAt ? "warning" : "success"}>
          {liveUser.suspendedAt ? "Suspended" : "Active"}
        </AdminStatusPill>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        {liveStat("Bikes", summaryBikes.length)}
        {liveStat("Fit runs", summaryFitRuns.length)}
        {liveStat("Feedback", feedbackItems.length)}
        {liveStat("Message receipts", receipts.length)}
      </section>

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
          <AdminSectionCard title="Account overview" description="Live Convex account data.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Joined" value={formatAdminDate(liveUser.createdAt)} />
              <Field label="Last login" value={formatAdminDate(liveUser.lastLoginAt)} />
              <Field label="Tier" value={liveUser.tier ?? "free"} />
              <Field label="Admin role" value={liveUser.adminRole ? formatAdminRoleLabel(liveUser.adminRole) : "None"} />
              <Field label="Suspension" value={liveUser.suspendedAt ? formatAdminDate(liveUser.suspendedAt) : "Active"} />
              <Field label="Billing email" value={liveUser.email ?? "—"} />
            </div>
            {liveUser.suspendedReason ? (
              <div className="mt-4 rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4 text-sm text-[color:var(--muted-foreground)]">
                {liveUser.suspendedReason}
              </div>
            ) : null}
          </AdminSectionCard>

          <div className="space-y-6">
            <AdminSectionCard title="Tier and role" description="Persisted through Convex admin mutations.">
              <div className="space-y-3">
                <Select
                  aria-label="User tier"
                  value={tier}
                  onChange={(event) => setTier(event.currentTarget.value as "free" | "pro" | "premium")}
                  options={tierOptions.map((option) => ({ value: option.value, label: option.label }))}
                />
                <Textarea
                  value={tierReason}
                  onChange={(event) => setTierReason(event.currentTarget.value)}
                  placeholder="Reason for tier change"
                  rows={3}
                />
                <Button
                  className="w-full"
                  onClick={() => void handleChangeTier()}
                  isLoading={pendingAction === "tier"}
                  disabled={!canChangeTier}
                >
                  Update tier
                </Button>
              </div>

              <div className="mt-6 space-y-3">
                <Select
                  aria-label="Admin role"
                  value={adminRole}
                  onChange={(event) =>
                    setAdminRole(event.currentTarget.value as "none" | (typeof roleOptions)[number]["value"])
                  }
                  options={roleOptions.map((option) => ({ value: option.value, label: option.label }))}
                />
                <Textarea
                  value={roleReason}
                  onChange={(event) => setRoleReason(event.currentTarget.value)}
                  placeholder="Reason for role change"
                  rows={3}
                />
                <Button
                  className="w-full"
                  onClick={() => void handleSaveRole()}
                  isLoading={pendingAction === "role"}
                  disabled={!canChangeRole}
                >
                  Save role
                </Button>
              </div>
            </AdminSectionCard>

            <AdminSectionCard title="Safety actions" description="Suspend, restore, impersonate, or send a message.">
              <div className="space-y-3">
                <Textarea
                  value={suspendReason}
                  onChange={(event) => setSuspendReason(event.currentTarget.value)}
                  placeholder="Suspension reason"
                  rows={3}
                />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => void handleSuspend()} isLoading={pendingAction === "suspend"} disabled={!canSuspend}>
                    Suspend
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void handleRestore()}
                    isLoading={pendingAction === "restore"}
                    disabled={!canSuspend}
                  >
                    Restore
                  </Button>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Textarea
                  value={impersonationReason}
                  onChange={(event) => setImpersonationReason(event.currentTarget.value)}
                  placeholder="Impersonation reason"
                  rows={3}
                />
                <Button
                  variant="outline"
                  onClick={() => void handleImpersonate()}
                  isLoading={pendingAction === "impersonate"}
                  disabled={!canImpersonate}
                >
                  Start impersonation
                </Button>
              </div>
            </AdminSectionCard>

            <AdminSectionCard title="Dashboard message" description="Send a live message to this user.">
              <div className="space-y-3">
                <Input
                  value={messageTitle}
                  onChange={(event) => setMessageTitle(event.currentTarget.value)}
                  placeholder="Message title"
                />
                <Textarea
                  value={messageBody}
                  onChange={(event) => setMessageBody(event.currentTarget.value)}
                  placeholder="Message body"
                  rows={4}
                />
                <Select
                  aria-label="Message type"
                  value={messageType}
                  onChange={(event) => setMessageType(event.currentTarget.value as (typeof messageTypeOptions)[number]["value"])}
                  options={messageTypeOptions.map((option) => ({ value: option.value, label: option.label }))}
                />
                <Select
                  aria-label="Message priority"
                  value={messagePriority}
                  onChange={(event) =>
                    setMessagePriority(event.currentTarget.value as (typeof messagePriorityOptions)[number]["value"])
                  }
                  options={messagePriorityOptions.map((option) => ({ value: option.value, label: option.label }))}
                />
                <Button className="w-full" onClick={() => void handleSendMessage()} isLoading={pendingAction === "message"}>
                  Send message
                </Button>
              </div>
            </AdminSectionCard>
          </div>
        </div>
      ) : null}

      {tab === "profile" ? (
        <AdminSectionCard
          title="Rider profile"
          description="Derived from the live admin rider data query."
        >
          {profile ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Height" value={`${profile.heightCm} cm`} />
                <Field label="Inseam" value={`${profile.inseamCm} cm`} />
                <Field label="Arm length" value={`${profile.armLengthCm} cm`} />
                <Field label="Torso length" value={`${profile.torsoLengthCm} cm`} />
                <Field label="Shoulder width" value={`${profile.shoulderWidthCm} cm`} />
                <Field label="Flexibility" value={profile.flexibilityScore} />
                <Field label="Core stability" value={`${profile.coreStabilityScore}/5`} />
                <Field label="Updated" value={formatAdminDate(profile.updatedAt)} />
                <Field label="Age" value={profile.age ? `${profile.age}` : "—"} />
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Measurement flags</p>
                {riderData?.measurementFlags.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {riderData.measurementFlags.map((flag) => (
                      <AdminStatusPill key={flag} tone="warning">
                        {flag}
                      </AdminStatusPill>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">No measurement flags.</p>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No rider profile"
              description="Convex returned no rider profile for this user."
            />
          )}
        </AdminSectionCard>
      ) : null}

      {tab === "bikes" ? (
        <AdminSectionCard title="Bikes" description="Live bikes linked to the user.">
          {summaryBikes.length === 0 ? (
            <EmptyState title="No bikes" description="This user has no bike records." />
          ) : (
            <AdminTable>
              <AdminTableHead columns={["Name", "Type", "Geometry", "Created"]} />
              <tbody>
                {summaryBikes.map((bike: Doc<"bikes">) => (
                  <AdminTableRow key={String(bike._id)}>
                    <AdminTableCell className="font-medium">{bike.name}</AdminTableCell>
                    <AdminTableCell>{bike.bikeType}</AdminTableCell>
                    <AdminTableCell>{bike.currentGeometry ? "Linked" : "Not linked"}</AdminTableCell>
                    <AdminTableCell>{formatAdminRelativeDate(bike._creationTime)}</AdminTableCell>
                  </AdminTableRow>
                ))}
              </tbody>
            </AdminTable>
          )}
        </AdminSectionCard>
      ) : null}

      {tab === "fit-history" ? (
        <AdminSectionCard title="Fit history" description="Recent fit sessions and review status.">
          {summaryFitRuns.length === 0 ? (
            <EmptyState title="No fit runs" description="This user has no fit history." />
          ) : (
            <AdminTable>
              <AdminTableHead columns={["Session", "Status", "Review", "Confidence", "Completed"]} />
              <tbody>
                {summaryFitRuns.map((session: Doc<"fitSessions">) => (
                  <AdminTableRow key={String(session._id)}>
                    <AdminTableCell className="font-medium">{String(session._id)}</AdminTableCell>
                    <AdminTableCell>{session.status}</AdminTableCell>
                    <AdminTableCell>{session.reviewStatus ?? "—"}</AdminTableCell>
                    <AdminTableCell>
                      {session.confidenceScore !== undefined ? `${Math.round(session.confidenceScore * 100)}%` : "—"}
                    </AdminTableCell>
                    <AdminTableCell>{formatAdminDate(session.completedAt ?? session.createdAt)}</AdminTableCell>
                  </AdminTableRow>
                ))}
              </tbody>
            </AdminTable>
          )}
        </AdminSectionCard>
      ) : null}

      {tab === "integrations" ? (
        <AdminSectionCard title="Integrations" description="Live integration and sync state.">
          {detail.integration ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Provider" value={detail.integration.provider} />
              <Field label="Status" value={detail.integration.accessStatus} />
              <Field label="Last sync" value={formatAdminDateTime(detail.integration.lastSyncAt)} />
              <Field label="Athlete" value={detail.integration.athleteName ?? "—"} />
              <Field
                label="Ride count"
                value={detail.integration.rideCount !== undefined ? String(detail.integration.rideCount) : "—"}
              />
              <Field
                label="Distance"
                value={
                  detail.integration.totalDistanceKm != null
                    ? `${detail.integration.totalDistanceKm} km`
                    : "—"
                }
              />
              <Field label="Sync error" value={detail.integration.syncErrorMessage ?? "—"} />
            </div>
          ) : (
            <EmptyState title="No integrations" description="This user has no live integration records." />
          )}
        </AdminSectionCard>
      ) : null}

      {tab === "license" ? (
        <AdminSectionCard title="License" description="User subscription records from Convex.">
          {subscriptions.length === 0 ? (
            <EmptyState title="No subscriptions" description="This user has no subscription rows." />
          ) : (
            <AdminTable>
              <AdminTableHead columns={["Plan", "Status", "Starts", "Ends"]} />
              <tbody>
                {subscriptions.map((subscription: Doc<"subscriptions">) => (
                  <AdminTableRow key={String(subscription._id)}>
                    <AdminTableCell className="font-medium">{String(subscription.planId)}</AdminTableCell>
                    <AdminTableCell>{subscription.status}</AdminTableCell>
                    <AdminTableCell>{formatAdminDate(subscription.startsAt)}</AdminTableCell>
                    <AdminTableCell>{formatAdminDate(subscription.endsAt)}</AdminTableCell>
                  </AdminTableRow>
                ))}
              </tbody>
            </AdminTable>
          )}
        </AdminSectionCard>
      ) : null}

      {tab === "feedback" ? (
        <AdminSectionCard title="Feedback" description="Support and product feedback linked to this user.">
          {feedbackItems.length === 0 ? (
            <EmptyState title="No feedback" description="This user has no feedback items." />
          ) : (
            <AdminTable>
              <AdminTableHead columns={["Title", "Type", "Status", "Created"]} />
              <tbody>
                {feedbackItems.map((item: Doc<"feedback_items">) => (
                  <AdminTableRow key={String(item._id)}>
                    <AdminTableCell className="font-medium">{item.title}</AdminTableCell>
                    <AdminTableCell>{item.type}</AdminTableCell>
                    <AdminTableCell>{item.status}</AdminTableCell>
                    <AdminTableCell>{formatAdminDate(item.createdAt)}</AdminTableCell>
                  </AdminTableRow>
                ))}
              </tbody>
            </AdminTable>
          )}
        </AdminSectionCard>
      ) : null}

      {tab === "messages" ? (
        <AdminSectionCard title="Messages" description="Message receipts recorded for this user.">
          {receipts.length === 0 ? (
            <EmptyState title="No messages" description="This user has no message receipts." />
          ) : (
            <AdminTable>
              <AdminTableHead columns={["Message", "Delivered", "Viewed", "Acknowledged", "Dismissed"]} />
              <tbody>
                {receipts.map((receipt: Doc<"message_receipts">) => (
                  <AdminTableRow key={String(receipt._id)}>
                    <AdminTableCell className="font-medium">{String(receipt.messageId)}</AdminTableCell>
                    <AdminTableCell>{formatAdminDate(receipt.deliveredAt)}</AdminTableCell>
                    <AdminTableCell>{formatAdminDate(receipt.viewedAt)}</AdminTableCell>
                    <AdminTableCell>{formatAdminDate(receipt.acknowledgedAt)}</AdminTableCell>
                    <AdminTableCell>{formatAdminDate(receipt.dismissedAt)}</AdminTableCell>
                  </AdminTableRow>
                ))}
              </tbody>
            </AdminTable>
          )}
        </AdminSectionCard>
      ) : null}

      {tab === "audit" ? (
        <AdminSectionCard title="Audit trail" description="Live admin audit log entries for this user.">
          {auditLogs.length === 0 ? (
            <EmptyState title="No audit entries" description="This user has no audit trail entries." />
          ) : (
            <AdminTable>
              <AdminTableHead columns={["Time", "Action", "Reason"]} />
              <tbody>
                {auditLogs.map((entry: Doc<"admin_audit_logs">) => (
                  <AdminTableRow key={String(entry._id)}>
                    <AdminTableCell className="font-medium">{formatAdminDate(entry.occurredAt)}</AdminTableCell>
                    <AdminTableCell>{entry.action}</AdminTableCell>
                    <AdminTableCell>{entry.reason ?? "—"}</AdminTableCell>
                  </AdminTableRow>
                ))}
              </tbody>
            </AdminTable>
          )}
        </AdminSectionCard>
      ) : null}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">{label}</div>
      <div className="mt-2 text-sm leading-6 text-[color:var(--foreground)]">{value}</div>
    </div>
  );
}
