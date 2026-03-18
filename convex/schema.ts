import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const questionnaireResponseValue = v.union(
  v.string(),
  v.number(),
  v.array(v.string())
);

export default defineSchema({
  // Auth tables from @convex-dev/auth
  ...authTables,

  // Users table - extended with app-specific fields
  // Note: The auth library creates a base users table, we extend it
  users: defineTable({
    // Auth fields (managed by @convex-dev/auth)
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    name: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    // App-specific fields
    tokenIdentifier: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    lastLoginAt: v.optional(v.number()),
    tier: v.optional(v.union(v.literal("free"), v.literal("pro"), v.literal("premium"))),
    profile_image_url: v.optional(v.string()),
    theme_preference: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("system"))
    ),
    unit_preference: v.optional(
      v.union(v.literal("metric"), v.literal("imperial"))
    ),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("email", ["email"])
    .index("phone", ["phone"]),

  // User profiles - body measurements for bike fitting
  profiles: defineTable({
    userId: v.id("users"),

    // Required body measurements (in cm)
    heightCm: v.number(),
    inseamCm: v.number(),
    armLengthCm: v.number(),
    torsoLengthCm: v.number(),
    shoulderWidthCm: v.number(),

    // Optional measurements
    femurLengthCm: v.optional(v.number()),
    footLengthCm: v.optional(v.number()),
    handSpanCm: v.optional(v.number()),
    sitBoneWidthMm: v.optional(v.number()),

    // Flexibility assessment
    flexibilityScore: v.union(
      v.literal("very_limited"),
      v.literal("limited"),
      v.literal("average"),
      v.literal("good"),
      v.literal("excellent")
    ),

    // Core stability (1-5 scale)
    coreStabilityScore: v.number(),

    // Injury history
    injuryHistory: v.optional(
      v.array(
        v.object({
          bodyArea: v.string(),
          description: v.string(),
          severity: v.union(
            v.literal("mild"),
            v.literal("moderate"),
            v.literal("severe")
          ),
          isOngoing: v.boolean(),
        })
      )
    ),

    // Additional profile data
    age: v.optional(v.number()),
    weightKg: v.optional(v.number()),
    weightUpdatedAt: v.optional(v.number()),

    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Bikes - user's bicycles
  bikes: defineTable({
    userId: v.id("users"),

    name: v.string(),
    bikeType: v.union(
      v.literal("road"),
      v.literal("gravel"),
      v.literal("mountain"),
      v.literal("hybrid"),
      v.literal("tt_triathlon"),
      v.literal("cyclocross"),
      v.literal("touring"),
      v.literal("city")
    ),

    // Current geometry (optional - for existing bikes)
    currentGeometry: v.optional(
      v.object({
        stackMm: v.optional(v.number()),
        reachMm: v.optional(v.number()),
        seatTubeAngle: v.optional(v.number()),
        headTubeAngle: v.optional(v.number()),
        frameSize: v.optional(v.string()),
      })
    ),

    // Current component setup (optional)
    currentSetup: v.optional(
      v.object({
        saddleHeightMm: v.optional(v.number()),
        saddleSetbackMm: v.optional(v.number()),
        stemLengthMm: v.optional(v.number()),
        stemAngle: v.optional(v.number()),
        handlebarWidthMm: v.optional(v.number()),
        crankLengthMm: v.optional(v.number()),
      })
    ),
    discipline: v.optional(
      v.union(
        v.literal("road"),
        v.literal("gravel"),
        v.literal("mtb"),
        v.literal("tt")
      )
    ),
    bikeWeightKg: v.optional(v.number()),
    photoUrl: v.optional(v.string()),
    fitProfileId: v.optional(v.id("profiles")),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  bikeProfiles: defineTable({
    userId: v.id("users"),
    bikeId: v.id("bikes"),
    name: v.string(),
    profileType: v.union(
      v.literal("base"),
      v.literal("mountain"),
      v.literal("endurance"),
      v.literal("performance"),
      v.literal("aero"),
      v.literal("indoor"),
      v.literal("technical"),
      v.literal("comfort"),
      v.literal("custom")
    ),
    isDefault: v.boolean(),
    status: v.union(v.literal("active"), v.literal("archived")),
    source: v.union(
      v.literal("manual"),
      v.literal("system_default"),
      v.literal("legacy_migration")
    ),
    legacySessionId: v.optional(v.id("fitSessions")),
    createdAt: v.number(),
    updatedAt: v.number(),
    archivedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_bike", ["bikeId"])
    .index("by_user_bike", ["userId", "bikeId"])
    .index("by_bike_default", ["bikeId", "isDefault"]),

  wheelsets: defineTable({
    bikeId: v.id("bikes"),
    userId: v.id("users"),
    name: v.string(),
    rimType: v.union(v.literal("hooked"), v.literal("hookless")),
    internalRimWidthFrontMm: v.optional(v.number()),
    internalRimWidthRearMm: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_bike", ["bikeId"])
    .index("by_user", ["userId"]),

  tireSetups: defineTable({
    wheelsetId: v.id("wheelsets"),
    userId: v.id("users"),
    name: v.string(),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    widthFrontMm: v.number(),
    widthRearMm: v.number(),
    tubeType: v.union(
      v.literal("inner_tube"),
      v.literal("latex_tube"),
      v.literal("tubeless")
    ),
    casingType: v.optional(
      v.union(
        v.literal("race_light"),
        v.literal("allround"),
        v.literal("reinforced")
      )
    ),
    maxPressureBar: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_wheelset", ["wheelsetId"])
    .index("by_user", ["userId"]),

  pressureProfiles: defineTable({
    bikeId: v.id("bikes"),
    tireSetupId: v.id("tireSetups"),
    userId: v.id("users"),
    name: v.string(),
    useCase: v.union(
      v.literal("race"),
      v.literal("endurance"),
      v.literal("wet_weather"),
      v.literal("gravel_mixed"),
      v.literal("comfort"),
      v.literal("custom")
    ),
    targetSurface: v.optional(v.string()),
    targetGoal: v.optional(v.string()),
    recommendedFrontBar: v.number(),
    recommendedRearBar: v.number(),
    lastCalculatedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_bike", ["bikeId"])
    .index("by_user", ["userId"]),

  pressureCalculations: defineTable({
    userId: v.id("users"),
    bikeId: v.optional(v.id("bikes")),
    tireSetupId: v.optional(v.id("tireSetups")),
    sourceType: v.union(
      v.literal("public_basic"),
      v.literal("dashboard_basic"),
      v.literal("dashboard_advanced")
    ),
    inputSnapshot: v.object({
      bodyWeightKg: v.number(),
      bikeWeightKg: v.optional(v.number()),
      extraLuggageKg: v.optional(v.number()),
      discipline: v.union(
        v.literal("road"),
        v.literal("gravel"),
        v.literal("mtb"),
        v.literal("tt")
      ),
      widthFrontMm: v.number(),
      widthRearMm: v.number(),
      tubeType: v.union(
        v.literal("inner_tube"),
        v.literal("latex_tube"),
        v.literal("tubeless")
      ),
      casingType: v.optional(v.string()),
      rimType: v.optional(v.union(v.literal("hooked"), v.literal("hookless"))),
      internalRimWidthFrontMm: v.optional(v.number()),
      internalRimWidthRearMm: v.optional(v.number()),
      surface: v.union(
        v.literal("smooth_asphalt"),
        v.literal("average_asphalt"),
        v.literal("rough_asphalt"),
        v.literal("hardpack_gravel"),
        v.literal("loose_gravel"),
        v.literal("trail")
      ),
      ridingGoal: v.optional(
        v.union(
          v.literal("speed"),
          v.literal("balance"),
          v.literal("comfort")
        )
      ),
      isWet: v.optional(v.boolean()),
      routeDistanceKm: v.optional(v.number()),
      routeElevationM: v.optional(v.number()),
      offRoadPercent: v.optional(v.number()),
    }),
    recommendedFrontBar: v.number(),
    recommendedRearBar: v.number(),
    recommendedFrontPsi: v.number(),
    recommendedRearPsi: v.number(),
    currentFrontBar: v.optional(v.number()),
    currentRearBar: v.optional(v.number()),
    comfortScore: v.optional(v.number()),
    gripScore: v.optional(v.number()),
    efficiencyScore: v.optional(v.number()),
    warningsJson: v.optional(v.string()),
    routeContextJson: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_bike", ["bikeId"])
    .index("by_user_created", ["userId", "createdAt"]),

  // Fit sessions - each time user goes through fitting process
  fitSessions: defineTable({
    userId: v.id("users"),
    bikeId: v.optional(v.id("bikes")),
    bikeProfileId: v.optional(v.id("bikeProfiles")),
    bikeType: v.optional(
      v.union(
        v.literal("road"),
        v.literal("gravel"),
        v.literal("mountain"),
        v.literal("hybrid"),
        v.literal("tt_triathlon"),
        v.literal("cyclocross"),
        v.literal("touring"),
        v.literal("city")
      )
    ),
    profileId: v.id("profiles"),
    engineVersion: v.optional(
      v.union(v.literal("v1"), v.literal("v2_shadow"), v.literal("v2"))
    ),
    sourceType: v.optional(
      v.union(
        v.literal("legacy_flow"),
        v.literal("bike_profile_flow"),
        v.literal("migration_backfill")
      )
    ),
    migrationMetadata: v.optional(
      v.object({
        source: v.union(
          v.literal("legacy_v1"),
          v.literal("v2_native"),
          v.literal("backfill")
        ),
        migratedAt: v.optional(v.number()),
        notes: v.optional(v.string()),
      })
    ),

    status: v.union(
      v.literal("in_progress"),
      v.literal("questionnaire_complete"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("archived")
    ),

    // Riding context
    ridingStyle: v.union(
      v.literal("recreational"),
      v.literal("fitness"),
      v.literal("sportive"),
      v.literal("racing"),
      v.literal("commuting"),
      v.literal("touring")
    ),
    primaryGoal: v.union(
      v.literal("comfort"),
      v.literal("performance"),
      v.literal("balanced"),
      v.literal("aerodynamics")
    ),
    weeklyHours: v.optional(v.number()),
    longestRideKm: v.optional(v.number()),

    // Current pain points
    painPoints: v.optional(
      v.array(
        v.object({
          area: v.string(),
          frequency: v.union(
            v.literal("rarely"),
            v.literal("sometimes"),
            v.literal("often"),
            v.literal("always")
          ),
          severity: v.union(
            v.literal("mild"),
            v.literal("moderate"),
            v.literal("severe")
          ),
        })
      )
    ),

    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_bike", ["userId", "bikeId"])
    .index("by_bike_profile", ["bikeProfileId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_status", ["status"]),

  // Questionnaire responses - dynamic follow-up questions
  questionnaireResponses: defineTable({
    sessionId: v.id("fitSessions"),

    questionId: v.string(),
    questionText: v.string(),
    questionCategory: v.string(),

    responseType: v.union(
      v.literal("single_choice"),
      v.literal("multiple_choice"),
      v.literal("numeric"),
      v.literal("text"),
      v.literal("scale")
    ),
    response: questionnaireResponseValue,

    questionOrder: v.number(),
    answeredAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_order", ["sessionId", "questionOrder"]),

  // Fit recommendations - generated results
  recommendations: defineTable({
    sessionId: v.id("fitSessions"),
    userId: v.id("users"),
    bikeId: v.optional(v.id("bikes")),
    bikeProfileId: v.optional(v.id("bikeProfiles")),
    engineVersion: v.optional(
      v.union(v.literal("v1"), v.literal("v2_shadow"), v.literal("v2"))
    ),
    sourceType: v.optional(
      v.union(
        v.literal("legacy_v1"),
        v.literal("engine_v1"),
        v.literal("engine_v2_shadow"),
        v.literal("engine_v2")
      )
    ),
    migrationMetadata: v.optional(
      v.object({
        source: v.union(
          v.literal("legacy_v1"),
          v.literal("v2_native"),
          v.literal("backfill")
        ),
        migratedAt: v.optional(v.number()),
        notes: v.optional(v.string()),
      })
    ),

    // Core fit calculations
    calculatedFit: v.object({
      // Frame sizing
      recommendedStackMm: v.number(),
      recommendedReachMm: v.number(),
      effectiveTopTubeMm: v.number(),

      // Saddle position
      saddleHeightMm: v.number(),
      saddleSetbackMm: v.number(),
      saddleHeightRange: v.object({
        min: v.number(),
        max: v.number(),
      }),

      // Handlebar position
      handlebarDropMm: v.number(),
      handlebarReachMm: v.number(),
      stemLengthMm: v.number(),
      stemAngleRecommendation: v.string(),

      // Components
      crankLengthMm: v.number(),
      handlebarWidthMm: v.number(),
    }),

    confidenceScore: v.number(),
    algorithmVersion: v.string(),
    comparisonSnapshot: v.optional(
      v.object({
        saddleHeightMm: v.number(),
        saddleSetbackMm: v.number(),
        barDropMm: v.number(),
        saddleToBarReachMm: v.number(),
        stemLengthMm: v.number(),
        crankLengthMm: v.number(),
        handlebarWidthMm: v.number(),
        confidenceScore: v.number(),
      })
    ),
    recommendationItems: v.optional(
      v.array(
        v.object({
          parameter: v.string(),
          target: v.number(),
          rangeLow: v.optional(v.number()),
          rangeHigh: v.optional(v.number()),
          confidence: v.optional(v.number()),
          method: v.optional(v.string()),
          why: v.optional(v.string()),
          feasibility: v.optional(
            v.union(
              v.literal("direct"),
              v.literal("component_change_required"),
              v.literal("not_yet_evaluated")
            )
          ),
          riskFlags: v.optional(v.array(v.string())),
          changeOrder: v.optional(v.number()),
        })
      )
    ),

    // Frame size recommendations
    frameSizeRecommendations: v.array(
      v.object({
        brand: v.optional(v.string()),
        size: v.string(),
        fitScore: v.number(),
        notes: v.optional(v.string()),
      })
    ),

    // Personalized advice
    fitNotes: v.array(v.string()),
    adjustmentPriorities: v.array(
      v.object({
        priority: v.number(),
        component: v.string(),
        currentValue: v.optional(v.string()),
        recommendedValue: v.string(),
        rationale: v.string(),
      })
    ),

    // Pain point solutions
    painPointSolutions: v.optional(
      v.array(
        v.object({
          painArea: v.string(),
          cause: v.string(),
          solution: v.string(),
        })
      )
    ),
    pressureInsights: v.optional(
      v.object({
        comfortBias: v.union(
          v.literal("comfort"),
          v.literal("balanced"),
          v.literal("performance")
        ),
        stabilityScore: v.number(),
        surfaceComplianceNote: v.optional(v.string()),
        warnings: v.array(v.string()),
        version: v.number(),
      })
    ),

    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"])
    .index("by_bike", ["bikeId"])
    .index("by_bike_profile", ["bikeProfileId"])
    .index("by_engine_version", ["engineVersion"]),

  recommendationShadowComparisons: defineTable({
    sessionId: v.id("fitSessions"),
    userId: v.id("users"),
    baselineEngineVersion: v.union(
      v.literal("v1"),
      v.literal("v2_shadow"),
      v.literal("v2")
    ),
    shadowEngineVersion: v.union(
      v.literal("v1"),
      v.literal("v2_shadow"),
      v.literal("v2")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),
    baselineSnapshot: v.object({
      saddleHeightMm: v.number(),
      saddleSetbackMm: v.number(),
      barDropMm: v.number(),
      saddleToBarReachMm: v.number(),
      stemLengthMm: v.number(),
      crankLengthMm: v.number(),
      handlebarWidthMm: v.number(),
      confidenceScore: v.number(),
    }),
    shadowSnapshot: v.optional(
      v.object({
        saddleHeightMm: v.number(),
        saddleSetbackMm: v.number(),
        barDropMm: v.number(),
        saddleToBarReachMm: v.number(),
        stemLengthMm: v.number(),
        crankLengthMm: v.number(),
        handlebarWidthMm: v.number(),
        confidenceScore: v.number(),
      })
    ),
    deltas: v.optional(
      v.object({
        saddleHeightMm: v.number(),
        saddleSetbackMm: v.number(),
        barDropMm: v.number(),
        saddleToBarReachMm: v.number(),
        stemLengthMm: v.number(),
        crankLengthMm: v.number(),
        handlebarWidthMm: v.number(),
        confidenceScore: v.number(),
      })
    ),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  validationCaptures: defineTable({
    sessionId: v.id("fitSessions"),
    userId: v.id("users"),
    bikeId: v.optional(v.id("bikes")),
    bikeProfileId: v.optional(v.id("bikeProfiles")),
    captureType: v.union(
      v.literal("side_video"),
      v.literal("front_video"),
      v.literal("manual_angles")
    ),
    sourceType: v.union(
      v.literal("video_beta"),
      v.literal("manual_beta"),
      v.literal("staff_review")
    ),
    status: v.union(v.literal("active"), v.literal("archived")),
    qualityScore: v.number(),
    kneeAngleBdcDeg: v.optional(v.number()),
    hipAngleTdcDeg: v.optional(v.number()),
    trunkAngleDeg: v.optional(v.number()),
    pelvicRockScore: v.optional(v.number()),
    elbowAngleDeg: v.optional(v.number()),
    kneeTrackingScore: v.optional(v.number()),
    cadenceRpm: v.optional(v.number()),
    powerWatts: v.optional(v.number()),
    handPositionMode: v.optional(
      v.union(
        v.literal("tops"),
        v.literal("hoods"),
        v.literal("drops"),
        v.literal("flat_bar"),
        v.literal("aero_extensions")
      )
    ),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"]),

  rideFeedbackEntries: defineTable({
    sessionId: v.id("fitSessions"),
    userId: v.id("users"),
    bikeId: v.optional(v.id("bikes")),
    bikeProfileId: v.optional(v.id("bikeProfiles")),
    implementationStatus: v.union(
      v.literal("confirmed"),
      v.literal("partial"),
      v.literal("not_implemented")
    ),
    comfortScore: v.number(),
    handlingScore: v.optional(v.number()),
    performanceFeelScore: v.optional(v.number()),
    kneePainArea: v.optional(
      v.union(
        v.literal("front"),
        v.literal("back"),
        v.literal("medial"),
        v.literal("lateral")
      )
    ),
    kneePainSeverity: v.optional(v.number()),
    lowerBackDiscomfortScore: v.optional(v.number()),
    handPressureScore: v.optional(v.number()),
    saddlePressureScore: v.optional(v.number()),
    climbingConfidenceScore: v.optional(v.number()),
    descendingControlScore: v.optional(v.number()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    refinementSuggestion: v.optional(
      v.object({
        parameter: v.string(),
        direction: v.union(v.literal("increase"), v.literal("decrease"), v.literal("hold")),
        delta: v.number(),
        rationale: v.string(),
      })
    ),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"]),

  // Email reports tracking
  emailReports: defineTable({
    userId: v.id("users"),
    sessionId: v.id("fitSessions"),
    recommendationId: v.id("recommendations"),

    recipientEmail: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("failed")
    ),

    resendEmailId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),

    sentAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"])
    .index("by_status", ["status"]),

  // Question definitions - for dynamic questionnaire
  questionDefinitions: defineTable({
    questionId: v.string(),
    category: v.string(),
    questionText: v.string(),
    helpText: v.optional(v.string()),

    responseType: v.union(
      v.literal("single_choice"),
      v.literal("multiple_choice"),
      v.literal("numeric"),
      v.literal("text"),
      v.literal("scale")
    ),

    // For choice-based questions
    options: v.optional(
      v.array(
        v.object({
          value: v.string(),
          label: v.string(),
          followUpQuestionIds: v.optional(v.array(v.string())),
        })
      )
    ),

    // For numeric questions
    numericConfig: v.optional(
      v.object({
        min: v.optional(v.number()),
        max: v.optional(v.number()),
        unit: v.optional(v.string()),
      })
    ),

    // For scale questions
    scaleConfig: v.optional(
      v.object({
        min: v.number(),
        max: v.number(),
        minLabel: v.string(),
        maxLabel: v.string(),
      })
    ),

    // Conditional display
    showCondition: v.optional(
      v.object({
        dependsOnQuestionId: v.string(),
        requiredValues: v.array(v.string()),
      })
    ),

    baseOrder: v.number(),
    isRequired: v.boolean(),
    isActive: v.boolean(),
  })
    .index("by_category", ["category"])
    .index("by_question_id", ["questionId"]),

  // Rate limiting for PDF report downloads
  reportRateLimits: defineTable({
    identifier: v.string(),
    tokens: v.number(),
    lastRefillAt: v.number(),
  }).index("by_identifier", ["identifier"]),

  // Public-site marketing and conversion events (SEO/content iteration)
  marketingEvents: defineTable({
    eventType: v.union(
      v.literal("cta_click"),
      v.literal("login_code_requested"),
      v.literal("login_code_resent"),
      v.literal("login_verified"),
      v.literal("funnel_landing_view"),
      v.literal("funnel_login_view"),
      v.literal("funnel_profile_view"),
      v.literal("funnel_fit_view"),
      v.literal("funnel_questionnaire_complete"),
      v.literal("funnel_results_view"),
      v.literal("login_send_error"),
      v.literal("login_verify_error"),
      v.literal("questionnaire_complete_error"),
      v.literal("report_send_error")
    ),
    locale: v.union(v.literal("en"), v.literal("nl")),
    pagePath: v.string(),
    section: v.optional(v.string()),
    ctaLabel: v.optional(v.string()),
    ctaTargetPath: v.optional(v.string()),
    sourceTag: v.optional(v.string()),
    occurredAt: v.number(),
  })
    .index("by_occurred_at", ["occurredAt"])
    .index("by_event_type_occurred_at", ["eventType", "occurredAt"])
    .index("by_locale_occurred_at", ["locale", "occurredAt"])
    .index("by_page_occurred_at", ["pagePath", "occurredAt"]),

  integrations: defineTable({
    userId: v.id("users"),
    provider: v.literal("strava"),
    providerUserId: v.optional(v.string()),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
    accessStatus: v.union(
      v.literal("not_connected"),
      v.literal("active"),
      v.literal("revoked"),
      v.literal("error")
    ),
    lastSyncAt: v.optional(v.number()),
    ridingProfileJson: v.optional(v.string()),
    athleteName: v.optional(v.string()),
    athleteAvatarUrl: v.optional(v.string()),
    oauthState: v.optional(v.string()),
    oauthStateExpiresAt: v.optional(v.number()),
  }).index("by_user_and_provider", ["userId", "provider"]),
});
