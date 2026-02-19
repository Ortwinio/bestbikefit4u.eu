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

    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Fit sessions - each time user goes through fitting process
  fitSessions: defineTable({
    userId: v.id("users"),
    bikeId: v.optional(v.id("bikes")),
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

  // Public-site marketing and conversion events (SEO/content iteration)
  marketingEvents: defineTable({
    eventType: v.union(
      v.literal("cta_click"),
      v.literal("login_code_requested"),
      v.literal("login_verified")
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
});
