import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { writeAuditLog } from "./audit";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const getBootstrapStatus = query({
  args: {},
  handler: async (ctx) => {
    const adminUsers = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("adminRole"), undefined))
      .collect();

    return {
      hasBootstrapSecret: Boolean(process.env.ADMIN_BOOTSTRAP_SECRET),
      adminCount: adminUsers.length,
      canBootstrap: adminUsers.length === 0 && Boolean(process.env.ADMIN_BOOTSTRAP_SECRET),
    };
  },
});

export const bootstrapFirstAdmin = mutation({
  args: {
    email: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { email, secret }) => {
    const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
    if (!expectedSecret) {
      throw new Error("Admin bootstrap is not configured.");
    }

    if (secret !== expectedSecret) {
      throw new Error("Invalid bootstrap secret.");
    }

    const adminUsers = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("adminRole"), undefined))
      .collect();

    if (adminUsers.length > 0) {
      throw new Error("Admin bootstrap is no longer available.");
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", normalizedEmail))
      .unique();

    if (!user) {
      throw new Error("No production user found for that email. Sign in once first.");
    }

    await ctx.db.patch(user._id, { adminRole: "super_admin" });
    await writeAuditLog(ctx, {
      adminUserId: user._id,
      action: "admin.bootstrap_first_admin",
      targetType: "user",
      targetId: user._id,
      payload: {
        email: normalizedEmail,
        assignedRole: "super_admin",
      },
      reason: "Initial admin bootstrap",
    });

    return {
      userId: user._id,
      email: user.email ?? normalizedEmail,
      adminRole: "super_admin" as const,
    };
  },
});
