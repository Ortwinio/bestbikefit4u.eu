"use client";

import { useState } from "react";
import Link from "next/link";
import { AccessibleDialog, Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SegmentedControl, SegmentedControlItem, Textarea } from "@/components/ui";
import { cn } from "@/utils/cn";
import type { AdminOrganizationDetail, AdminOrganizationType } from "./admin-organizations-data";

type TabKey = "overview" | "members" | "billing" | "audit";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "members", label: "Members" },
  { key: "billing", label: "Billing" },
  { key: "audit", label: "Audit Trail" },
];

const typeOptions = [
  { value: "bike_shop", label: "bike shop" },
  { value: "enterprise", label: "enterprise" },
  { value: "fitter_studio", label: "fitter studio" },
  { value: "brand", label: "brand" },
] as const;

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

function badgeClassName(kind: "muted" | "success" | "warning" | "admin") {
  switch (kind) {
    case "success":
      return "border border-[color:color-mix(in_oklch,var(--success)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--success)_10%,var(--card))]";
    case "warning":
      return "border border-[color:color-mix(in_oklch,var(--warning)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--card))]";
    case "admin":
      return "border border-[color:color-mix(in_oklch,var(--primary)_24%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_10%,var(--card))]";
    case "muted":
    default:
      return "border border-[color:var(--border)] bg-[color:var(--secondary)]";
  }
}

function badge({ children, kind = "muted" }: { children: string; kind?: "muted" | "success" | "warning" | "admin" }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize text-[color:var(--foreground)]", badgeClassName(kind))}>
      {children}
    </span>
  );
}

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">{value}</div>
    </div>
  );
}

export function OrganizationDetailClient({ organization }: { organization: AdminOrganizationDetail }) {
  const [tab, setTab] = useState<TabKey>("overview");
  const [notice, setNotice] = useState<string | null>(null);
  const [name, setName] = useState(organization.row.name);
  const [type, setType] = useState<AdminOrganizationType>(organization.row.type);
  const [maxSeats, setMaxSeats] = useState(String(organization.row.maxSeats));
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("staff");
  const [memberReason, setMemberReason] = useState("");
  const [editReason, setEditReason] = useState("");

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">Admin / Users & Accounts</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">{organization.row.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {badge({ children: organization.row.type.replaceAll("_", " ") })}
            {organization.row.suspended ? badge({ children: "Suspended", kind: "warning" }) : badge({ children: "Active", kind: "success" })}
          </div>
          <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{organization.row.ownerEmail}</p>
        </div>
        <Button render={<Link href="./" />} variant="outline">
          Back to organizations
        </Button>
      </div>

      {notice ? (
        <div className="rounded-[var(--radius-lg)] border border-[color:color-mix(in_oklch,var(--primary)_24%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_8%,var(--card))] p-4 text-sm text-[color:var(--foreground)]">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryStat label="Seats" value={`${organization.row.seatsUsed} / ${organization.row.maxSeats}`} />
        <SummaryStat label="Members" value={organization.members.length} />
        <SummaryStat label="Created" value={formatDate(organization.row.createdAt)} />
      </div>

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
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Organization overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileField label="Owner" value={organization.overview.ownerName} />
                <ProfileField label="Plan" value={organization.overview.plan} />
                <ProfileField label="Billing email" value={organization.row.billingEmail} />
                <ProfileField label="Seat usage" value={`${organization.row.seatsUsed} / ${organization.row.maxSeats}`} />
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4 text-sm leading-6 text-[color:var(--muted-foreground)]">
                {organization.overview.notes}
              </div>
              {organization.overview.suspension ? (
                <div className="rounded-[var(--radius-lg)] border border-[color:color-mix(in_oklch,var(--warning)_24%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_8%,var(--card))] p-4 text-sm">
                  <div className="font-medium text-[color:var(--foreground)]">Suspended</div>
                  <div className="mt-1 text-[color:var(--muted-foreground)]">{organization.overview.suspension.reason}</div>
                  <div className="mt-1 text-xs text-[color:var(--muted-foreground)]">{formatDate(organization.overview.suspension.at)}</div>
                </div>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-3">
                <Button type="button" variant="outline" onClick={() => setNotice("Planned mutation: `updateOrganization`.")}>
                  Edit details
                </Button>
                <Button type="button" variant="outline" onClick={() => setNotice("Planned mutation: `suspendOrganization`.")}>
                  Suspend / restore
                </Button>
                <Button type="button" variant="outline" onClick={() => setAddMemberOpen(true)}>
                  Add member
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input value={name} onChange={(event) => setName(event.currentTarget.value)} placeholder="Organization name" />
                <Select
                  aria-label="Organization type"
                  value={type}
                  onChange={(event) => setType(event.currentTarget.value as AdminOrganizationType)}
                  options={typeOptions.map((option) => ({ value: option.value, label: option.label }))}
                />
                <Input value={maxSeats} onChange={(event) => setMaxSeats(event.currentTarget.value)} placeholder="Max seats" />
                <Textarea value={editReason} onChange={(event) => setEditReason(event.currentTarget.value)} placeholder="Reason for this update" rows={3} />
                <Button type="button" className="w-full" onClick={() => setNotice("Planned mutation: `updateOrganization`.")}>
                  Save changes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === "members" ? (
        <Card>
          <CardHeader className="flex items-center justify-between gap-4">
            <CardTitle>Members</CardTitle>
            <Button type="button" onClick={() => setAddMemberOpen(true)}>
              Add member
            </Button>
          </CardHeader>
          <CardContent>
            <table className="min-w-full divide-y divide-[color:var(--border)] text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
                <tr>
                  <th className="py-3 pr-4">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {organization.members.map((member) => (
                  <tr key={member.id}>
                    <td className="py-3 pr-4 font-medium text-[color:var(--foreground)]">{member.name}</td>
                    <td className="px-4 py-3 text-[color:var(--foreground)]">{member.email}</td>
                    <td className="px-4 py-3">{badge({ children: member.role, kind: member.role === "owner" ? "admin" : "muted" })}</td>
                    <td className="px-4 py-3 text-[color:var(--muted-foreground)]">{formatDate(member.joinedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button type="button" variant="outline" size="sm" onClick={() => setNotice("Planned mutation: `removeOrgMember`.")}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      {tab === "billing" ? (
        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {organization.billing.map((item) => (
              <div key={item.item} className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">{item.item}</div>
                <div className="mt-2 text-sm text-[color:var(--foreground)]">{item.value}</div>
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
            {organization.auditTrail.map((entry) => (
              <div key={`${entry.action}-${entry.time}`} className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
                <div className="flex items-center justify-between gap-2">
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
        open={addMemberOpen}
        title="Add member"
        description="Search for a user and assign an organization role."
        onClose={() => setAddMemberOpen(false)}
      >
        <div className="space-y-4">
          <Input value={memberEmail} onChange={(event) => setMemberEmail(event.currentTarget.value)} placeholder="User email" />
          <Select
            aria-label="Member role"
            value={memberRole}
            onChange={(event) => setMemberRole(event.currentTarget.value)}
            options={[
              { value: "owner", label: "owner" },
              { value: "staff", label: "staff" },
              { value: "fitter", label: "fitter" },
              { value: "viewer", label: "viewer" },
            ]}
          />
          <Textarea value={memberReason} onChange={(event) => setMemberReason(event.currentTarget.value)} placeholder="Reason for access change" rows={3} />
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              setAddMemberOpen(false);
              setNotice("Planned mutation: `addOrgMember`.");
            }}
          >
            Add member
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
