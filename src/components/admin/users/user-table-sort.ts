import { formatAdminRoleLabel, type AdminRole } from "../auth/admin-auth-shared";
import { displayAdminUserName } from "../shared/live-admin-data";

export type LiveAdminUserRow = {
  id: string;
  name: string;
  email: string;
  tier: string | null;
  adminRole: AdminRole | null;
  suspendedAt: number | null;
  lastLoginAt: number | null;
  createdAt: number | null;
};

export type UserSortKey =
  | "name"
  | "email"
  | "tier"
  | "adminRole"
  | "suspension"
  | "createdAt"
  | "lastLoginAt";

export type UserSortDirection = "asc" | "desc";

export function getDefaultUserSortDirection(sortKey: UserSortKey): UserSortDirection {
  switch (sortKey) {
    case "createdAt":
    case "lastLoginAt":
      return "desc";
    default:
      return "asc";
  }
}

function compareText(left: string | null | undefined, right: string | null | undefined) {
  return (left ?? "").localeCompare(right ?? "", undefined, { sensitivity: "base" });
}

function compareNumber(left: number | null | undefined, right: number | null | undefined) {
  const leftValue = left ?? Number.NEGATIVE_INFINITY;
  const rightValue = right ?? Number.NEGATIVE_INFINITY;
  return leftValue - rightValue;
}

function compareSuspension(left: LiveAdminUserRow, right: LiveAdminUserRow) {
  const leftSuspended = left.suspendedAt ? 1 : 0;
  const rightSuspended = right.suspendedAt ? 1 : 0;
  if (leftSuspended !== rightSuspended) {
    return leftSuspended - rightSuspended;
  }
  return compareNumber(left.suspendedAt, right.suspendedAt);
}

function compareUsers(left: LiveAdminUserRow, right: LiveAdminUserRow, sortKey: UserSortKey) {
  switch (sortKey) {
    case "name":
      return compareText(displayAdminUserName(left), displayAdminUserName(right));
    case "email":
      return compareText(left.email, right.email);
    case "tier":
      return compareText(left.tier, right.tier);
    case "adminRole":
      return compareText(
        left.adminRole ? formatAdminRoleLabel(left.adminRole) : "",
        right.adminRole ? formatAdminRoleLabel(right.adminRole) : ""
      );
    case "suspension":
      return compareSuspension(left, right);
    case "createdAt":
      return compareNumber(left.createdAt, right.createdAt);
    case "lastLoginAt":
      return compareNumber(left.lastLoginAt, right.lastLoginAt);
    default:
      return 0;
  }
}

export function sortAdminUsers(
  users: LiveAdminUserRow[],
  sortKey: UserSortKey,
  sortDirection: UserSortDirection
) {
  const direction = sortDirection === "asc" ? 1 : -1;

  return [...users].sort((left, right) => {
    const result = compareUsers(left, right, sortKey);
    if (result !== 0) {
      return result * direction;
    }

    return compareText(left.name, right.name);
  });
}
