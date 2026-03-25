import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

const LOCALHOST_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const LOCAL_DEV_ADMIN_ROLES = new Set([
  "super_admin",
  "ops_admin",
  "support_admin",
  "fit_specialist",
  "geometry_manager",
  "billing_admin",
  "qa_manager",
  "analyst",
] as const);

export function isProductionEnvironment() {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

export function isAllowedLocalhostHost(hostname: string) {
  return LOCALHOST_HOSTS.has(hostname.trim().toLowerCase());
}

export function normalizeLocalDevEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeLocalDevName(name: string, email: string) {
  const trimmed = name.trim();
  if (trimmed.length > 0) {
    return trimmed;
  }

  const localPart = email.split("@")[0]?.trim();
  return localPart && localPart.length > 0 ? localPart : "Local Admin";
}

export function normalizeLocalDevRole(role: string) {
  const normalized = role.trim() as
    | "super_admin"
    | "ops_admin"
    | "support_admin"
    | "fit_specialist"
    | "geometry_manager"
    | "billing_admin"
    | "qa_manager"
    | "analyst";

  if (!LOCAL_DEV_ADMIN_ROLES.has(normalized)) {
    throw new Error("Invalid LOCALHOST_DEV_LOGIN_ROLE.");
  }

  return normalized;
}

type LocalDevUserRecord = {
  _id: string;
  adminRole?: string;
  lastLoginAt?: number;
  createdAt?: number;
  _creationTime?: number;
};

export function pickPreferredLocalDevUser<T extends LocalDevUserRecord>(users: T[]) {
  if (users.length === 0) {
    return null;
  }

  return [...users].sort((left, right) => {
    const leftAdmin = left.adminRole ? 1 : 0;
    const rightAdmin = right.adminRole ? 1 : 0;
    if (leftAdmin !== rightAdmin) {
      return rightAdmin - leftAdmin;
    }

    const leftLastLogin = left.lastLoginAt ?? 0;
    const rightLastLogin = right.lastLoginAt ?? 0;
    if (leftLastLogin !== rightLastLogin) {
      return rightLastLogin - leftLastLogin;
    }

    const leftCreated = left.createdAt ?? left._creationTime ?? 0;
    const rightCreated = right.createdAt ?? right._creationTime ?? 0;
    return rightCreated - leftCreated;
  })[0];
}

export const ensureLocalDevUser = internalMutation({
  args: {
    email: v.string(),
    name: v.string(),
    adminRole: v.union(
      v.literal("super_admin"),
      v.literal("ops_admin"),
      v.literal("support_admin"),
      v.literal("fit_specialist"),
      v.literal("geometry_manager"),
      v.literal("billing_admin"),
      v.literal("qa_manager"),
      v.literal("analyst")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const email = normalizeLocalDevEmail(args.email);
    const name = normalizeLocalDevName(args.name, email);

    const existingUsers = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .collect();
    const existingUser = pickPreferredLocalDevUser(existingUsers);

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email,
        name,
        displayName: existingUser.displayName ?? name,
        displayNameSource: existingUser.displayNameSource ?? "manual",
        lastLoginAt: now,
        createdAt: existingUser.createdAt ?? now,
        adminRole: args.adminRole,
      });
      return { userId: existingUser._id };
    }

    const userId = await ctx.db.insert("users", {
      email,
      name,
      displayName: name,
      displayNameSource: "manual",
      createdAt: now,
      lastLoginAt: now,
      adminRole: args.adminRole,
      theme_preference: "system",
      unit_preference: "metric",
    });

    return { userId };
  },
});
