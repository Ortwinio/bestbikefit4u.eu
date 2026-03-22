import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { writeAuditLog } from "./audit";
import { requireAnyRole, requireAdminRole, requireAdminUserId } from "./authz";

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
    await ctx.db.patch(releaseId, {
      status,
      liveAt: status === "live" ? Date.now() : undefined,
    });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "release.status_change",
      targetType: "release",
      targetId: releaseId,
      payload: { status },
    });
  },
});

export const linkFeedbackToRelease = mutation({
  args: { feedbackItemId: v.id("feedback_items"), releaseId: v.id("releases") },
  handler: async (ctx, { feedbackItemId, releaseId }) => {
    const adminId = await requireAnyRole(ctx, ["super_admin", "ops_admin", "qa_manager"]);
    await ctx.db.patch(feedbackItemId, { linkedReleaseId: releaseId, updatedAt: Date.now() });
    await ctx.db.insert("release_items", {
      releaseId,
      itemType: "feedback_item",
      itemId: feedbackItemId,
      createdAt: Date.now(),
    });
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
    const adminId = await requireAdminUserId(ctx);
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
    const adminId = await requireAdminUserId(ctx);
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
    targets: v.array(
      v.object({
        targetType: v.string(),
        targetValue: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { targets, ...message }) => {
    const adminId = await requireAdminUserId(ctx);
    const messageId = await ctx.db.insert("dashboard_messages", {
      ...message,
      status: message.startsAt ? "scheduled" : "draft",
      createdAt: Date.now(),
      createdBy: adminId,
    });
    for (const target of targets) {
      await ctx.db.insert("message_targets", {
        messageId,
        targetType: target.targetType,
        targetValue: target.targetValue,
        createdAt: Date.now(),
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
  },
});

export const publishDashboardMessage = mutation({
  args: { messageId: v.id("dashboard_messages") },
  handler: async (ctx, { messageId }) => {
    const adminId = await requireAdminUserId(ctx);
    await ctx.db.patch(messageId, { status: "published", publishedAt: Date.now() });
    await writeAuditLog(ctx, {
      adminUserId: adminId,
      action: "message.publish",
      targetType: "message",
      targetId: messageId,
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
