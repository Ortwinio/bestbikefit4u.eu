import type { Doc } from "../../../../convex/_generated/dataModel";
import type { AdminRole } from "../auth/admin-auth-shared";

export function displayAdminUserName(
  user: Pick<Doc<"users">, "displayName" | "name" | "email">
) {
  return user.displayName ?? user.name ?? user.email ?? "Unnamed user";
}

export function formatAdminDate(value?: number | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatAdminRelativeDate(value?: number | null) {
  if (!value) {
    return "—";
  }

  const diffDays = Math.round((Date.now() - value) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const months = Math.round(diffDays / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

export function normalizeAdminUserRow(user: Doc<"users">) {
  return {
    id: String(user._id),
    name: displayAdminUserName(user),
    email: user.email ?? "—",
    tier: user.tier ?? null,
    adminRole: (user.adminRole ?? null) as AdminRole | null,
    suspendedAt: user.suspendedAt ?? null,
    lastLoginAt: user.lastLoginAt ?? null,
    createdAt: user.createdAt ?? null,
  };
}

export function normalizeAdminOrganizationRow(organization: Doc<"organizations">) {
  return {
    id: String(organization._id),
    name: organization.name,
    type: organization.type,
    ownerUserId: String(organization.ownerUserId),
    maxSeats: organization.maxSeats ?? 0,
    usedSeats: organization.usedSeats ?? 0,
    suspendedAt: organization.suspendedAt ?? null,
    billingEmail: organization.billingEmail ?? "—",
    createdAt: organization.createdAt,
  };
}

export function normalizeAdminOrganizationMemberRow(
  member: Doc<"organization_members"> & {
    user?: Pick<Doc<"users">, "displayName" | "name" | "email"> | null;
  }
) {
  return {
    id: String(member._id),
    organizationId: String(member.organizationId),
    userId: String(member.userId),
    name: displayAdminUserName(
      member.user ?? { displayName: undefined, name: undefined, email: "Unknown" }
    ),
    email: member.user?.email ?? "—",
    role: member.role,
    joinedAt: member.joinedAt,
    removedAt: member.removedAt ?? null,
  };
}
