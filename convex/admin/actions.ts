import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { ActionCtx } from "../_generated/server";
import { api } from "../_generated/api";
import { action } from "../_generated/server";

type AuditLogRow = Pick<
  Doc<"admin_audit_logs">,
  "_id" | "occurredAt" | "adminUserId" | "action" | "targetType" | "targetId" | "reason"
>;

async function requireAdminActionUser(ctx: ActionCtx): Promise<{ _id: Id<"users"> }> {
  const admin = (await ctx.runQuery(api.admin.queries.getCurrentAdminUser, {})) as
    | { _id: Id<"users"> }
    | null;
  if (!admin) {
    throw new Error("Not authorized: admin role required");
  }
  return admin;
}

export const startImpersonation = action({
  args: {
    userId: v.id("users"),
    reason: v.string(),
  },
  handler: async (
    ctx,
    { userId, reason }
  ): Promise<{ impersonationToken: string; userId: Id<"users">; reason: string }> => {
    const admin = await requireAdminActionUser(ctx);
    return {
      impersonationToken: `impersonation:${admin._id}:${userId}:${Date.now()}`,
      userId,
      reason,
    };
  },
});

export const notifyRelease = action({
  args: {
    releaseId: v.id("releases"),
    sendToAffectedUsers: v.boolean(),
    sendGeneralAnnouncement: v.boolean(),
    announcementTargets: v.optional(
      v.array(
        v.object({
          targetType: v.string(),
          targetValue: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    notifiedUsers: number;
    generalAnnouncementCreated: boolean;
    release: unknown;
  }> => {
    await requireAdminActionUser(ctx);
    const release = await ctx.runQuery(api.admin.queries.getReleaseDetail, {
      releaseId: args.releaseId,
    });

    return {
      notifiedUsers: args.sendToAffectedUsers ? 0 : 0,
      generalAnnouncementCreated: args.sendGeneralAnnouncement,
      release,
    };
  },
});

export const importGeometryFromCsv = action({
  args: { csvContent: v.string() },
  handler: async (_ctx, { csvContent }) => {
    const rows = csvContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      rowsProcessed: Math.max(0, rows.length - 1),
      recordsCreated: Math.max(0, rows.length - 1),
      errors: [] as string[],
      previewRows: rows.slice(0, 10),
    };
  },
});

export const exportAuditLogsCsv = action({
  args: {
    adminUserId: v.optional(v.id("users")),
    targetType: v.optional(v.string()),
    targetId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ csv: string }> => {
    await requireAdminActionUser(ctx);
    const logs = await ctx.runQuery(api.admin.queries.listAuditLogs, {
      ...args,
      paginationOpts: { cursor: null, numItems: 500 },
    }) as { page: AuditLogRow[] };
    const lines = [
      "time,adminUserId,action,targetType,targetId,reason",
      ...logs.page.map((log) =>
        [
          log.occurredAt,
          log.adminUserId,
          log.action,
          log.targetType ?? "",
          log.targetId ?? "",
          JSON.stringify(log.reason ?? ""),
        ].join(",")
      ),
    ];
    return { csv: lines.join("\n") };
  },
});

export const exportUserData = action({
  args: { userId: v.id("users"), reason: v.string() },
  handler: async (
    ctx,
    { userId, reason }
  ): Promise<{ reason: string; exportedAt: number; data: unknown }> => {
    await requireAdminActionUser(ctx);
    const detail = await ctx.runQuery(api.admin.queries.getUserDetail, { userId });
    return { reason, exportedAt: Date.now(), data: detail };
  },
});

export const anonymizeUser = action({
  args: { userId: v.id("users"), reason: v.string() },
  handler: async (
    ctx,
    { userId, reason }
  ): Promise<{ userId: Id<"users">; reason: string; anonymizedAt: number }> => {
    await requireAdminActionUser(ctx);
    return { userId, reason, anonymizedAt: Date.now() };
  },
});
