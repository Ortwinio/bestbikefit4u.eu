import type { AdminRole } from "./admin-auth-shared";

const ANY_ADMIN = "any_admin" as const;

type AdminRouteAccess =
  | readonly [typeof ANY_ADMIN]
  | readonly AdminRole[];

type AdminRouteRule = {
  prefix: string;
  access: AdminRouteAccess;
};

const adminRouteRules: AdminRouteRule[] = [
  { prefix: "/admin/overview", access: [ANY_ADMIN] },
  {
    prefix: "/admin/users",
    access: ["super_admin", "ops_admin", "support_admin", "analyst"],
  },
  {
    prefix: "/admin/organizations",
    access: ["super_admin", "ops_admin", "support_admin", "analyst"],
  },
  {
    prefix: "/admin/rider-data",
    access: ["super_admin", "fit_specialist", "support_admin", "analyst"],
  },
  {
    prefix: "/admin/bikes",
    access: ["super_admin", "fit_specialist", "geometry_manager", "analyst"],
  },
  {
    prefix: "/admin/geometry",
    access: ["super_admin", "geometry_manager", "fit_specialist", "analyst"],
  },
  {
    prefix: "/admin/fit-engine",
    access: ["super_admin", "qa_manager", "fit_specialist", "analyst"],
  },
  {
    prefix: "/admin/fit-runs",
    access: ["super_admin", "fit_specialist", "support_admin", "analyst"],
  },
  {
    prefix: "/admin/feedback",
    access: ["super_admin", "ops_admin", "support_admin", "qa_manager", "analyst"],
  },
  {
    prefix: "/admin/releases",
    access: ["super_admin", "qa_manager", "ops_admin", "analyst"],
  },
  {
    prefix: "/admin/licenses",
    access: ["super_admin", "billing_admin", "ops_admin", "analyst"],
  },
  {
    prefix: "/admin/subscriptions",
    access: ["super_admin", "billing_admin", "ops_admin", "analyst"],
  },
  {
    prefix: "/admin/messages",
    access: ["super_admin", "ops_admin", "support_admin", "analyst"],
  },
  {
    prefix: "/admin/audit",
    access: [ANY_ADMIN],
  },
  {
    prefix: "/admin/settings",
    access: ["super_admin", "ops_admin"],
  },
];

export function getRequiredAdminRoles(pathname: string): AdminRouteAccess {
  const normalizedPathname = pathname.split("?")[0] ?? pathname;

  for (const rule of adminRouteRules) {
    if (
      normalizedPathname === rule.prefix ||
      normalizedPathname.startsWith(`${rule.prefix}/`)
    ) {
      return rule.access;
    }
  }

  return [ANY_ADMIN];
}

export function canAccessAdminRoute(pathname: string, role: AdminRole) {
  if (role === "super_admin") {
    return true;
  }

  const access = getRequiredAdminRoles(pathname);
  if (access[0] === ANY_ADMIN) {
    return true;
  }

  return (access as readonly AdminRole[]).includes(role);
}
