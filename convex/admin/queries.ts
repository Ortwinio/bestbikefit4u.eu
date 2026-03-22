import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { query } from "../_generated/server";
import { requireAdminUserId, requireAnyRole } from "./authz";

type AdminUserSummary = Pick<
  Doc<"users">,
  "_id" | "email" | "name" | "displayName" | "adminRole"
>;

async function getUserMap(ctx: QueryCtx) {
  const users = await ctx.db.query("users").collect();
  return new Map<Id<"users">, Doc<"users">>(users.map((user) => [user._id, user]));
}

function matchesSearch(value: string | undefined, search: string | undefined) {
  if (!search) return true;
  return (value ?? "").toLowerCase().includes(search.toLowerCase());
}

async function requireBillingAdminRead(ctx: QueryCtx) {
  return requireAnyRole(ctx, ["super_admin", "ops_admin", "billing_admin", "analyst"]);
}

async function requirePeopleRead(ctx: QueryCtx) {
  return requireAnyRole(ctx, ["super_admin", "ops_admin", "support_admin", "analyst"]);
}

async function requireBikeRead(ctx: QueryCtx) {
  return requireAnyRole(ctx, ["super_admin", "fit_specialist", "geometry_manager", "analyst"]);
}

async function requireGovernanceRead(ctx: QueryCtx) {
  return requireAnyRole(ctx, [
    "super_admin",
    "ops_admin",
    "qa_manager",
    "geometry_manager",
    "fit_specialist",
    "support_admin",
    "analyst",
  ]);
}

async function requireMessagingRead(ctx: QueryCtx) {
  return requireAnyRole(ctx, ["super_admin", "ops_admin", "support_admin", "qa_manager"]);
}

async function requireGdprAdminRead(ctx: QueryCtx) {
  return requireAnyRole(ctx, ["super_admin", "ops_admin", "support_admin", "billing_admin"]);
}

export const getCurrentAdminUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAdminUserId(ctx);
    const user = (await ctx.db.get(userId)) as AdminUserSummary | null;
    if (!user?.adminRole) return null;

    return {
      _id: user._id,
      email: user.email,
      name: user.displayName ?? user.name ?? user.email ?? "Admin",
      adminRole: user.adminRole,
    };
  },
});

export const getOverviewStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminUserId(ctx);

    const [
      users,
      fitSessions,
      integrations,
      feedbackItems,
      releases,
      geometryBrands,
      geometryRecords,
      engineVersions,
    ] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("fitSessions").collect(),
      ctx.db.query("integrations").collect(),
      ctx.db.query("feedback_items").collect(),
      ctx.db.query("releases").collect(),
      ctx.db.query("geometry_brands").collect(),
      ctx.db.query("geometry_records").collect(),
      ctx.db.query("engine_versions").collect(),
    ]);

    const manualReviewQueue = fitSessions
      .filter((session) => session.reviewStatus === "required")
      .sort((a, b) => (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt))
      .slice(0, 5);
    const recentFeedback = feedbackItems
      .filter((item) => item.status === "new")
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
    const activeReleasesList = releases
      .filter((release) => release.status === "rolling_out" || release.status === "live")
      .sort((a, b) => (b.rolloutDate ?? b.createdAt) - (a.rolloutDate ?? a.createdAt))
      .slice(0, 5);

    return {
      totalUsers: users.length,
      freeUsers: users.filter((user) => user.tier === "free" || !user.tier).length,
      paidUsers: users.filter((user) => user.tier === "pro" || user.tier === "premium").length,
      completedFits: fitSessions.filter((session) => session.status === "completed").length,
      stravaConnected: integrations.filter((item) => item.accessStatus === "active").length,
      openFeedbackCount: feedbackItems.filter(
        (item) => item.status === "new" || item.status === "triaged"
      ).length,
      activeReleases: activeReleasesList.length,
      lowConfidenceFits: fitSessions.filter(
        (session) =>
          session.status === "completed" &&
          session.confidenceScore !== undefined &&
          session.confidenceScore < 0.65
      ).length,
      manualReviewQueueCount: manualReviewQueue.length,
      manualReviewQueue,
      recentFeedback,
      activeReleasesList,
      geometryBrandCount: geometryBrands.length,
      geometryActiveBrandCount: new Set(
        geometryRecords
          .filter((record) => record.status === "active")
          .map((record) => record.brandId)
      ).size,
      activeEngineVersion:
        engineVersions.find((version) => version.status === "active") ?? null,
      draftEngineVersion: engineVersions.find((version) => version.status === "qa") ?? null,
    };
  },
});

export const getRecentAuditLogs = query({
  args: {},
  handler: async (ctx) => {
    await requireMessagingRead(ctx);
    const userMap = await getUserMap(ctx);
    const logs = await ctx.db
      .query("admin_audit_logs")
      .withIndex("by_occurred_at")
      .order("desc")
      .take(20);

    return logs.map((log) => ({
      ...log,
      adminName:
        userMap.get(log.adminUserId)?.displayName ??
        userMap.get(log.adminUserId)?.name ??
        userMap.get(log.adminUserId)?.email ??
        "Unknown admin",
    }));
  },
});

export const listUsers = query({
  args: {
    search: v.optional(v.string()),
    tier: v.optional(v.string()),
    adminRole: v.optional(v.string()),
    suspended: v.optional(v.boolean()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requirePeopleRead(ctx);

    return await ctx.db
      .query("users")
      .filter((q) => {
        const predicates = [];
        if (args.search) {
          const needle = args.search.toLowerCase();
          predicates.push(
            q.or(
              q.eq(q.field("email"), args.search),
              q.eq(q.field("name"), args.search),
              q.eq(q.field("displayName"), args.search),
              q.gte(q.field("email"), needle)
            )
          );
        }
        if (args.tier) {
          predicates.push(q.eq(q.field("tier"), args.tier));
        }
        if (args.adminRole === "admin_only") {
          predicates.push(q.neq(q.field("adminRole"), undefined));
        } else if (args.adminRole === "none") {
          predicates.push(q.eq(q.field("adminRole"), undefined));
        } else if (args.adminRole) {
          predicates.push(q.eq(q.field("adminRole"), args.adminRole));
        }
        if (args.suspended === true) {
          predicates.push(q.neq(q.field("suspendedAt"), undefined));
        }
        if (args.suspended === false) {
          predicates.push(q.eq(q.field("suspendedAt"), undefined));
        }
        return predicates.length > 0 ? q.and(...predicates) : q.eq(q.field("email"), q.field("email"));
      })
      .paginate(args.paginationOpts);
  },
});

export const getUserDetail = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await requirePeopleRead(ctx);
    const [user, bikes, fitRuns, integration, subscriptions, feedbackItems, receipts, auditLogs] =
      await Promise.all([
        ctx.db.get(userId),
        ctx.db.query("bikes").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
        ctx.db
          .query("fitSessions")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect(),
        ctx.db
          .query("integrations")
          .withIndex("by_user_and_provider", (q) =>
            q.eq("userId", userId).eq("provider", "strava")
          )
          .unique(),
        ctx.db
          .query("subscriptions")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect(),
        ctx.db.query("feedback_items").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
        ctx.db
          .query("message_receipts")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect(),
        ctx.db
          .query("admin_audit_logs")
          .withIndex("by_target", (q) => q.eq("targetType", "user").eq("targetId", userId))
          .collect(),
      ]);

    return {
      user,
      bikes,
      fitRuns,
      bikeCount: bikes.length,
      fitRunCount: fitRuns.length,
      stravaConnected: integration?.accessStatus === "active",
      integration,
      subscriptions,
      feedbackItems,
      messageReceipts: receipts,
      auditLogs: auditLogs.sort((a, b) => b.occurredAt - a.occurredAt),
    };
  },
});

export const listOrganizations = query({
  args: {
    type: v.optional(v.string()),
    suspended: v.optional(v.boolean()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requirePeopleRead(ctx);
    return await ctx.db
      .query("organizations")
      .filter((q) => {
        const predicates = [];
        if (args.type) predicates.push(q.eq(q.field("type"), args.type));
        if (args.suspended === true) predicates.push(q.neq(q.field("suspendedAt"), undefined));
        if (args.suspended === false) predicates.push(q.eq(q.field("suspendedAt"), undefined));
        return predicates.length > 0 ? q.and(...predicates) : q.eq(q.field("slug"), q.field("slug"));
      })
      .paginate(args.paginationOpts);
  },
});

export const getOrganizationDetail = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, { orgId }) => {
    await requirePeopleRead(ctx);
    const [organization, members, subscriptions, auditLogs] = await Promise.all([
      ctx.db.get(orgId),
      ctx.db
        .query("organization_members")
        .withIndex("by_org", (q) => q.eq("organizationId", orgId))
        .collect(),
      ctx.db.query("subscriptions").withIndex("by_org", (q) => q.eq("organizationId", orgId)).collect(),
      ctx.db
        .query("admin_audit_logs")
        .withIndex("by_target", (q) => q.eq("targetType", "organization").eq("targetId", orgId))
        .collect(),
    ]);
    return { organization, members, subscriptions, auditLogs };
  },
});

export const listOrgMembers = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, { orgId }) => {
    await requirePeopleRead(ctx);
    const userMap = await getUserMap(ctx);
    const members = await ctx.db
      .query("organization_members")
      .withIndex("by_org", (q) => q.eq("organizationId", orgId))
      .collect();
    return members.map((member) => ({
      ...member,
      user: userMap.get(member.userId) ?? null,
    }));
  },
});

export const listAllBikes = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    hasGeometry: v.optional(v.boolean()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireBikeRead(ctx);
    return await ctx.db
      .query("bikes")
      .filter((q) => {
        const predicates = [];
        if (args.category) predicates.push(q.eq(q.field("bikeType"), args.category));
        if (args.hasGeometry === true) {
          predicates.push(q.neq(q.field("geometryRecordId"), undefined));
        }
        if (args.hasGeometry === false) {
          predicates.push(q.eq(q.field("geometryRecordId"), undefined));
        }
        return predicates.length > 0 ? q.and(...predicates) : q.eq(q.field("name"), q.field("name"));
      })
      .paginate(args.paginationOpts);
  },
});

export const getAdminBikeDetail = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, { bikeId }) => {
    await requireBikeRead(ctx);
    const bike = await ctx.db.get(bikeId);
    if (!bike) return null;
    const [owner, fitRuns, geometryRecord] = await Promise.all([
      ctx.db.get(bike.userId),
      ctx.db
        .query("fitSessions")
        .withIndex("by_user_bike", (q) => q.eq("userId", bike.userId).eq("bikeId", bikeId))
        .collect(),
      bike.geometryRecordId ? ctx.db.get(bike.geometryRecordId) : null,
    ]);
    return { bike, owner, fitRuns, geometryRecord };
  },
});

export const getAdminRiderData = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await requireGovernanceRead(ctx);
    const [user, profile, bikes, sessions] = await Promise.all([
      ctx.db.get(userId),
      ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db.query("bikes").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("fitSessions").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
    ]);
    if (!profile) return null;

    const primarySession = sessions[0] ?? null;
    const questionnaireResponses = primarySession
      ? await ctx.db
          .query("questionnaireResponses")
          .withIndex("by_session", (q) => q.eq("sessionId", primarySession._id))
          .collect()
      : [];
    const recommendations = primarySession
      ? await ctx.db
          .query("recommendations")
          .withIndex("by_session", (q) => q.eq("sessionId", primarySession._id))
          .collect()
      : [];
    const validationCaptures = primarySession
      ? await ctx.db
          .query("validationCaptures")
          .withIndex("by_session", (q) => q.eq("sessionId", primarySession._id))
          .collect()
      : [];
    const rideFeedbackEntries = primarySession
      ? await ctx.db
          .query("rideFeedbackEntries")
          .withIndex("by_session", (q) => q.eq("sessionId", primarySession._id))
          .collect()
      : [];
    const emailReports = primarySession
      ? await ctx.db
          .query("emailReports")
          .withIndex("by_session", (q) => q.eq("sessionId", primarySession._id))
          .collect()
      : [];

    const measurementFlags = [
      profile.heightCm && profile.inseamCm > profile.heightCm * 0.55
        ? "inseam_outlier"
        : null,
      profile.heightCm === 0 || profile.inseamCm === 0 ? "zero_measurement" : null,
      profile.injuryHistory?.some((entry) => entry.isOngoing) ? "ongoing_injury" : null,
    ].filter(Boolean);

    return {
      user,
      profile,
      bikes,
      fitSessions: sessions,
      questionnaireResponses,
      recommendations,
      validationCaptures,
      rideFeedbackEntries,
      emailReports,
      measurementFlags,
    };
  },
});

export const listGeometryBrands = query({
  args: {},
  handler: async (ctx) => {
    await requireGovernanceRead(ctx);
    return await ctx.db.query("geometry_brands").collect();
  },
});

export const listGeometryModels = query({
  args: { brandId: v.id("geometry_brands") },
  handler: async (ctx, { brandId }) => {
    await requireGovernanceRead(ctx);
    return await ctx.db
      .query("geometry_models")
      .withIndex("by_brand", (q) => q.eq("brandId", brandId))
      .collect();
  },
});

export const listGeometryRecords = query({
  args: { modelId: v.id("geometry_models") },
  handler: async (ctx, { modelId }) => {
    await requireGovernanceRead(ctx);
    return await ctx.db
      .query("geometry_records")
      .withIndex("by_model", (q) => q.eq("modelId", modelId))
      .collect();
  },
});

export const getGeometryRecordDetail = query({
  args: { recordId: v.id("geometry_records") },
  handler: async (ctx, { recordId }) => {
    await requireGovernanceRead(ctx);
    const record = await ctx.db.get(recordId);
    if (!record) return null;
    const history = await ctx.db
      .query("geometry_records")
      .withIndex("by_model_size", (q) =>
        q.eq("modelId", record.modelId).eq("sizeLabel", record.sizeLabel)
      )
      .collect();
    return { record, versionHistory: history.sort((a, b) => b.version - a.version) };
  },
});

export const listFitRuns = query({
  args: {
    userId: v.optional(v.id("users")),
    engineVersionId: v.optional(v.id("engine_versions")),
    reviewStatus: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireGovernanceRead(ctx);
    return await ctx.db
      .query("fitSessions")
      .filter((q) => {
        const predicates = [];
        if (args.userId) predicates.push(q.eq(q.field("userId"), args.userId));
        if (args.engineVersionId) {
          predicates.push(q.eq(q.field("engineVersionId"), args.engineVersionId));
        }
        if (args.reviewStatus) {
          predicates.push(q.eq(q.field("reviewStatus"), args.reviewStatus));
        }
        return predicates.length > 0 ? q.and(...predicates) : q.eq(q.field("status"), q.field("status"));
      })
      .paginate(args.paginationOpts);
  },
});

export const getFitRunTrace = query({
  args: { sessionId: v.id("fitSessions") },
  handler: async (ctx, { sessionId }) => {
    await requireGovernanceRead(ctx);
    const session = await ctx.db.get(sessionId);
    if (!session) return null;
    const [user, bike, profile, engineVersion] = await Promise.all([
      ctx.db.get(session.userId),
      session.bikeId ? ctx.db.get(session.bikeId) : null,
      ctx.db.get(session.profileId),
      session.engineVersionId ? ctx.db.get(session.engineVersionId) : null,
    ]);
    return { session, user, bike, profile, engineVersion };
  },
});

export const listEngineVersions = query({
  args: {},
  handler: async (ctx) => {
    await requireGovernanceRead(ctx);
    return await ctx.db.query("engine_versions").collect();
  },
});

export const getEngineVersionDetail = query({
  args: { versionId: v.id("engine_versions") },
  handler: async (ctx, { versionId }) => {
    await requireGovernanceRead(ctx);
    const version = await ctx.db.get(versionId);
    if (!version) return null;
    const fitRuns = await ctx.db
      .query("fitSessions")
      .withIndex("by_engine_version", (q) => q.eq("engineVersionId", versionId))
      .collect();
    return { version, fitRuns };
  },
});

export const listFeedbackItems = query({
  args: {
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireGovernanceRead(ctx);
    return await ctx.db
      .query("feedback_items")
      .filter((q) => {
        const predicates = [];
        if (args.type) predicates.push(q.eq(q.field("type"), args.type));
        if (args.status) predicates.push(q.eq(q.field("status"), args.status));
        if (args.assignedTo) predicates.push(q.eq(q.field("assignedTo"), args.assignedTo));
        return predicates.length > 0 ? q.and(...predicates) : q.eq(q.field("title"), q.field("title"));
      })
      .paginate(args.paginationOpts);
  },
});

export const getFeedbackDetail = query({
  args: { feedbackItemId: v.id("feedback_items") },
  handler: async (ctx, { feedbackItemId }) => {
    await requireGovernanceRead(ctx);
    const item = await ctx.db.get(feedbackItemId);
    if (!item) return null;
    const [comments, user, release] = await Promise.all([
      ctx.db
        .query("feedback_comments")
        .withIndex("by_feedback_item", (q) => q.eq("feedbackItemId", feedbackItemId))
        .collect(),
      item.userId ? ctx.db.get(item.userId) : null,
      item.linkedReleaseId ? ctx.db.get(item.linkedReleaseId) : null,
    ]);
    return { item, comments, user, release };
  },
});

export const listReleases = query({
  args: {
    status: v.optional(v.string()),
    type: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireGovernanceRead(ctx);
    return await ctx.db
      .query("releases")
      .filter((q) => {
        const predicates = [];
        if (args.status) predicates.push(q.eq(q.field("status"), args.status));
        if (args.type) predicates.push(q.eq(q.field("type"), args.type));
        return predicates.length > 0 ? q.and(...predicates) : q.eq(q.field("name"), q.field("name"));
      })
      .paginate(args.paginationOpts);
  },
});

export const getReleaseDetail = query({
  args: { releaseId: v.id("releases") },
  handler: async (ctx, { releaseId }) => {
    await requireGovernanceRead(ctx);
    const release = await ctx.db.get(releaseId);
    if (!release) return null;
    const linkedItems = await ctx.db
      .query("release_items")
      .withIndex("by_release", (q) => q.eq("releaseId", releaseId))
      .collect();
    return { release, linkedItems };
  },
});

export const listDashboardMessages = query({
  args: {
    status: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireMessagingRead(ctx);
    return await ctx.db
      .query("dashboard_messages")
      .filter((q) =>
        args.status ? q.eq(q.field("status"), args.status) : q.eq(q.field("title"), q.field("title"))
      )
      .paginate(args.paginationOpts);
  },
});

export const getDashboardMessageDetail = query({
  args: { messageId: v.id("dashboard_messages") },
  handler: async (ctx, { messageId }) => {
    await requireMessagingRead(ctx);
    const [message, targets, receipts] = await Promise.all([
      ctx.db.get(messageId),
      ctx.db.query("message_targets").withIndex("by_message", (q) => q.eq("messageId", messageId)).collect(),
      ctx.db.query("message_receipts").withIndex("by_message", (q) => q.eq("messageId", messageId)).collect(),
    ]);
    return { message, targets, receipts };
  },
});

export const estimateMessageReach = query({
  args: {
    targets: v.array(
      v.object({
        targetType: v.string(),
        targetValue: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { targets }) => {
    await requireMessagingRead(ctx);
    const [users, integrations, fitSessions, memberships, bikes] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("integrations").collect(),
      ctx.db.query("fitSessions").collect(),
      ctx.db.query("organization_members").collect(),
      ctx.db.query("bikes").collect(),
    ]);
    const activeIntegrations = new Set(
      integrations.filter((integration) => integration.accessStatus === "active").map((integration) => integration.userId)
    );
    const usersWithFit = new Set(fitSessions.map((session) => session.userId));
    const membershipsByUser = new Map<string, Set<string>>();
    for (const membership of memberships) {
      const key = String(membership.userId);
      const current = membershipsByUser.get(key) ?? new Set<string>();
      current.add(String(membership.organizationId));
      membershipsByUser.set(key, current);
    }
    const bikesByUser = new Map<string, Array<(typeof bikes)[number]>>();
    for (const bike of bikes) {
      const key = String(bike.userId);
      const current = bikesByUser.get(key) ?? [];
      current.push(bike);
      bikesByUser.set(key, current);
    }

    const matched = new Set<string>();
    for (const user of users) {
      const matches = targets.some((target) => {
        switch (target.targetType) {
          case "all":
            return true;
          case "user":
            return target.targetValue === String(user._id);
          case "plan":
            return target.targetValue === user.tier;
          case "organization":
            return Boolean(
              target.targetValue &&
                membershipsByUser.get(String(user._id))?.has(target.targetValue)
            );
          case "locale":
            return true;
          case "strava_connected":
            return target.targetValue === String(activeIntegrations.has(user._id));
          case "fit_completed":
            return target.targetValue === String(usersWithFit.has(user._id));
          case "bike_type":
            return Boolean(
              target.targetValue &&
                bikesByUser
                  .get(String(user._id))
                  ?.some((bike) => bike.bikeType === target.targetValue)
            );
          default:
            return false;
        }
      });
      if (matches) matched.add(String(user._id));
    }
    return { estimatedReach: matched.size };
  },
});

export const listAuditLogs = query({
  args: {
    adminUserId: v.optional(v.id("users")),
    targetType: v.optional(v.string()),
    targetId: v.optional(v.string()),
    actionPrefix: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireMessagingRead(ctx);
    return await ctx.db
      .query("admin_audit_logs")
      .filter((q) => {
        const predicates = [];
        if (args.adminUserId) predicates.push(q.eq(q.field("adminUserId"), args.adminUserId));
        if (args.targetType) predicates.push(q.eq(q.field("targetType"), args.targetType));
        if (args.targetId) predicates.push(q.eq(q.field("targetId"), args.targetId));
        if (args.actionPrefix) {
          predicates.push(q.gte(q.field("action"), args.actionPrefix));
          predicates.push(q.lt(q.field("action"), `${args.actionPrefix}\uffff`));
        }
        return predicates.length > 0 ? q.and(...predicates) : q.eq(q.field("action"), q.field("action"));
      })
      .paginate(args.paginationOpts);
  },
});

export const getFeatureFlags = query({
  args: {},
  handler: async (ctx) => {
    await requireBillingAdminRead(ctx);
    return await ctx.db.query("feature_flags").collect();
  },
});

export const listPlans = query({
  args: {},
  handler: async (ctx) => {
    await requireBillingAdminRead(ctx);
    const plans = await ctx.db.query("plans").collect();
    return plans.sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  },
});

export const getPlanDetail = query({
  args: { planId: v.id("plans") },
  handler: async (ctx, { planId }) => {
    await requireBillingAdminRead(ctx);
    const [plan, subscriptions, billingEvents] = await Promise.all([
      ctx.db.get(planId),
      ctx.db.query("subscriptions").withIndex("by_plan", (q) => q.eq("planId", planId)).collect(),
      ctx.db.query("billing_events").collect(),
    ]);
    if (!plan) return null;
    const subscriptionIds = new Set(subscriptions.map((subscription) => subscription._id));
    return {
      plan,
      subscriptions,
      billingEvents: billingEvents.filter(
        (event) => event.subscriptionId && subscriptionIds.has(event.subscriptionId)
      ),
    };
  },
});

export const listSubscriptions = query({
  args: {
    userId: v.optional(v.id("users")),
    organizationId: v.optional(v.id("organizations")),
    status: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireBillingAdminRead(ctx);
    return await ctx.db
      .query("subscriptions")
      .filter((q) => {
        const predicates = [];
        if (args.userId) predicates.push(q.eq(q.field("userId"), args.userId));
        if (args.organizationId) predicates.push(q.eq(q.field("organizationId"), args.organizationId));
        if (args.status) predicates.push(q.eq(q.field("status"), args.status));
        return predicates.length > 0 ? q.and(...predicates) : q.eq(q.field("status"), q.field("status"));
      })
      .paginate(args.paginationOpts);
  },
});

export const getSubscriptionDetail = query({
  args: { subscriptionId: v.id("subscriptions") },
  handler: async (ctx, { subscriptionId }) => {
    await requireBillingAdminRead(ctx);
    const subscription = await ctx.db.get(subscriptionId);
    if (!subscription) return null;
    const [user, organization, plan, events] = await Promise.all([
      subscription.userId ? ctx.db.get(subscription.userId) : Promise.resolve(null),
      subscription.organizationId ? ctx.db.get(subscription.organizationId) : Promise.resolve(null),
      ctx.db.get(subscription.planId),
      ctx.db
        .query("billing_events")
        .withIndex("by_subscription", (q) => q.eq("subscriptionId", subscriptionId))
        .collect(),
    ]);
    return { subscription, user, organization, plan, events };
  },
});

export const listBillingEvents = query({
  args: {
    subscriptionId: v.optional(v.id("subscriptions")),
    userId: v.optional(v.id("users")),
    organizationId: v.optional(v.id("organizations")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireBillingAdminRead(ctx);
    return await ctx.db
      .query("billing_events")
      .filter((q) => {
        const predicates = [];
        if (args.subscriptionId) predicates.push(q.eq(q.field("subscriptionId"), args.subscriptionId));
        if (args.userId) predicates.push(q.eq(q.field("userId"), args.userId));
        if (args.organizationId) predicates.push(q.eq(q.field("organizationId"), args.organizationId));
        return predicates.length > 0 ? q.and(...predicates) : q.eq(q.field("eventType"), q.field("eventType"));
      })
      .paginate(args.paginationOpts);
  },
});

export const listGdprRequests = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireGdprAdminRead(ctx);
    return await ctx.db
      .query("gdpr_requests")
      .withIndex("by_received_at")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getGdprRequestDetail = query({
  args: { requestId: v.id("gdpr_requests") },
  handler: async (ctx, { requestId }) => {
    await requireGdprAdminRead(ctx);
    const request = await ctx.db.get(requestId);
    if (!request) return null;
    const subjectUser = request.subjectUserId ? await ctx.db.get(request.subjectUserId) : null;
    const creator = await ctx.db.get(request.createdBy);
    return { request, subjectUser, creator };
  },
});

export const listAdminRiderQueue = query({
  args: {},
  handler: async (ctx) => {
    await requireGovernanceRead(ctx);
    const [users, profiles, bikes, sessions, feedbackItems] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("profiles").collect(),
      ctx.db.query("bikes").collect(),
      ctx.db.query("fitSessions").collect(),
      ctx.db.query("feedback_items").collect(),
    ]);
    const userById = new Map(users.map((user) => [String(user._id), user]));
    const bikesByUser = new Map<string, number>();
    for (const bike of bikes) {
      const key = String(bike.userId);
      bikesByUser.set(key, (bikesByUser.get(key) ?? 0) + 1);
    }
    const sessionsByUser = new Map<string, number>();
    for (const session of sessions) {
      const key = String(session.userId);
      sessionsByUser.set(key, (sessionsByUser.get(key) ?? 0) + 1);
    }
    const feedbackByUser = new Map<string, number>();
    for (const item of feedbackItems) {
      if (!item.userId) continue;
      const key = String(item.userId);
      feedbackByUser.set(key, (feedbackByUser.get(key) ?? 0) + 1);
    }
    return profiles
      .map((profile) => {
        const user = userById.get(String(profile.userId)) ?? null;
        const measurementFlags = [
          profile.heightCm && profile.inseamCm > profile.heightCm * 0.55 ? "inseam_outlier" : null,
          profile.heightCm === 0 || profile.inseamCm === 0 ? "zero_measurement" : null,
          profile.injuryHistory?.some((entry) => entry.isOngoing) ? "ongoing_injury" : null,
        ].filter(Boolean);
        return {
          user,
          profile,
          bikesCount: bikesByUser.get(String(profile.userId)) ?? 0,
          fitRunsCount: sessionsByUser.get(String(profile.userId)) ?? 0,
          feedbackCount: feedbackByUser.get(String(profile.userId)) ?? 0,
          measurementFlags,
        };
      })
      .sort((a, b) => {
        const aScore = a.measurementFlags.length + a.feedbackCount + a.fitRunsCount;
        const bScore = b.measurementFlags.length + b.feedbackCount + b.fitRunsCount;
        return bScore - aScore;
      });
  },
});

export const listAdminUsers = listUsers;
export const getAdminUserDetail = getUserDetail;
export const listAdminOrganizations = listOrganizations;
export const getAdminOrganizationDetail = getOrganizationDetail;
export const listAdminOrgMembers = listOrgMembers;
export const listAdminBikes = listAllBikes;
export const listAdminGeometryBrands = listGeometryBrands;
export const listAdminGeometryModels = listGeometryModels;
export const listAdminGeometryRecords = listGeometryRecords;
export const getAdminGeometryRecord = getGeometryRecordDetail;
export const listAdminFitRuns = listFitRuns;
export const getAdminFitRunTrace = getFitRunTrace;
export const listAdminEngineVersions = listEngineVersions;
export const getAdminEngineVersionDetail = getEngineVersionDetail;
export const listAdminReleases = listReleases;
export const getAdminReleaseDetail = getReleaseDetail;
export const listAdminFeedbackItems = listFeedbackItems;
export const getAdminFeedbackDetail = getFeedbackDetail;
export const listAdminDashboardMessages = listDashboardMessages;
export const getAdminDashboardMessageDetail = getDashboardMessageDetail;
export const listAdminPlans = listPlans;
export const getAdminPlanDetail = getPlanDetail;
export const listAdminSubscriptions = listSubscriptions;
export const getAdminSubscriptionDetail = getSubscriptionDetail;
export const listAdminBillingEvents = listBillingEvents;
export const listAdminGdprRequests = listGdprRequests;
export const getAdminGdprRequestDetail = getGdprRequestDetail;
export const listAdminAuditLogs = listAuditLogs;
export const listAdminFeatureFlags = getFeatureFlags;
