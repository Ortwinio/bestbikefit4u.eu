"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
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
import { formatAdminDate } from "@/components/admin/shared/admin-format";
import {
  displayAdminUserName,
  normalizeAdminOrganizationMemberRow,
} from "@/components/admin/shared/live-admin-data";

type TabKey = "overview" | "members" | "billing" | "audit";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "members", label: "Members" },
  { key: "billing", label: "Billing" },
  { key: "audit", label: "Audit" },
];

const typeOptions = [
  { value: "bike_shop", label: "Bike shop" },
  { value: "enterprise", label: "Enterprise" },
  { value: "fitter_studio", label: "Studio" },
  { value: "brand", label: "Brand" },
] as const;

const roleOptions = [
  { value: "owner", label: "Owner" },
  { value: "staff", label: "Staff" },
  { value: "fitter", label: "Fitter" },
  { value: "viewer", label: "Viewer" },
] as const;

type OrganizationDetailData = {
  organization: Doc<"organizations"> | null;
  members: Doc<"organization_members">[];
  subscriptions: Doc<"subscriptions">[];
  auditLogs: Doc<"admin_audit_logs">[];
};

type MemberRow = Doc<"organization_members"> & {
  user: Pick<Doc<"users">, "displayName" | "name" | "email"> | null;
};

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

function organizationTypeTone(type: string) {
  switch (type) {
    case "enterprise":
      return "success";
    case "fitter_studio":
      return "info";
    case "brand":
      return "warning";
    default:
      return "neutral";
  }
}

export function OrganizationDetailClient({ orgId }: { orgId: string }) {
  const toast = useToast();
  const [tab, setTab] = useState<TabKey>("overview");
  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof typeOptions)[number]["value"]>("bike_shop");
  const [maxSeats, setMaxSeats] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [memberUserId, setMemberUserId] = useState("");
  const [memberRole, setMemberRole] = useState<(typeof roleOptions)[number]["value"]>("staff");
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const resolvedOrgId = orgId as Id<"organizations">;
  const detail = useQuery(api.admin.queries.getOrganizationDetail, { orgId: resolvedOrgId }) as
    | OrganizationDetailData
    | undefined;
  const orgMembers = useQuery(api.admin.queries.listOrgMembers, { orgId: resolvedOrgId }) as
    | MemberRow[]
    | undefined;
  const updateOrganization = useMutation(api.admin.mutations.updateOrganization);
  const suspendOrganization = useMutation(api.admin.mutations.suspendOrganization);
  const addOrgMember = useMutation(api.admin.mutations.addOrgMember);
  const removeOrgMember = useMutation(api.admin.mutations.removeOrgMember);

  useEffect(() => {
    if (!detail?.organization) {
      return;
    }

    setName(detail.organization.name);
    setType(detail.organization.type);
    setMaxSeats(detail.organization.maxSeats?.toString() ?? "");
    setBillingEmail(detail.organization.billingEmail ?? "");
    setNotes(detail.organization.notes ?? "");
  }, [
    detail?.organization?._id,
    detail?.organization?.name,
    detail?.organization?.type,
    detail?.organization?.maxSeats,
    detail?.organization?.billingEmail,
    detail?.organization?.notes,
  ]);

  if (detail === undefined || orgMembers === undefined) {
    return <LoadingState label="Loading organization..." />;
  }

  const organization = detail.organization;
  if (!organization) {
    return (
      <EmptyState
        title="Organization not found"
        description="Convex returned no live organization record for this route."
        action={
          <Button render={<Link href="/admin/organizations" />} variant="outline">
            Back to organizations
          </Button>
        }
      />
    );
  }

  const members = orgMembers
    .map(normalizeAdminOrganizationMemberRow)
    .filter((member) => member.removedAt === null);
  const subscriptions = detail.subscriptions ?? [];
  const auditLogs = detail.auditLogs ?? [];
  const ownerMember = orgMembers.find((member) => member.role === "owner") ?? orgMembers[0] ?? null;
  const liveSeatsUsed = organization.usedSeats ?? members.length;

  const runMutation = async (
    action: string,
    handler: () => Promise<void>,
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

  const handleUpdateOrganization = async () => {
    const parsedMaxSeats = maxSeats.trim() ? Number(maxSeats) : undefined;
    if (parsedMaxSeats !== undefined && Number.isNaN(parsedMaxSeats)) {
      toast.error({ description: "Max seats must be a number." });
      return;
    }

    await runMutation(
      "update",
      async () => {
        await updateOrganization({
          orgId: resolvedOrgId,
          name: name.trim() || organization.name,
          type,
          maxSeats: parsedMaxSeats,
          billingEmail: billingEmail.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      },
      "Organization updated."
    );
  };

  const handleSuspendOrganization = async () => {
    await runMutation(
      "suspend",
      async () => {
        await suspendOrganization({
          orgId: resolvedOrgId,
          reason: "Admin suspension",
        });
      },
      "Organization suspended."
    );
  };

  const handleAddMember = async () => {
    if (!memberUserId.trim()) {
      toast.error({ description: "User ID is required." });
      return;
    }

    await runMutation(
      "member-add",
      async () => {
        await addOrgMember({
          organizationId: resolvedOrgId,
          userId: memberUserId as Id<"users">,
          role: memberRole,
        });
      },
      "Organization member added."
    );
  };

  const handleRemoveMember = async (memberId: Id<"organization_members">) => {
    await runMutation(
      `remove-${String(memberId)}`,
      async () => {
        await removeOrgMember({ memberId });
      },
      "Organization member removed."
    );
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Command center"
        title={organization.name}
        description={organization.billingEmail ?? organization.slug}
        actions={
          <Button render={<Link href="/admin/organizations" />} variant="outline">
            Back to organizations
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <AdminStatusPill tone={organizationTypeTone(organization.type)}>
          {organization.type.replaceAll("_", " ")}
        </AdminStatusPill>
        <AdminStatusPill tone={organization.suspendedAt ? "warning" : "success"}>
          {organization.suspendedAt ? "Suspended" : "Active"}
        </AdminStatusPill>
        <AdminStatusPill tone="info">{members.length} members</AdminStatusPill>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {liveStat("Members", members.length)}
        {liveStat("Seats", `${liveSeatsUsed} / ${organization.maxSeats ?? "—"}`)}
        {liveStat("Subscriptions", subscriptions.length)}
      </section>

      <SegmentedControl
        aria-label="Organization detail tabs"
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
          <AdminSectionCard title="Organization overview" description="Live organization record from Convex.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Owner"
                value={ownerMember?.user ? displayAdminUserName(ownerMember.user) : "—"}
              />
              <Field label="Plan" value={organization.planId ? String(organization.planId) : "—"} />
              <Field label="Billing email" value={organization.billingEmail ?? "—"} />
              <Field label="Slug" value={organization.slug} />
              <Field label="Created" value={formatAdminDate(organization.createdAt)} />
              <Field label="Updated" value={formatAdminDate(organization.updatedAt)} />
            </div>
            {organization.notes ? (
              <div className="mt-4 rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4 text-sm leading-6 text-[color:var(--muted-foreground)]">
                {organization.notes}
              </div>
            ) : null}
            {organization.suspendedAt ? (
              <div className="mt-4 rounded-[var(--radius-lg)] border border-[color:color-mix(in_oklch,var(--warning)_24%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_8%,var(--card))] p-4 text-sm">
                <div className="font-medium text-[color:var(--foreground)]">Suspended</div>
                <div className="mt-1 text-[color:var(--muted-foreground)]">{organization.suspendedReason ?? "No reason recorded"}</div>
                <div className="mt-1 text-xs text-[color:var(--muted-foreground)]">{formatAdminDate(organization.suspendedAt)}</div>
              </div>
            ) : null}
          </AdminSectionCard>

          <div className="space-y-6">
            <AdminSectionCard title="Update organization" description="Persisted through Convex admin mutations.">
              <div className="space-y-3">
                <Input value={name} onChange={(event) => setName(event.currentTarget.value)} placeholder="Organization name" />
                <Select
                  aria-label="Organization type"
                  value={type}
                  onChange={(event) => setType(event.currentTarget.value as (typeof typeOptions)[number]["value"])}
                  options={typeOptions.map((option) => ({ value: option.value, label: option.label }))}
                />
                <Input
                  value={maxSeats}
                  onChange={(event) => setMaxSeats(event.currentTarget.value)}
                  placeholder="Max seats"
                />
                <Input
                  value={billingEmail}
                  onChange={(event) => setBillingEmail(event.currentTarget.value)}
                  placeholder="Billing email"
                />
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.currentTarget.value)}
                  placeholder="Notes"
                  rows={3}
                />
                <Button className="w-full" onClick={() => void handleUpdateOrganization()} isLoading={pendingAction === "update"}>
                  Save changes
                </Button>
              </div>
            </AdminSectionCard>

            <AdminSectionCard title="Organization actions" description="Suspend this organization or add a new member.">
              <div className="space-y-3">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => void handleSuspendOrganization()}
                  isLoading={pendingAction === "suspend"}
                >
                  Suspend organization
                </Button>
                <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4 text-sm text-[color:var(--muted-foreground)]">
                  Organization restore is not exposed by the current backend mutation set.
                </div>
              </div>
            </AdminSectionCard>
          </div>
        </div>
      ) : null}

      {tab === "members" ? (
        <div className="space-y-6">
          <AdminSectionCard title="Add member" description="Use a live Convex user ID and assign a role.">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto]">
              <Input
                value={memberUserId}
                onChange={(event) => setMemberUserId(event.currentTarget.value)}
                placeholder="User ID"
              />
              <Select
                aria-label="Member role"
                value={memberRole}
                onChange={(event) => setMemberRole(event.currentTarget.value as (typeof roleOptions)[number]["value"])}
                options={roleOptions.map((option) => ({ value: option.value, label: option.label }))}
              />
              <Button onClick={() => void handleAddMember()} isLoading={pendingAction === "member-add"}>
                Add member
              </Button>
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Members" description="Live membership rows from Convex.">
            {members.length === 0 ? (
              <EmptyState title="No members" description="This organization has no live membership rows." />
            ) : (
              <AdminTable>
                <AdminTableHead columns={["Name", "Email", "Role", "Joined", "Action"]} />
                <tbody>
                  {members.map((member) => (
                    <AdminTableRow key={member.id}>
                      <AdminTableCell className="font-medium">{member.name}</AdminTableCell>
                      <AdminTableCell>{member.email}</AdminTableCell>
                      <AdminTableCell>
                        <AdminStatusPill tone={member.role === "owner" ? "success" : "neutral"}>
                          {member.role}
                        </AdminStatusPill>
                      </AdminTableCell>
                      <AdminTableCell>{formatAdminDate(member.joinedAt)}</AdminTableCell>
                      <AdminTableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void handleRemoveMember(member.id as Id<"organization_members">)}
                          isLoading={pendingAction === `remove-${member.id}`}
                        >
                          Remove
                        </Button>
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </tbody>
              </AdminTable>
            )}
          </AdminSectionCard>
        </div>
      ) : null}

      {tab === "billing" ? (
        <AdminSectionCard title="Billing" description="Current subscription rows linked to this organization.">
          {subscriptions.length === 0 ? (
            <EmptyState title="No subscriptions" description="This organization has no subscription rows." />
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

      {tab === "audit" ? (
        <AdminSectionCard title="Audit trail" description="Live admin audit entries for this organization.">
          {auditLogs.length === 0 ? (
            <EmptyState title="No audit entries" description="This organization has no audit trail entries." />
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
