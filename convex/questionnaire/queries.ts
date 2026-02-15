import { query } from "../_generated/server";
import { v } from "convex/values";
import { getAllQuestions, getQuestionById } from "./questions";
import { requireSessionOwner, requireUserId } from "../lib/authz";

/**
 * Get all questions for a session
 */
export const getQuestions = query({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);
    return getAllQuestions();
  },
});

/**
 * Get responses for a session
 */
export const getResponses = query({
  args: { sessionId: v.id("fitSessions") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      return [];
    }
    return await ctx.db
      .query("questionnaireResponses")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

/**
 * Get the next unanswered question for a session
 * Takes into account conditional logic
 */
export const getNextQuestion = query({
  args: { sessionId: v.id("fitSessions") },
  handler: async (ctx, args) => {
    await requireSessionOwner(ctx, args.sessionId);
    // Get all responses for this session
    const responses = await ctx.db
      .query("questionnaireResponses")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const answeredIds = new Set(responses.map((r) => r.questionId));
    const responseMap = new Map(responses.map((r) => [r.questionId, r.response]));

    // Get all questions
    const allQuestions = getAllQuestions();

    // Find next unanswered question that should be shown
    for (const question of allQuestions) {
      // Skip if already answered
      if (answeredIds.has(question.questionId)) {
        continue;
      }

      // Check show condition
      if (question.showCondition) {
        const dependsOnResponse = responseMap.get(
          question.showCondition.dependsOnQuestionId
        );

        if (!dependsOnResponse) {
          // Dependency not answered yet, skip this question
          continue;
        }

        // Check if the response matches required values
        const responseValues = Array.isArray(dependsOnResponse)
          ? dependsOnResponse
          : [dependsOnResponse];

        const shouldShow = question.showCondition.requiredValues.some((rv) =>
          responseValues.includes(rv)
        );

        if (!shouldShow) {
          continue;
        }
      }

      // This question should be shown
      return {
        question,
        currentIndex: answeredIds.size,
        totalRequired: allQuestions.filter((q) => q.isRequired).length,
      };
    }

    // All questions answered
    return null;
  },
});

/**
 * Get questionnaire progress
 */
export const getProgress = query({
  args: { sessionId: v.id("fitSessions") },
  handler: async (ctx, args) => {
    await requireSessionOwner(ctx, args.sessionId);
    const responses = await ctx.db
      .query("questionnaireResponses")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const allQuestions = getAllQuestions();
    const requiredQuestions = allQuestions.filter((q) => q.isRequired);

    const answeredRequired = responses.filter((r) => {
      const q = getQuestionById(r.questionId);
      return q?.isRequired;
    }).length;

    return {
      totalAnswered: responses.length,
      totalQuestions: allQuestions.length,
      requiredAnswered: answeredRequired,
      requiredTotal: requiredQuestions.length,
      percentComplete: Math.round(
        (answeredRequired / requiredQuestions.length) * 100
      ),
      isComplete: answeredRequired >= requiredQuestions.length,
    };
  },
});
