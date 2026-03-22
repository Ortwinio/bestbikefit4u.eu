export type AdminRole =
  | "super_admin"
  | "ops_admin"
  | "support_admin"
  | "fit_specialist"
  | "geometry_manager"
  | "billing_admin"
  | "qa_manager"
  | "analyst";

export const ADMIN_ROLE_OPTIONS: Array<{ value: AdminRole | "none"; label: string }> = [
  { value: "none", label: "No admin role" },
  { value: "super_admin", label: "super_admin" },
  { value: "ops_admin", label: "ops_admin" },
  { value: "support_admin", label: "support_admin" },
  { value: "fit_specialist", label: "fit_specialist" },
  { value: "geometry_manager", label: "geometry_manager" },
  { value: "billing_admin", label: "billing_admin" },
  { value: "qa_manager", label: "qa_manager" },
  { value: "analyst", label: "analyst" },
];

export const ADMIN_ROLE_TONE: Record<AdminRole, "neutral" | "success" | "warning" | "danger" | "info"> = {
  super_admin: "danger",
  ops_admin: "warning",
  support_admin: "info",
  fit_specialist: "success",
  geometry_manager: "success",
  billing_admin: "warning",
  qa_manager: "success",
  analyst: "neutral",
};

export const FEATURE_FLAG_ROLES = new Set(["super_admin", "ops_admin", "billing_admin"] as const);
export const PLAN_MANAGEMENT_ROLES = new Set(["super_admin", "billing_admin"] as const);
export const ROLE_MANAGEMENT_ROLES = new Set(["super_admin"] as const);

export function formatAdminDateTime(value?: number | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatAdminRoleLabel(role?: string | null) {
  return role ? role.replaceAll("_", " ") : "No admin role";
}

export function formatPlanPrice(priceCents?: number | null) {
  if (priceCents === null || priceCents === undefined) {
    return "Free";
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(priceCents / 100);
}

export function formatPlanInterval(interval?: string | null) {
  if (!interval) {
    return "—";
  }

  if (interval === "custom") {
    return "custom";
  }

  return interval;
}

export function isAllowedRole(
  role: string | undefined | null,
  allowed: ReadonlySet<string>
) {
  return Boolean(role && allowed.has(role));
}

export function getAdminRoleTone(role?: string | null) {
  if (!role) return "neutral";
  return (ADMIN_ROLE_TONE[role as AdminRole] ?? "neutral") as
    | "neutral"
    | "success"
    | "warning"
    | "danger"
    | "info";
}
