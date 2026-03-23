import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { mutation, type MutationCtx } from "../_generated/server";
import { writeAuditLog } from "./audit";
import { requireAnyRole, requireAdminRole, requireAdminUserId } from "./authz";

type DashboardMessageTargetInput = {
  targetType: string;
  targetValue?: string;
};

type DashboardMessageInput = {
  title: string;
  body: string;
  type:
    | "banner"
    | "inbox_card"
    | "modal"
    | "sticky_warning"
    | "release_announcement"
    | "upgrade_prompt"
    | "safety_alert"
    | "re_fit_reminder"
    | "support_reply";
  priority: "low" | "normal" | "high" | "urgent";
  ctaText?: string;
  ctaUrl?: string;
  locale?: "all" | "en" | "nl";
  dismissible: boolean;
  requiresAcknowledgement: boolean;
  startsAt?: number;
  expiresAt?: number;
  linkedReleaseId?: Id<"releases">;
  linkedFeedbackItemId?: Id<"feedback_items">;
};

function resolveDashboardMessageStatus(startsAt: number | undefined, now: number) {
  if (startsAt === undefined) {
    return "draft" as const;
  }

  return startsAt <= now ? ("published" as const) : ("scheduled" as const);
}

function resolveDashboardMessagePublishedAt(
  status: "draft" | "scheduled" | "published" | "expired" | "paused",
  now: number,
  existingPublishedAt?: number
) {
  if (status !== "published") {
    return undefined;
  }

  return existingPublishedAt ?? now;
}

async function createDashboardMessageRecord(
  ctx: MutationCtx,
  adminId: Id<"users">,
  targets: DashboardMessageTargetInput[],
  message: DashboardMessageInput
) {
  const now = Date.now();
  const status = resolveDashboardMessageStatus(message.startsAt, now);
  const messageId = await ctx.db.insert("dashboard_messages", {
    ...message,
    status,
    publishedAt: resolveDashboardMessagePublishedAt(status, now),
    createdAt: now,
    createdBy: adminId,
  });

  for (const target of targets) {
    await ctx.db.insert("message_targets", {
      messageId,
      targetType: target.targetType,
      targetValue: target.targetValue,
      createdAt: now,
    });
  }

  await writeAuditLog(ctx, {
    adminUserId: adminId,
    action: "message.create",
    targetType: "message",
    targetId: messageId,
    payload: { ...message, targets },
  });

  return messageId;
}

function isAllowedReleaseTransition(
  currentStatus: Doc<"releases">["status"],
  nextStatus: Doc<"releases">["status"]
) {
  if (currentStatus === "archived") {
    return nextStatus === "archived";
  }

  return true;
}

async function getLinkedFeedbackItems(
  ctx: MutationCtx,
  releaseId: Id<"releases">
) {
  const releaseItems = await ctx.db
    .query("release_items")
    .withIndex("by_release", (q) => q.eq("releaseId", releaseId))
    .collect();
  const feedbackItemIds = releaseItems
    .filter((item) => item.itemType === "feedback_item")
    .map((item) => item.itemId as Id<"feedback_items">);
  const feedbackItems = await Promise.all(feedbackItemIds.map((feedbackItemId) => ctx.db.get(feedbackItemId)));
  return feedbackItems.filter((item): item is Doc<"feedback_items"> => item !== null);
}

async function markFeedbackItemsReleased(
  ctx: MutationCtx,
  releaseId: Id<"releases">
) {
  const feedbackItems = await getLinkedFeedbackItems(ctx, releaseId);
  const now = Date.now();
  for (const item of feedbackItems) {
    await ctx.db.patch(item._id, {
      status: "released",
      linkedReleaseId: releaseId,
      updatedAt: now,
    });
  }

  return feedbackItems.length;
}

async function createFeedbackReplyNotification(
  ctx: MutationCtx,
  adminId: Id<"users">,
  feedbackItem: Pick<Doc<"feedback_items">, "_id" | "userId" | "title" | "linkedReleaseId">,
  body: string
) {
  if (!feedbackItem.userId) {
    return null;
  }

  return await createDashboardMessageRecord(
    ctx,
    adminId,
    [
      {
        targetType: "user",
        targetValue: String(feedbackItem.userId),
      },
    ],
    {
      title: `Update on ${feedbackItem.title}`,
      body,
      type: "support_reply",
      priority: "normal",
      locale: "all",
      dismissible: true,
      requiresAcknowledgement: false,
      startsAt: Date.now(),
      linkedReleaseId: feedbackItem.linkedReleaseId,
      linkedFeedbackItemId: feedbackItem._id,
    }
  );
}

export const changeUserTier = mutation({
  args: {
    userId: v.id("users"),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("premium")),
    reason: v.string(),
  },
  handler: async (ctx, { userId, tier, reason }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "billing_admin", "ops_admin"]);
    const before = await ctx.db.get(userId);
    await ctx.db.patch(userId, { tier });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "user.tier_change",
      targetType: "user",
      targetId: userId,
      payload: { before: before?.tier, after: tier },
      reason,
    });
  },
});

export const suspendUser = mutation({
  args: { userId: v.id("users"), reason: v.string() },
  handler: async (ctx, { userId, reason }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "support_admin", "ops_admin"]);
    await ctx.db.patch(userId, { suspendedAt: Date.now(), suspendedReason: reason });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "user.suspend",
      targetType: "user",
      targetId: userId,
      reason,
    });
  },
});

export const restoreUser = mutation({
  args: { userId: v.id("users"), reason: v.optional(v.string()) },
  handler: async (ctx, { userId, reason }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "support_admin", "ops_admin"]);
    await ctx.db.patch(userId, { suspendedAt: undefined, suspendedReason: undefined });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "user.restore",
      targetType: "user",
      targetId: userId,
      reason,
    });
  },
});

export const setAdminRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.optional(
      v.union(
        v.literal("super_admin"),
        v.literal("ops_admin"),
        v.literal("support_admin"),
        v.literal("fit_specialist"),
        v.literal("geometry_manager"),
        v.literal("billing_admin"),
        v.literal("qa_manager"),
        v.literal("analyst")
      )
    ),
    reason: v.string(),
  },
  handler: async (ctx, { userId, role, reason }) => {
    const adminId = await requireAdminRole(ctx, "super_admin");
    const before = await ctx.db.get(userId);
    await ctx.db.patch(userId, { adminRole: role });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "user.admin_role_set",
      targetType: "user",
      targetId: userId,
      payload: { before: before?.adminRole, after: role },
      reason,
    });
  },
});

export const createOrganization = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    type: v.union(
      v.literal("bike_shop"),
      v.literal("enterprise"),
      v.literal("fitter_studio"),
      v.literal("brand")
    ),
    ownerUserId: v.id("users"),
    billingEmail: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "ops_admin"]);
    const orgId = await ctx.db.insert("organizations", {
      ...args,
      createdAt: Date.now(),
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "organization.create",
      targetType: "organization",
      targetId: orgId,
      payload: args,
    });
    return orgId;
  },
});

export const updateOrganization = mutation({
  args: {
    orgId: v.id("organizations"),
    name: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("bike_shop"),
        v.literal("enterprise"),
        v.literal("fitter_studio"),
        v.literal("brand")
      )
    ),
    maxSeats: v.optional(v.number()),
    billingEmail: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { orgId, ...updates }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "ops_admin", "billing_admin"]);
    await ctx.db.patch(orgId, { ...updates, updatedAt: Date.now() });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "organization.update",
      targetType: "organization",
      targetId: orgId,
      payload: updates,
    });
  },
});

export const suspendOrganization = mutation({
  args: { orgId: v.id("organizations"), reason: v.string() },
  handler: async (ctx, { orgId, reason }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "ops_admin"]);
    await ctx.db.patch(orgId, { suspendedAt: Date.now(), suspendedReason: reason });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "organization.suspend",
      targetType: "organization",
      targetId: orgId,
      reason,
    });
  },
});

export const addOrgMember = mutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("staff"),
      v.literal("fitter"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "ops_admin"]);
    const memberId = await ctx.db.insert("organization_members", {
      ...args,
      joinedAt: Date.now(),
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "organization.member_add",
      targetType: "organization",
      targetId: args.organizationId,
      payload: { memberId, userId: args.userId, role: args.role },
    });
    return memberId;
  },
});

export const removeOrgMember = mutation({
  args: { memberId: v.id("organization_members") },
  handler: async (ctx, { memberId }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "ops_admin"]);
    const member = await ctx.db.get(memberId);
    if (!member) throw new Error("Member not found");
    await ctx.db.patch(memberId, { removedAt: Date.now() });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "organization.member_remove",
      targetType: "organization",
      targetId: member.organizationId,
      payload: { userId: member.userId, role: member.role },
    });
  },
});

export const createGeometryBrand = mutation({
  args: { name: v.string(), slug: v.string(), website: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "geometry_manager"]);
    const brandId = await ctx.db.insert("geometry_brands", {
      ...args,
      createdAt: Date.now(),
      createdBy: adminId,
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "geometry.brand_create",
      targetType: "geometry_brand",
      targetId: brandId,
      payload: args,
    });
    return brandId;
  },
});

export const createGeometryModel = mutation({
  args: {
    brandId: v.id("geometry_brands"),
    name: v.string(),
    category: v.union(
      v.literal("road"),
      v.literal("gravel"),
      v.literal("mtb"),
      v.literal("tt"),
      v.literal("endurance"),
      v.literal("city"),
      v.literal("other")
    ),
    yearStart: v.optional(v.number()),
    yearEnd: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "geometry_manager"]);
    const modelId = await ctx.db.insert("geometry_models", {
      ...args,
      createdAt: Date.now(),
      createdBy: adminId,
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "geometry.model_create",
      targetType: "geometry_model",
      targetId: modelId,
      payload: args,
    });
    return modelId;
  },
});

export const createGeometryRecord = mutation({
  args: {
    modelId: v.id("geometry_models"),
    brandId: v.id("geometry_brands"),
    sizeLabel: v.string(),
    stack: v.optional(v.number()),
    reach: v.optional(v.number()),
    seatTubeAngle: v.optional(v.number()),
    headTubeAngle: v.optional(v.number()),
    wheelbase: v.optional(v.number()),
    chainstay: v.optional(v.number()),
    bbDrop: v.optional(v.number()),
    effectiveTopTube: v.optional(v.number()),
    standover: v.optional(v.number()),
    forkRake: v.optional(v.number()),
    headTubeLength: v.optional(v.number()),
    source: v.union(
      v.literal("manufacturer"),
      v.literal("admin_import"),
      v.literal("admin_manual"),
      v.literal("user_entered")
    ),
    sourceUrl: v.optional(v.string()),
    changeReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "geometry_manager"]);
    const existing = await ctx.db
      .query("geometry_records")
      .withIndex("by_model_size", (q) =>
        q.eq("modelId", args.modelId).eq("sizeLabel", args.sizeLabel)
      )
      .collect();
    const recordId = await ctx.db.insert("geometry_records", {
      ...args,
      status: "draft",
      version: existing.length + 1,
      createdAt: Date.now(),
      createdBy: adminId,
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "geometry.create",
      targetType: "geometry_record",
      targetId: recordId,
      payload: args,
    });
    return recordId;
  },
});

export const approveGeometryRecord = mutation({
  args: { recordId: v.id("geometry_records") },
  handler: async (ctx, { recordId }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "geometry_manager"]);
    await ctx.db.patch(recordId, {
      status: "active",
      reviewedBy: adminId,
      reviewedAt: Date.now(),
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "geometry.approve",
      targetType: "geometry_record",
      targetId: recordId,
    });
  },
});

export const rejectGeometryRecord = mutation({
  args: { recordId: v.id("geometry_records"), reason: v.optional(v.string()) },
  handler: async (ctx, { recordId, reason }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "geometry_manager"]);
    await ctx.db.patch(recordId, {
      status: "rejected",
      reviewedBy: adminId,
      reviewedAt: Date.now(),
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "geometry.reject",
      targetType: "geometry_record",
      targetId: recordId,
      reason,
    });
  },
});

export const createGeometryRecordVersion = mutation({
  args: { recordId: v.id("geometry_records"), changeReason: v.optional(v.string()) },
  handler: async (ctx, { recordId, changeReason }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "geometry_manager"]);
    const record = await ctx.db.get(recordId);
    if (!record) throw new Error("Geometry record not found");
    const nextId = await ctx.db.insert("geometry_records", {
      ...record,
      status: "draft",
      version: record.version + 1,
      supersededBy: undefined,
      reviewedBy: undefined,
      reviewedAt: undefined,
      changeReason,
      createdAt: Date.now(),
      createdBy: adminId,
    });
    await ctx.db.patch(recordId, { status: "superseded", supersededBy: nextId });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "geometry.version_create",
      targetType: "geometry_record",
      targetId: nextId,
      payload: { previousRecordId: recordId, changeReason },
    });
    return nextId;
  },
});

export const saveGeometryRecordVersion = mutation({
  args: {
    recordId: v.id("geometry_records"),
    source: v.union(
      v.literal("manufacturer"),
      v.literal("admin_import"),
      v.literal("admin_manual"),
      v.literal("user_entered")
    ),
    sourceUrl: v.optional(v.string()),
    changeReason: v.string(),
    stack: v.optional(v.number()),
    reach: v.optional(v.number()),
    seatTubeAngle: v.optional(v.number()),
    headTubeAngle: v.optional(v.number()),
    wheelbase: v.optional(v.number()),
    chainstay: v.optional(v.number()),
    bbDrop: v.optional(v.number()),
    effectiveTopTube: v.optional(v.number()),
    standover: v.optional(v.number()),
    forkRake: v.optional(v.number()),
    headTubeLength: v.optional(v.number()),
  },
  handler: async (ctx, { recordId, ...updates }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "geometry_manager"]);
    const record = await ctx.db.get(recordId);
    if (!record) {
      throw new Error("Geometry record not found");
    }

    const nextId = await ctx.db.insert("geometry_records", {
      ...record,
      ...updates,
      status: "draft",
      version: record.version + 1,
      supersededBy: undefined,
      reviewedBy: undefined,
      reviewedAt: undefined,
      createdAt: Date.now(),
      createdBy: adminId,
    });

    await ctx.db.patch(recordId, {
      status: "superseded",
      supersededBy: nextId,
    });

    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "geometry.version_edit",
      targetType: "geometry_record",
      targetId: nextId,
      payload: {
        previousRecordId: recordId,
        updates,
      },
      reason: updates.changeReason,
    });

    return nextId;
  },
});

export const linkBikeToGeometry = mutation({
  args: { bikeId: v.id("bikes"), recordId: v.id("geometry_records") },
  handler: async (ctx, { bikeId, recordId }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "geometry_manager"]);
    await ctx.db.patch(bikeId, { geometryRecordId: recordId, updatedAt: Date.now() });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "bike.link_geometry",
      targetType: "bike",
      targetId: bikeId,
      payload: { recordId },
    });
  },
});

export const createEngineVersion = mutation({
  args: { versionLabel: v.string(), description: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "qa_manager"]);
    const versionId = await ctx.db.insert("engine_versions", {
      ...args,
      status: "draft",
      qaStatus: "pending",
      createdAt: Date.now(),
      createdBy: adminId,
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "engine.create",
      targetType: "engine_version",
      targetId: versionId,
      payload: args,
    });
    return versionId;
  },
});

export const updateEngineVersionStatus = mutation({
  args: {
    versionId: v.id("engine_versions"),
    status: v.union(
      v.literal("draft"),
      v.literal("qa"),
      v.literal("active"),
      v.literal("deprecated")
    ),
  },
  handler: async (ctx, { versionId, status }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "qa_manager"]);
    if (status === "active") {
      const activeVersions = await ctx.db
        .query("engine_versions")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .collect();
      for (const version of activeVersions) {
        await ctx.db.patch(version._id, { status: "deprecated" });
      }
    }
    await ctx.db.patch(versionId, {
      status,
      activatedAt: status === "active" ? Date.now() : undefined,
      activatedBy: status === "active" ? adminId : undefined,
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "engine.status_change",
      targetType: "engine_version",
      targetId: versionId,
      payload: { status },
    });
  },
});

export const markFitRunReviewed = mutation({
  args: { sessionId: v.id("fitSessions"), reviewNotes: v.optional(v.string()) },
  handler: async (ctx, { sessionId, reviewNotes }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "fit_specialist"]);
    await ctx.db.patch(sessionId, {
      reviewStatus: "reviewed",
      reviewedBy: adminId,
      reviewedAt: Date.now(),
      reviewNotes,
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "fit_run.reviewed",
      targetType: "fit_run",
      targetId: sessionId,
      payload: { reviewNotes },
    });
  },
});

export const createRelease = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("app"),
      v.literal("fit_engine"),
      v.literal("geometry_data"),
      v.literal("content"),
      v.literal("integration"),
      v.literal("internal")
    ),
    versionLabel: v.optional(v.string()),
    description: v.optional(v.string()),
    rolloutDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "qa_manager", "ops_admin"]);
    const releaseId = await ctx.db.insert("releases", {
      ...args,
      status: "draft",
      createdAt: Date.now(),
      createdBy: adminId,
      ownerId: adminId,
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "release.create",
      targetType: "release",
      targetId: releaseId,
      payload: args,
    });
    return releaseId;
  },
});

export const updateReleaseStatus = mutation({
  args: {
    releaseId: v.id("releases"),
    status: v.union(
      v.literal("draft"),
      v.literal("in_qa"),
      v.literal("approved"),
      v.literal("scheduled"),
      v.literal("rolling_out"),
      v.literal("live"),
      v.literal("rolled_back"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, { releaseId, status }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "qa_manager", "ops_admin"]);
    const release = await ctx.db.get(releaseId);
    if (!release) {
      throw new Error("Release not found");
    }

    if (!isAllowedReleaseTransition(release.status, status)) {
      throw new Error(`Not allowed to transition release from ${release.status} to ${status}`);
    }

    await ctx.db.patch(releaseId, {
      status,
      liveAt: status === "live" ? Date.now() : undefined,
    });

    const releasedFeedbackCount = status === "live" ? await markFeedbackItemsReleased(ctx, releaseId) : 0;
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "release.status_change",
      targetType: "release",
      targetId: releaseId,
      payload: { from: release.status, to: status, releasedFeedbackCount },
    });
  },
});

export const linkFeedbackToRelease = mutation({
  args: { feedbackItemId: v.id("feedback_items"), releaseId: v.id("releases") },
  handler: async (ctx, { feedbackItemId, releaseId }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "ops_admin", "qa_manager"]);
    const release = await ctx.db.get(releaseId);
    await ctx.db.patch(feedbackItemId, { linkedReleaseId: releaseId, updatedAt: Date.now() });
    await ctx.db.insert("release_items", {
      releaseId,
      itemType: "feedback_item",
      itemId: feedbackItemId,
      createdAt: Date.now(),
    });
    if (release?.status === "live") {
      await ctx.db.patch(feedbackItemId, {
        status: "released",
        updatedAt: Date.now(),
      });
    }
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "feedback.link_release",
      targetType: "feedback_item",
      targetId: feedbackItemId,
      payload: { releaseId },
    });
  },
});

export const updateFeedbackItem = mutation({
  args: {
    feedbackItemId: v.id("feedback_items"),
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("triaged"),
        v.literal("needs_info"),
        v.literal("planned"),
        v.literal("in_progress"),
        v.literal("in_qa"),
        v.literal("released"),
        v.literal("closed"),
        v.literal("declined")
      )
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent"))
    ),
    assignedTo: v.optional(v.id("users")),
    productArea: v.optional(v.string()),
  },
  handler: async (ctx, { feedbackItemId, ...updates }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "ops_admin", "qa_manager", "support_admin"]);
    await ctx.db.patch(feedbackItemId, { ...updates, updatedAt: Date.now() });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "feedback.update",
      targetType: "feedback_item",
      targetId: feedbackItemId,
      payload: updates,
    });
  },
});

export const addFeedbackComment = mutation({
  args: {
    feedbackItemId: v.id("feedback_items"),
    body: v.string(),
    isInternal: v.boolean(),
  },
  handler: async (ctx, { feedbackItemId, body, isInternal }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "ops_admin", "qa_manager", "support_admin"]);
    const feedbackItem = await ctx.db.get(feedbackItemId);
    const commentId = await ctx.db.insert("feedback_comments", {
      feedbackItemId,
      authorUserId: adminId,
      body,
      isInternal,
      createdAt: Date.now(),
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "feedback.comment_add",
      targetType: "feedback_item",
      targetId: feedbackItemId,
      payload: { commentId, isInternal },
    });

    if (!isInternal && feedbackItem) {
      await createFeedbackReplyNotification(ctx, adminId, feedbackItem, body);
    }

    return commentId;
  },
});

export const createDashboardMessage = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    type: v.union(
      v.literal("banner"),
      v.literal("inbox_card"),
      v.literal("modal"),
      v.literal("sticky_warning"),
      v.literal("release_announcement"),
      v.literal("upgrade_prompt"),
      v.literal("safety_alert"),
      v.literal("re_fit_reminder"),
      v.literal("support_reply")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    ctaText: v.optional(v.string()),
    ctaUrl: v.optional(v.string()),
    locale: v.optional(v.union(v.literal("all"), v.literal("en"), v.literal("nl"))),
    dismissible: v.boolean(),
    requiresAcknowledgement: v.boolean(),
    startsAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    linkedReleaseId: v.optional(v.id("releases")),
    linkedFeedbackItemId: v.optional(v.id("feedback_items")),
    targets: v.array(
      v.object({
        targetType: v.string(),
        targetValue: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { targets, ...message }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "ops_admin", "qa_manager", "support_admin"]);
    return await createDashboardMessageRecord(ctx, adminId, targets, message);
  },
});

export const updateDashboardMessage = mutation({
  args: {
    messageId: v.id("dashboard_messages"),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("banner"),
        v.literal("inbox_card"),
        v.literal("modal"),
        v.literal("sticky_warning"),
        v.literal("release_announcement"),
        v.literal("upgrade_prompt"),
        v.literal("safety_alert"),
        v.literal("re_fit_reminder"),
        v.literal("support_reply")
      )
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent"))
    ),
    ctaText: v.optional(v.string()),
    ctaUrl: v.optional(v.string()),
    locale: v.optional(v.union(v.literal("all"), v.literal("en"), v.literal("nl"))),
    dismissible: v.optional(v.boolean()),
    requiresAcknowledgement: v.optional(v.boolean()),
    startsAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    targets: v.optional(
      v.array(
        v.object({
          targetType: v.string(),
          targetValue: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, { messageId, targets, ...updates }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "ops_admin", "qa_manager", "support_admin"]);
    const existing = await ctx.db.get(messageId);
    if (!existing) {
      throw new Error("Message not found");
    }

    const shouldResolveStatus = updates.startsAt !== undefined;
    const status = shouldResolveStatus
      ? resolveDashboardMessageStatus(updates.startsAt, Date.now())
      : existing.status;

    await ctx.db.patch(messageId, {
      ...updates,
      status,
      publishedAt: resolveDashboardMessagePublishedAt(status, Date.now(), existing.publishedAt),
    });
    if (targets) {
      const existingTargets = await ctx.db
        .query("message_targets")
        .withIndex("by_message", (q) => q.eq("messageId", messageId))
        .collect();
      for (const target of existingTargets) {
        await ctx.db.delete(target._id);
      }
      for (const target of targets) {
        await ctx.db.insert("message_targets", {
          messageId,
          targetType: target.targetType,
          targetValue: target.targetValue,
          createdAt: Date.now(),
        });
      }
    }
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "message.update",
      targetType: "message",
      targetId: messageId,
      payload: { ...updates, targets },
    });
  },
});

export const publishDashboardMessage = mutation({
  args: { messageId: v.id("dashboard_messages") },
  handler: async (ctx, { messageId }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "ops_admin", "qa_manager", "support_admin"]);
    const existing = await ctx.db.get(messageId);
    if (!existing) {
      throw new Error("Message not found");
    }

    await ctx.db.patch(messageId, {
      status: "published",
      publishedAt: existing.publishedAt ?? Date.now(),
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "message.publish",
      targetType: "message",
      targetId: messageId,
    });
  },
});

export const pauseDashboardMessage = mutation({
  args: { messageId: v.id("dashboard_messages"), reason: v.optional(v.string()) },
  handler: async (ctx, { messageId, reason }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "ops_admin", "qa_manager", "support_admin"]);
    await ctx.db.patch(messageId, { status: "paused", pausedAt: Date.now() });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "message.pause",
      targetType: "message",
      targetId: messageId,
      reason,
    });
  },
});

export const expireDashboardMessage = mutation({
  args: { messageId: v.id("dashboard_messages"), reason: v.optional(v.string()) },
  handler: async (ctx, { messageId, reason }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "ops_admin", "qa_manager", "support_admin"]);
    await ctx.db.patch(messageId, { status: "expired", expiresAt: Date.now() });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "message.expire",
      targetType: "message",
      targetId: messageId,
      reason,
    });
  },
});

export const deleteDashboardMessage = mutation({
  args: { messageId: v.id("dashboard_messages"), reason: v.optional(v.string()) },
  handler: async (ctx, { messageId, reason }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "ops_admin", "qa_manager", "support_admin"]);
    const targets = await ctx.db
      .query("message_targets")
      .withIndex("by_message", (q) => q.eq("messageId", messageId))
      .collect();
    const receipts = await ctx.db
      .query("message_receipts")
      .withIndex("by_message", (q) => q.eq("messageId", messageId))
      .collect();
    for (const target of targets) {
      await ctx.db.delete(target._id);
    }
    for (const receipt of receipts) {
      await ctx.db.delete(receipt._id);
    }
    await ctx.db.delete(messageId);
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "message.delete",
      targetType: "message",
      targetId: messageId,
      reason,
    });
  },
});

export const setFeatureFlag = mutation({
  args: {
    key: v.string(),
    value: v.boolean(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { key, value, description }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "ops_admin"]);
    const existing = await ctx.db
      .query("feature_flags")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { value, description, updatedAt: Date.now(), updatedBy: adminId });
    } else {
      await ctx.db.insert("feature_flags", { key, value, description, updatedAt: Date.now(), updatedBy: adminId });
    }
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "feature_flag.set",
      targetType: "feature_flag",
      targetId: key,
      payload: { value, description },
    });
  },
});

export const startTrial = mutation({
  args: {
    userId: v.id("users"),
    planId: v.optional(v.id("plans")),
    trialEndsAt: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, { userId, planId, trialEndsAt, reason }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "billing_admin"]);
    await ctx.db.patch(userId, { trialEndsAt });
    if (planId) {
      const now = Date.now();
      const existingSubscription = await ctx.db
        .query("subscriptions")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
      if (existingSubscription) {
        await ctx.db.patch(existingSubscription._id, {
          planId,
          status: "trialing",
          startsAt: existingSubscription.startsAt ?? now,
          endsAt: trialEndsAt,
          updatedAt: now,
        });
      } else {
        const subscriptionId = await ctx.db.insert("subscriptions", {
          userId,
          planId,
          status: "trialing",
          startsAt: now,
          endsAt: trialEndsAt,
          createdAt: now,
          updatedAt: now,
        });
        await ctx.db.insert("billing_events", {
          subscriptionId,
          userId,
          eventType: "trial_started",
          payloadJson: JSON.stringify({ planId, trialEndsAt }),
          occurredAt: now,
          createdAt: now,
        });
      }
    }
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "billing.trial_start",
      targetType: "user",
      targetId: userId,
      payload: { planId, trialEndsAt },
      reason,
    });
  },
});

export const createPlan = mutation({
  args: {
    key: v.string(),
    name: v.string(),
    tier: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("premium"),
      v.literal("bike_shop"),
      v.literal("enterprise")
    ),
    priceCents: v.optional(v.number()),
    billingInterval: v.optional(
      v.union(v.literal("month"), v.literal("year"), v.literal("custom"))
    ),
    seatLimit: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "billing_admin"]);
    const now = Date.now();
    const planId = await ctx.db.insert("plans", {
      ...args,
      isActive: args.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "billing.plan_create",
      targetType: "plan",
      targetId: planId,
      payload: args,
    });
    return planId;
  },
});

export const updatePlan = mutation({
  args: {
    planId: v.id("plans"),
    name: v.optional(v.string()),
    tier: v.optional(
      v.union(
        v.literal("free"),
        v.literal("pro"),
        v.literal("premium"),
        v.literal("bike_shop"),
        v.literal("enterprise")
      )
    ),
    priceCents: v.optional(v.number()),
    billingInterval: v.optional(
      v.union(v.literal("month"), v.literal("year"), v.literal("custom"))
    ),
    seatLimit: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { planId, ...updates }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "billing_admin"]);
    await ctx.db.patch(planId, { ...updates, updatedAt: Date.now() });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "billing.plan_update",
      targetType: "plan",
      targetId: planId,
      payload: updates,
    });
  },
});

export const changeSubscriptionPlan = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    planId: v.id("plans"),
    reason: v.string(),
  },
  handler: async (ctx, { subscriptionId, planId, reason }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "billing_admin"]);
    await ctx.db.patch(subscriptionId, { planId, updatedAt: Date.now() });
    await ctx.db.insert("billing_events", {
      subscriptionId,
      eventType: "subscription_plan_changed",
      payloadJson: JSON.stringify({ planId }),
      occurredAt: Date.now(),
      createdAt: Date.now(),
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "billing.subscription_plan_change",
      targetType: "subscription",
      targetId: subscriptionId,
      payload: { planId },
      reason,
    });
  },
});

export const cancelSubscription = mutation({
  args: { subscriptionId: v.id("subscriptions"), reason: v.string() },
  handler: async (ctx, { subscriptionId, reason }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "billing_admin"]);
    const now = Date.now();
    await ctx.db.patch(subscriptionId, { status: "canceled", endsAt: now, updatedAt: now });
    await ctx.db.insert("billing_events", {
      subscriptionId,
      eventType: "subscription_canceled",
      payloadJson: JSON.stringify({ reason }),
      occurredAt: now,
      createdAt: now,
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "billing.subscription_cancel",
      targetType: "subscription",
      targetId: subscriptionId,
      reason,
    });
  },
});

export const resumeSubscription = mutation({
  args: { subscriptionId: v.id("subscriptions"), reason: v.string() },
  handler: async (ctx, { subscriptionId, reason }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "billing_admin"]);
    const now = Date.now();
    await ctx.db.patch(subscriptionId, { status: "active", updatedAt: now });
    await ctx.db.insert("billing_events", {
      subscriptionId,
      eventType: "subscription_resumed",
      payloadJson: JSON.stringify({ reason }),
      occurredAt: now,
      createdAt: now,
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "billing.subscription_resume",
      targetType: "subscription",
      targetId: subscriptionId,
      reason,
    });
  },
});

export const requestGdprExport = mutation({
  args: {
    requesterEmail: v.string(),
    subjectUserId: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { requesterEmail, subjectUserId, notes }) => {
    const adminId = await requireAnyRole(ctx, [
      "super_admin",
      "ops_admin",
      "support_admin",
      "billing_admin",
    ]);
    const requestId = await ctx.db.insert("gdpr_requests", {
      requestType: "export",
      requesterEmail,
      subjectUserId,
      status: "requested",
      receivedAt: Date.now(),
      notes,
      createdBy: adminId,
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "gdpr.request_export",
      targetType: "gdpr_request",
      targetId: requestId,
      payload: { requesterEmail, subjectUserId, notes },
    });
    return requestId;
  },
});

export const requestGdprErasure = mutation({
  args: {
    requesterEmail: v.string(),
    subjectUserId: v.optional(v.id("users")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { requesterEmail, subjectUserId, notes }) => {
    const adminId = await requireAnyRole(ctx, [
      "super_admin",
      "ops_admin",
      "support_admin",
      "billing_admin",
    ]);
    const requestId = await ctx.db.insert("gdpr_requests", {
      requestType: "erasure",
      requesterEmail,
      subjectUserId,
      status: "requested",
      receivedAt: Date.now(),
      notes,
      createdBy: adminId,
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "gdpr.request_erasure",
      targetType: "gdpr_request",
      targetId: requestId,
      payload: { requesterEmail, subjectUserId, notes },
    });
    return requestId;
  },
});

export const fulfillGdprRequest = mutation({
  args: {
    requestId: v.id("gdpr_requests"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { requestId, notes }) => {
    const adminId = await requireAnyRole(ctx, [
      "super_admin",
      "ops_admin",
      "support_admin",
      "billing_admin",
    ]);
    await ctx.db.patch(requestId, {
      status: "fulfilled",
      fulfilledAt: Date.now(),
      notes,
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "gdpr.request_fulfill",
      targetType: "gdpr_request",
      targetId: requestId,
      reason: notes,
    });
  },
});

export const failGdprRequest = mutation({
  args: {
    requestId: v.id("gdpr_requests"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { requestId, notes }) => {
    const adminId = await requireAnyRole(ctx, [
      "super_admin",
      "ops_admin",
      "support_admin",
      "billing_admin",
    ]);
    await ctx.db.patch(requestId, {
      status: "failed",
      notes,
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "gdpr.request_fail",
      targetType: "gdpr_request",
      targetId: requestId,
      reason: notes,
    });
  },
});
