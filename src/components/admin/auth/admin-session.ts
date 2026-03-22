import "server-only";

import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import {
  isAdminRole,
  type AdminSessionUser,
} from "./admin-auth-shared";

type CurrentUserRecord = {
  _id: string;
  email?: string | null;
  name?: string | null;
  adminRole?: unknown;
} | null;

export async function getCurrentAdminSession(): Promise<AdminSessionUser | null> {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return null;
  }

  const user = (await fetchQuery(api.users.queries.getCurrentUser, {}, { token })) as CurrentUserRecord;
  if (!user || !user.adminRole || !isAdminRole(user.adminRole)) {
    return null;
  }

  return {
    userId: String(user._id),
    email: user.email ?? "",
    name: user.name ?? user.email ?? "Admin",
    adminRole: user.adminRole,
  };
}

export async function requireAdminSession(
  redirectTo = "/admin/login"
): Promise<AdminSessionUser> {
  const session = await getCurrentAdminSession();
  if (!session) {
    redirect(redirectTo);
  }

  return session as AdminSessionUser;
}

export { isAdminRole } from "./admin-auth-shared";
export type { AdminRole, AdminSessionUser } from "./admin-auth-shared";
