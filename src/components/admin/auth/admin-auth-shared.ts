export const ADMIN_ROLES = [
  "super_admin",
  "ops_admin",
  "support_admin",
  "fit_specialist",
  "geometry_manager",
  "billing_admin",
  "qa_manager",
  "analyst",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export type AdminSessionUser = {
  userId: string;
  email: string;
  name: string;
  adminRole: AdminRole;
};

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === "string" && ADMIN_ROLES.includes(value as AdminRole);
}

export function formatAdminRoleLabel(role: AdminRole) {
  return role.replaceAll("_", " ");
}
