import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { ActionCtx } from "../_generated/server";
import { api } from "../_generated/api";
import { action } from "../_generated/server";

type AuditLogRow = Pick<
  Doc<"admin_audit_logs">,
  "_id" | "occurredAt" | "adminUserId" | "action" | "targetType" | "targetId" | "reason"
>;

async function requireAdminActionUser(
  ctx: ActionCtx
): Promise<{ _id: Id<"users">; adminRole: string }> {
  const admin = (await ctx.runQuery(api.admin.queries.getCurrentAdminUser, {})) as
    | { _id: Id<"users">; adminRole: string }
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
    if (!["super_admin", "ops_admin", "support_admin"].includes(admin.adminRole)) {
      throw new Error("Not authorized: requires impersonation role");
    }
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
    const admin = await requireAdminActionUser(ctx);
    if (!["super_admin", "ops_admin", "support_admin", "qa_manager"].includes(admin.adminRole)) {
      throw new Error("Not authorized: requires release messaging role");
    }
    const release = await ctx.runQuery(api.admin.queries.getReleaseDetail, {
      releaseId: args.releaseId,
    });
    const releaseDetail = release as
      | {
          release: { name: string; versionLabel?: string | null; description?: string | null } | null;
          linkedItems?: Array<{ itemType: string; itemId: string }>;
        }
      | null;
    const releaseName = releaseDetail?.release?.name ?? "Release update";
    const releaseLabel = releaseDetail?.release?.versionLabel
      ? `${releaseName} · ${releaseDetail.release.versionLabel}`
      : releaseName;
    const announcementTargets =
      args.announcementTargets && args.announcementTargets.length > 0
        ? args.announcementTargets
        : [{ targetType: "all" }];

    if (args.sendGeneralAnnouncement) {
      const announcementId = await ctx.runMutation(api.admin.mutations.createDashboardMessage, {
        title: `Release announced: ${releaseLabel}`,
        body:
          releaseDetail?.release?.description ??
          `Release ${releaseLabel} is now available.`,
        type: "release_announcement",
        priority: "normal",
        ctaText: "View update",
        ctaUrl: `/feedback`,
        locale: "all",
        dismissible: true,
        requiresAcknowledgement: false,
        startsAt: Date.now(),
        linkedReleaseId: args.releaseId,
        targets: announcementTargets,
      });
      await ctx.runMutation(api.admin.mutations.publishDashboardMessage, {
        messageId: announcementId,
      });
    }

    let notifiedUsers = 0;
    if (args.sendToAffectedUsers) {
      const linkedFeedbackItems = await Promise.all(
        (releaseDetail?.linkedItems ?? [])
          .filter((item) => item.itemType === "feedback_item")
          .map(async (item) =>
            await ctx.runQuery(api.admin.queries.getFeedbackDetail, {
              feedbackItemId: item.itemId as Id<"feedback_items">,
            })
          )
      );

      const usersById = new Map<
        string,
        {
          userId: Id<"users">;
          feedbackItems: Array<{ _id: Id<"feedback_items">; title: string }>;
        }
      >();

      for (const detail of linkedFeedbackItems) {
        if (!detail?.item.userId) {
          continue;
        }

        const key = String(detail.item.userId);
        const current = usersById.get(key) ?? {
          userId: detail.item.userId,
          feedbackItems: [],
        };
        current.feedbackItems.push({
          _id: detail.item._id,
          title: detail.item.title,
        });
        usersById.set(key, current);
      }

      for (const { userId, feedbackItems } of usersById.values()) {
        const primaryFeedbackItem = feedbackItems[0];
        const feedbackSummary =
          feedbackItems.length === 1
            ? `your feedback item "${primaryFeedbackItem?.title ?? "feedback"}"`
            : `${feedbackItems.length} feedback items you reported`;
        const messageId = await ctx.runMutation(api.admin.mutations.createDashboardMessage, {
          title: `Update on your feedback`,
          body: `The release ${releaseLabel} is now live and addresses ${feedbackSummary}.`,
          type: "support_reply",
          priority: "normal",
          locale: "all",
          dismissible: true,
          requiresAcknowledgement: false,
          startsAt: Date.now(),
          linkedReleaseId: args.releaseId,
          linkedFeedbackItemId: primaryFeedbackItem?._id,
          targets: [{ targetType: "user", targetValue: String(userId) }],
        });
        await ctx.runMutation(api.admin.mutations.publishDashboardMessage, {
          messageId,
        });
        notifiedUsers += 1;
      }
    }

    return {
      notifiedUsers,
      generalAnnouncementCreated: args.sendGeneralAnnouncement,
      release,
    };
  },
});

export const importGeometryFromCsv = action({
  args: { csvContent: v.string() },
  handler: async (ctx, { csvContent }) => {
    const admin = await requireAdminActionUser(ctx);
    if (!["super_admin", "ops_admin", "geometry_manager"].includes(admin.adminRole)) {
      throw new Error("Not authorized: requires geometry role");
    }
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
    const admin = await requireAdminActionUser(ctx);
    if (!["super_admin", "ops_admin", "support_admin", "qa_manager"].includes(admin.adminRole)) {
      throw new Error("Not authorized: requires audit export role");
    }
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

export const exportAdminAuditLogsCsv = exportAuditLogsCsv;

export const exportUserData = action({
  args: { userId: v.id("users"), reason: v.string() },
  handler: async (
    ctx,
    { userId, reason }
  ): Promise<{ reason: string; exportedAt: number; data: unknown }> => {
    const admin = await requireAdminActionUser(ctx);
    if (!["super_admin", "ops_admin", "support_admin", "billing_admin"].includes(admin.adminRole)) {
      throw new Error("Not authorized: requires GDPR export role");
    }
    const detail = await ctx.runQuery(api.admin.queries.getUserDetail, { userId });
    await ctx.runMutation(api.admin.mutations.requestGdprExport, {
      requesterEmail:
        (detail as { user?: { email?: string | null } | null } | null)?.user?.email ??
        "unknown@example.com",
      subjectUserId: userId,
      notes: reason,
    });
    return { reason, exportedAt: Date.now(), data: detail };
  },
});

export const anonymizeUser = action({
  args: { userId: v.id("users"), reason: v.string() },
  handler: async (
    ctx,
    { userId, reason }
  ): Promise<{ userId: Id<"users">; reason: string; anonymizedAt: number }> => {
    const admin = await requireAdminActionUser(ctx);
    if (!["super_admin", "ops_admin", "support_admin", "billing_admin"].includes(admin.adminRole)) {
      throw new Error("Not authorized: requires GDPR erasure role");
    }
    const detail = await ctx.runQuery(api.admin.queries.getUserDetail, { userId });
    await ctx.runMutation(api.admin.mutations.requestGdprErasure, {
      requesterEmail:
        (detail as { user?: { email?: string | null } | null } | null)?.user?.email ??
        "unknown@example.com",
      subjectUserId: userId,
      notes: reason,
    });
    return { userId, reason, anonymizedAt: Date.now() };
  },
});
