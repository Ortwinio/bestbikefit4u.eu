import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getQuestionById } from "./questions";
import { requireSessionOwner } from "../lib/authz";
import { validateShortString, validateTextString } from "../lib/validation";
import {
  isValidQuestionResponse,
  questionResponseValueValidator,
} from "./responseValidation";

/**
 * Save a response to a question
 */
export const saveResponse = mutation({
  args: {
    sessionId: v.id("fitSessions"),
    questionId: v.string(),
    response: questionResponseValueValidator,
  },
  handler: async (ctx, args) => {
    await requireSessionOwner(ctx, args.sessionId);

    // Validate input lengths
    validateShortString(args.questionId, "questionId");

    // Get the question definition
    const question = getQuestionById(args.questionId);
    if (!question) {
      throw new Error(`Question not found: ${args.questionId}`);
    }
    if (typeof args.response === "string" && question.responseType === "text") {
      validateTextString(args.response, "response");
    }

    if (!isValidQuestionResponse(question, args.response)) {
      throw new Error(
        `Invalid response type or value for question: ${args.questionId}`
      );
    }

    // Check for existing response
    const existing = await ctx.db
      .query("questionnaireResponses")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("questionId"), args.questionId))
      .unique();

    // Get current count for order
    const currentResponses = await ctx.db
      .query("questionnaireResponses")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    if (existing) {
      // Update existing response
      await ctx.db.patch(existing._id, {
        response: args.response,
        answeredAt: Date.now(),
      });
      return existing._id;
    }

    // Create new response
    return await ctx.db.insert("questionnaireResponses", {
      sessionId: args.sessionId,
      questionId: args.questionId,
      questionText: question.questionText,
      questionCategory: question.category,
      responseType: question.responseType,
      response: args.response,
      questionOrder: currentResponses.length + 1,
      answeredAt: Date.now(),
    });
  },
});

/**
 * Clear a response (go back)
 */
export const clearResponse = mutation({
  args: {
    sessionId: v.id("fitSessions"),
    questionId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireSessionOwner(ctx, args.sessionId);

    const existing = await ctx.db
      .query("questionnaireResponses")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("questionId"), args.questionId))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

/**
 * Mark questionnaire as complete and update session
 */
export const completeQuestionnaire = mutation({
  args: {
    sessionId: v.id("fitSessions"),
  },
  handler: async (ctx, args) => {
    await requireSessionOwner(ctx, args.sessionId);

    // Update session status
    await ctx.db.patch(args.sessionId, {
      status: "questionnaire_complete",
    });

    // Extract pain points from responses
    const responses = await ctx.db
      .query("questionnaireResponses")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const painAreasResponse = responses.find(
      (r) => r.questionId === "pain_areas"
    );
    const painSeverityResponse = responses.find(
      (r) => r.questionId === "pain_severity"
    );

    if (
      painAreasResponse &&
      Array.isArray(painAreasResponse.response) &&
      painAreasResponse.response.every((area) => typeof area === "string")
    ) {
      const severityValue =
        typeof painSeverityResponse?.response === "number"
          ? painSeverityResponse.response
          : undefined;
      const painPoints = painAreasResponse.response.map((area) => ({
        area,
        frequency: "sometimes" as const,
        severity:
          severityValue !== undefined && severityValue >= 4
            ? ("severe" as const)
            : severityValue !== undefined && severityValue >= 2
              ? ("moderate" as const)
              : ("mild" as const),
      }));

      await ctx.db.patch(args.sessionId, {
        painPoints,
      });
    }

    // Extract weekly hours
    const weeklyHoursResponse = responses.find(
      (r) => r.questionId === "weekly_hours"
    );
    if (weeklyHoursResponse && typeof weeklyHoursResponse.response === "string") {
      const hoursMap: Record<string, number> = {
        "0-3": 2,
        "3-6": 5,
        "6-10": 8,
        "10-15": 12,
        "15+": 18,
      };
      const hours = hoursMap[weeklyHoursResponse.response] || 5;
      await ctx.db.patch(args.sessionId, {
        weeklyHours: hours,
      });
    }
  },
});
