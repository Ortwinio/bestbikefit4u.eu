import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { ActionCtx } from "../_generated/server";
import { api } from "../_generated/api";
import { action } from "../_generated/server";
import { buildGeometryCsv, type GeometryCsvRow } from "../../shared/geometryCsv";

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
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (rows.length < 2) {
      return {
        rowsProcessed: 0,
        recordsCreated: 0,
        recordsSkipped: 0,
        errors: ["The CSV must include a header row and at least one data row."],
        previewRows: [] as string[],
      };
    }

    const detectDelimiter = (line: string) => {
      const commaCount = (line.match(/,/g) ?? []).length;
      const semicolonCount = (line.match(/;/g) ?? []).length;
      return semicolonCount > commaCount ? ";" : ",";
    };

    const splitCsvLine = (line: string, delimiter: string) =>
      line
        .replace(/^\uFEFF/, "")
        .split(delimiter)
        .map((value) => value.trim());

    const delimiter = detectDelimiter(rows[0] ?? "");
    const headers = splitCsvLine(rows[0] ?? "", delimiter);
    const importJobId = `geometry-csv-${admin._id}-${Date.now()}`;
    let recordsCreated = 0;
    let recordsSkipped = 0;
    const errors: string[] = [];

    const parseOptionalNumber = (value: string | undefined) => {
      const trimmed = value?.trim();
      if (!trimmed) {
        return undefined;
      }
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const normalizeCategory = (value: string | undefined) => {
      const normalized = value?.trim().toLowerCase() ?? "";
      switch (normalized) {
        case "road":
        case "gravel":
        case "mtb":
        case "tt":
        case "endurance":
        case "city":
        case "other":
          return normalized;
        case "race_road":
          return "road";
        case "mountain":
          return "mtb";
        case "tt_triathlon":
          return "tt";
        default:
          return "other";
      }
    };

    for (const [rowIndex, rawLine] of rows.slice(1).entries()) {
      const values = splitCsvLine(rawLine, delimiter);
      const row = Object.fromEntries(
        headers.map((header, headerIndex) => [header, values[headerIndex]?.trim() ?? ""])
      );

      try {
        if (!row.brand_slug || !row.brand_name || !row.model_name || !row.size_label) {
          throw new Error("Missing required columns: brand_slug, brand_name, model_name, or size_label.");
        }

        const result = await ctx.runMutation(api.admin.mutations.importGeometryCsvRow, {
          brandSlug: row.brand_slug,
          brandName: row.brand_name,
          modelName: row.model_name,
          modelYear: parseOptionalNumber(row.model_year),
          category: normalizeCategory(row.category) as
            | "road"
            | "gravel"
            | "mtb"
            | "tt"
            | "endurance"
            | "city"
            | "other",
          sizeLabel: row.size_label,
          stack: parseOptionalNumber(row.stack),
          reach: parseOptionalNumber(row.reach),
          seatTubeAngle: parseOptionalNumber(row.seat_tube_angle),
          headTubeAngle: parseOptionalNumber(row.head_tube_angle),
          wheelbase: parseOptionalNumber(row.wheelbase),
          chainstay: parseOptionalNumber(row.chainstay),
          bbDrop: parseOptionalNumber(row.bb_drop),
          effectiveTopTube: parseOptionalNumber(row.effective_top_tube),
          standover: parseOptionalNumber(row.standover),
          forkRake: parseOptionalNumber(row.fork_rake),
          headTubeLength: parseOptionalNumber(row.head_tube_length),
          sourceUrl: row.source_url || undefined,
          importJobId,
        }) as { imported: boolean; skipped: boolean };

        if (result.imported) {
          recordsCreated += 1;
        } else if (result.skipped) {
          recordsSkipped += 1;
        }
      } catch (error) {
        errors.push(
          `Row ${rowIndex + 2}: ${error instanceof Error ? error.message : "Import failed."}`
        );
      }
    }

    return {
      rowsProcessed: Math.max(0, rows.length - 1),
      recordsCreated,
      recordsSkipped,
      errors,
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

export const exportGeometryRecordsCsv = action({
  args: { recordIds: v.array(v.id("geometry_records")) },
  handler: async (ctx, { recordIds }): Promise<{ csv: string }> => {
    const admin = await requireAdminActionUser(ctx);
    if (!["super_admin", "ops_admin", "geometry_manager"].includes(admin.adminRole)) {
      throw new Error("Not authorized: requires geometry role");
    }

    const rows = await ctx.runQuery(api.admin.queries.getGeometryRecordsForExport, {
      recordIds,
    }) as Array<{
      brandSlug: string;
      brandName: string;
      modelName: string;
      modelYear: number | null;
      category: string;
      sizeLabel: string;
      stack: number | null;
      reach: number | null;
      seatTubeAngle: number | null;
      headTubeAngle: number | null;
      wheelbase: number | null;
      chainstay: number | null;
      bbDrop: number | null;
      effectiveTopTube: number | null;
      standover: number | null;
      forkRake: number | null;
      headTubeLength: number | null;
      source: string;
      sourceUrl: string | null;
    }>;

    const csvRows: GeometryCsvRow[] = rows.map((row) => ({
      brand_slug: row.brandSlug,
      brand_name: row.brandName,
      model_name: row.modelName,
      model_year: row.modelYear ?? "",
      category: row.category,
      size_label: row.sizeLabel,
      stack: row.stack ?? "",
      reach: row.reach ?? "",
      seat_tube_angle: row.seatTubeAngle ?? "",
      head_tube_angle: row.headTubeAngle ?? "",
      wheelbase: row.wheelbase ?? "",
      chainstay: row.chainstay ?? "",
      bb_drop: row.bbDrop ?? "",
      effective_top_tube: row.effectiveTopTube ?? "",
      standover: row.standover ?? "",
      fork_rake: row.forkRake ?? "",
      head_tube_length: row.headTubeLength ?? "",
      seat_tube_length: "",
      rider_height_min_cm: "",
      rider_height_max_cm: "",
      saddle_height_min_mm: "",
      saddle_height_max_mm: "",
      source: row.source,
      source_url: row.sourceUrl ?? "",
    }));

    return { csv: buildGeometryCsv(csvRows) };
  },
});

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
