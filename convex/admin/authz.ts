import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export type AdminRole =
  | "super_admin"
  | "ops_admin"
  | "support_admin"
  | "fit_specialist"
  | "geometry_manager"
  | "billing_admin"
  | "qa_manager"
  | "analyst";

type DbCtx = QueryCtx | MutationCtx;

export function isValidAdminRole(role: string): role is AdminRole {
  return [
    "super_admin",
    "ops_admin",
    "support_admin",
    "fit_specialist",
    "geometry_manager",
    "billing_admin",
    "qa_manager",
    "analyst",
  ].includes(role);
}

export async function requireAdminUserId(ctx: DbCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db.get(userId);
  if (!user?.adminRole) {
    throw new Error("Not authorized: admin role required");
  }

  return userId;
}

export async function requireAdminRole(
  ctx: DbCtx,
  requiredRole: AdminRole
): Promise<Id<"users">> {
  const userId = await requireAdminUserId(ctx);
  const user = await ctx.db.get(userId);

  if (!user?.adminRole) {
    throw new Error("Not authorized: admin role required");
  }

  if (user.adminRole !== "super_admin" && user.adminRole !== requiredRole) {
    throw new Error(`Not authorized: requires ${requiredRole}`);
  }

  return userId;
}

export async function requireAnyRole(
  ctx: DbCtx,
  roles: AdminRole[]
): Promise<Id<"users">> {
  const userId = await requireAdminUserId(ctx);
  const user = await ctx.db.get(userId);

  if (!user?.adminRole) {
    throw new Error("Not authorized: admin role required");
  }

  if (user.adminRole !== "super_admin" && !roles.includes(user.adminRole)) {
    throw new Error(`Not authorized: requires one of [${roles.join(", ")}]`);
  }

  return userId;
}
