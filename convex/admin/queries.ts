import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { query } from "../_generated/server";
import { requireAdminUserId, requireAnyRole } from "./authz";
import { buildOverviewSeries } from "./overviewSeries";

type AdminUserSummary = Pick<
  Doc<"users">,
  "_id" | "email" | "name" | "displayName" | "adminRole"
>;

async function getUserMap(ctx: QueryCtx) {
  const users = await ctx.db.query("users").collect();
  return new Map<Id<"users">, Doc<"users">>(users.map((user) => [user._id, user]));
}

function normalizeSearchTerm(search: string | undefined) {
  const trimmed = search?.trim();
  return trimmed ? trimmed.toLowerCase() : "";
}

function matchesUserSearch(user: Doc<"users">, search: string | undefined) {
  const needle = normalizeSearchTerm(search);
  if (!needle) {
    return true;
  }

  const candidateValues = [
    user.email,
    user.name,
    user.displayName,
    user.googleEmail,
    user.googleName,
    String(user._id),
  ];

  return candidateValues.some((value) => (value ?? "").toLowerCase().includes(needle));
}

function matchesUserFilters(
  user: Doc<"users">,
  args: {
    tier?: string;
    adminRole?: string;
    suspended?: boolean;
  }
) {
  if (args.tier && user.tier !== args.tier) {
    return false;
  }

  if (args.adminRole === "admin_only" && !user.adminRole) {
    return false;
  }

  if (args.adminRole === "none" && user.adminRole) {
    return false;
  }

  if (args.adminRole &&
    args.adminRole !== "admin_only" &&
    args.adminRole !== "none" &&
    user.adminRole !== args.adminRole
  ) {
    return false;
  }

  if (args.suspended === true && !user.suspendedAt) {
    return false;
  }

  if (args.suspended === false && user.suspendedAt) {
    return false;
  }

  return true;
}

function sortUsersForAdminSearch(a: Doc<"users">, b: Doc<"users">) {
  const createdAtA = a.createdAt ?? 0;
  const createdAtB = b.createdAt ?? 0;
  if (createdAtA !== createdAtB) {
    return createdAtB - createdAtA;
  }

  return String(a._id).localeCompare(String(b._id));
}

function paginateInMemory<T>(
  rows: T[],
  paginationOpts: { cursor: string | null; numItems: number }
) {
  const start = paginationOpts.cursor ? Number.parseInt(paginationOpts.cursor, 10) : 0;
  const safeStart = Number.isFinite(start) && start >= 0 ? start : 0;
  const page = rows.slice(safeStart, safeStart + paginationOpts.numItems);
  const nextIndex = safeStart + page.length;

  return {
    page,
    isDone: nextIndex >= rows.length,
    continueCursor: nextIndex < rows.length ? String(nextIndex) : "",
    splitCursor: null,
    pageStatus: null,
  };
}

function parseWarningsJson(value?: string | null) {
  if (!value) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === "string") : [];
  } catch {
    return [];
  }
}

function sortByCreatedAtDesc<T extends { createdAt?: number }>(rows: T[]) {
  return [...rows].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
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
      bikes,
      fitSessions,
      integrations,
      feedbackItems,
      releases,
      geometryBrands,
      geometryRecords,
      engineVersions,
    ] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("bikes").collect(),
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
    const overviewSeries = buildOverviewSeries({
      userCreatedAt: users.map((user) => ({ timestamp: user.createdAt ?? user._creationTime })),
      userLastLoginAt: users.map((user) => ({ timestamp: user.lastLoginAt ?? null })),
      bikeCreatedAt: bikes.map((bike) => ({ timestamp: bike._creationTime })),
    });

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
      overviewSeries,
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

    const search = normalizeSearchTerm(args.search);
    if (search) {
      const users = await ctx.db.query("users").collect();
      const filtered = users
        .filter((user) => matchesUserSearch(user, search) && matchesUserFilters(user, args))
        .sort(sortUsersForAdminSearch);
      return paginateInMemory(filtered, args.paginationOpts);
    }

    return await ctx.db
      .query("users")
      .filter((q) => {
        const predicates = [];
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
      .order("desc")
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
      .order("desc")
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

export const getGeometryHubSummary = query({
  args: {},
  handler: async (ctx) => {
    await requireGovernanceRead(ctx);

    const [brands, models, records] = await Promise.all([
      ctx.db.query("geometry_brands").collect(),
      ctx.db.query("geometry_models").collect(),
      ctx.db.query("geometry_records").collect(),
    ]);

    const brandsById = new Map(brands.map((brand) => [String(brand._id), brand]));
    const modelsById = new Map(models.map((model) => [String(model._id), model]));
    const recentRecords = [...records]
      .sort((left, right) => right.createdAt - left.createdAt)
      .slice(0, 12)
      .map((record) => {
        const brand = brandsById.get(String(record.brandId)) ?? null;
        const model = modelsById.get(String(record.modelId)) ?? null;
        return {
          _id: record._id,
          brandName: brand?.name ?? "Unknown brand",
          modelName: model?.name ?? "Unknown model",
          sizeLabel: record.sizeLabel,
          status: record.status,
          source: record.source,
          version: record.version,
          createdAt: record.createdAt,
        };
      });

    return {
      brandCount: brands.length,
      modelCount: models.length,
      recordCount: records.length,
      draftRecordCount: records.filter((record) => record.status === "draft").length,
      activeRecordCount: records.filter((record) => record.status === "active").length,
      recentRecords,
    };
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

export const listGeometryModelsForFilter = query({
  args: { brandId: v.optional(v.id("geometry_brands")) },
  handler: async (ctx, { brandId }) => {
    await requireGovernanceRead(ctx);

    const models = brandId
      ? await ctx.db
          .query("geometry_models")
          .withIndex("by_brand", (q) => q.eq("brandId", brandId))
          .collect()
      : await ctx.db.query("geometry_models").collect();

    return models.sort((left, right) => {
      if (left.name !== right.name) {
        return left.name.localeCompare(right.name);
      }
      return (right.yearStart ?? right.yearEnd ?? 0) - (left.yearStart ?? left.yearEnd ?? 0);
    });
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

function formatGeometryAdminYearLabel(yearStart?: number, yearEnd?: number) {
  if (yearStart && yearEnd && yearStart !== yearEnd) {
    return `${yearStart}-${yearEnd}`;
  }
  if (yearStart) {
    return String(yearStart);
  }
  if (yearEnd) {
    return String(yearEnd);
  }
  return "Unknown";
}

export const listGeometryRecordsForAdminReview = query({
  args: {
    brandId: v.optional(v.id("geometry_brands")),
    modelId: v.optional(v.id("geometry_models")),
    year: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("superseded"),
        v.literal("rejected")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireGovernanceRead(ctx);

    const [brands, models, records] = await Promise.all([
      ctx.db.query("geometry_brands").collect(),
      ctx.db.query("geometry_models").collect(),
      ctx.db.query("geometry_records").collect(),
    ]);

    const brandsById = new Map(brands.map((brand) => [String(brand._id), brand]));
    const modelsById = new Map(models.map((model) => [String(model._id), model]));

    const filteredRecords = records
      .filter((record) => {
        if (args.brandId && String(record.brandId) !== String(args.brandId)) {
          return false;
        }
        if (args.modelId && String(record.modelId) !== String(args.modelId)) {
          return false;
        }
        if (args.status && record.status !== args.status) {
          return false;
        }

        const model = modelsById.get(String(record.modelId));
        if (!model) {
          return false;
        }

        if (args.year !== undefined) {
          const yearStart = model.yearStart ?? model.yearEnd;
          const yearEnd = model.yearEnd ?? model.yearStart;
          if (yearStart !== undefined && yearEnd !== undefined) {
            if (args.year < yearStart || args.year > yearEnd) {
              return false;
            }
          } else {
            return false;
          }
        }

        return true;
      })
      .map((record) => {
        const brand = brandsById.get(String(record.brandId)) ?? null;
        const model = modelsById.get(String(record.modelId)) ?? null;
        return {
          _id: record._id,
          brandId: record.brandId,
          modelId: record.modelId,
          brandName: brand?.name ?? "Unknown brand",
          modelName: model?.name ?? "Unknown model",
          modelYearStart: model?.yearStart ?? null,
          modelYearEnd: model?.yearEnd ?? null,
          modelYearLabel: formatGeometryAdminYearLabel(model?.yearStart, model?.yearEnd),
          sizeLabel: record.sizeLabel,
          stack: record.stack ?? null,
          reach: record.reach ?? null,
          status: record.status,
          source: record.source,
          sourceUrl: record.sourceUrl ?? null,
          version: record.version,
          createdAt: record.createdAt,
        };
      })
      .sort((left, right) => {
        if (left.brandName !== right.brandName) {
          return left.brandName.localeCompare(right.brandName);
        }
        if (left.modelName !== right.modelName) {
          return left.modelName.localeCompare(right.modelName);
        }
        if (left.modelYearLabel !== right.modelYearLabel) {
          return left.modelYearLabel.localeCompare(right.modelYearLabel);
        }
        if (left.sizeLabel !== right.sizeLabel) {
          return left.sizeLabel.localeCompare(right.sizeLabel, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        }
        return right.version - left.version;
      });

    return filteredRecords;
  },
});

export const getGeometryRecordsForExport = query({
  args: { recordIds: v.array(v.id("geometry_records")) },
  handler: async (ctx, { recordIds }) => {
    await requireGovernanceRead(ctx);

    const [brands, models, records] = await Promise.all([
      ctx.db.query("geometry_brands").collect(),
      ctx.db.query("geometry_models").collect(),
      Promise.all(recordIds.map(async (recordId) => await ctx.db.get(recordId))),
    ]);

    const brandsById = new Map(brands.map((brand) => [String(brand._id), brand]));
    const modelsById = new Map(models.map((model) => [String(model._id), model]));

    return records
      .filter((record): record is NonNullable<typeof record> => record !== null)
      .map((record) => {
        const brand = brandsById.get(String(record.brandId)) ?? null;
        const model = modelsById.get(String(record.modelId)) ?? null;

        return {
          recordId: record._id,
          brandSlug: brand?.slug ?? "",
          brandName: brand?.name ?? "",
          modelName: model?.name ?? "",
          modelYear: model?.yearStart ?? model?.yearEnd ?? null,
          category: model?.category ?? "other",
          sizeLabel: record.sizeLabel,
          stack: record.stack ?? null,
          reach: record.reach ?? null,
          seatTubeAngle: record.seatTubeAngle ?? null,
          headTubeAngle: record.headTubeAngle ?? null,
          wheelbase: record.wheelbase ?? null,
          chainstay: record.chainstay ?? null,
          bbDrop: record.bbDrop ?? null,
          effectiveTopTube: record.effectiveTopTube ?? null,
          standover: record.standover ?? null,
          forkRake: record.forkRake ?? null,
          headTubeLength: record.headTubeLength ?? null,
          source: record.source,
          sourceUrl: record.sourceUrl ?? null,
          createdAt: record.createdAt,
        };
      })
      .sort((left, right) => right.createdAt - left.createdAt);
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
    const [user, bike, profile, engineVersion, recommendations] = await Promise.all([
      ctx.db.get(session.userId),
      session.bikeId ? ctx.db.get(session.bikeId) : null,
      ctx.db.get(session.profileId),
      session.engineVersionId ? ctx.db.get(session.engineVersionId) : null,
      ctx.db
        .query("recommendations")
        .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
        .collect(),
    ]);
    const recommendation = sortByCreatedAtDesc(recommendations)[0] ?? null;
    const pressureCalculations = session.bikeId
      ? await ctx.db
          .query("pressureCalculations")
          .withIndex("by_bike", (q) => q.eq("bikeId", session.bikeId))
          .collect()
      : [];
    const latestPressureCalculation = sortByCreatedAtDesc(pressureCalculations)[0] ?? null;
    const pressureWarnings = parseWarningsJson(latestPressureCalculation?.warningsJson);
    const recommendationWarnings = recommendation?.pressureInsights?.warnings ?? [];

    return {
      session,
      user,
      bike,
      profile,
      engineVersion,
      recommendation,
      calculatedFit: recommendation?.calculatedFit ?? null,
      comparisonSnapshot: recommendation?.comparisonSnapshot ?? null,
      recommendationItems: recommendation?.recommendationItems ?? [],
      fitNotes: recommendation?.fitNotes ?? [],
      adjustmentPriorities: recommendation?.adjustmentPriorities ?? [],
      pressureInsights: recommendation?.pressureInsights ?? null,
      confidenceScore: recommendation?.confidenceScore ?? session.confidenceScore ?? null,
      pressureCalculation: latestPressureCalculation,
      pressureWarnings,
      warnings: [...recommendationWarnings, ...pressureWarnings],
    };
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

export const listAdminMarketingShowcaseBikes = query({
  args: {},
  handler: async (ctx) => {
    await requireAnyRole(ctx, [
      "super_admin",
      "ops_admin",
      "fit_specialist",
      "geometry_manager",
      "analyst",
    ]);

    // Use indexes to avoid full table scans
    const [eligibleBikes, bikesWithGeometry] = await Promise.all([
      ctx.db
        .query("bikes")
        .withIndex("by_marketing_eligible", (q) => q.eq("marketingEligible", true))
        .collect(),
      ctx.db
        .query("bikes")
        .withIndex("by_geometry_record")
        .collect(),
    ]);

    // Merge: eligible bikes + non-eligible bikes that have geometry and brand+model
    const eligibleIds = new Set(eligibleBikes.map((b) => b._id));
    const candidates = bikesWithGeometry.filter(
      (b) => !eligibleIds.has(b._id) && b.brand && b.model
    );

    const allRelevant = [...eligibleBikes, ...candidates];

    const rows = [];
    for (const bike of allRelevant) {
      const primaryPhoto = await ctx.db
        .query("bikePhotos")
        .withIndex("by_bike_primary", (q) =>
          q.eq("bikeId", bike._id).eq("isPrimary", true)
        )
        .first();

      const geometryRecord = bike.geometryRecordId
        ? await ctx.db.get(bike.geometryRecordId)
        : null;

      rows.push({
        _id: bike._id,
        name: bike.name,
        brand: bike.brand ?? null,
        model: bike.model ?? null,
        bikeType: bike.bikeType,
        photoStorageId: primaryPhoto?.storageId ?? bike.photoUrl ?? null,
        marketingEligible: bike.marketingEligible ?? false,
        marketingEligibleAt: bike.marketingEligibleAt ?? null,
        imageModerated: bike.imageModerated ?? false,
        hasGeometry: Boolean(bike.geometryRecordId),
        geometryStatus: geometryRecord?.status ?? null,
        updatedAt: bike.updatedAt,
      });
    }

    return rows;
  },
});
