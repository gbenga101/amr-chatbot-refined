/**
 * AMR Assessment Router
 *
 * tRPC procedures for:
 * - Creating assessment sessions
 * - Retrieving questions
 * - Submitting responses
 * - Calculating final scores
 * - Retrieving results
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { ASSESSMENT_QUESTIONS, getQuestionByNumber } from "../../shared/assessment";
import {
  createAssessmentSession,
  getAssessmentSession,
  saveAssessmentResponse,
  getAssessmentResponses,
  saveAssessmentResult,
  getAssessmentResult,
  completeAssessment,
} from "../db";
import { calculateRiskScore, validateAnswer } from "../scoring";
import { nanoid } from "nanoid";

/**
 * Create a new assessment session
 */
const createSession = publicProcedure.mutation(async ({ ctx }) => {
  try {
    const sessionId = nanoid(32);
    const userAgent = ctx.req.headers["user-agent"];
    const ipAddress = ctx.req.headers["x-forwarded-for"] || ctx.req.socket.remoteAddress;

    // Simple hash of IP for privacy (not cryptographic)
    let ipHash: string | undefined;
    if (ipAddress) {
      const crypto = await import("crypto");
      ipHash = crypto
        .createHash("sha256")
        .update(String(ipAddress))
        .digest("hex")
        .substring(0, 32);
    }

    await createAssessmentSession(sessionId, userAgent, ipHash);

    return {
      sessionId,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("[Assessment] Error creating session:", error);
    throw new Error("Failed to create assessment session");
  }
});

/**
 * Get a specific question by number
 */
const getQuestion = publicProcedure
  .input(
    z.object({
      sessionId: z.string().min(1),
      questionNumber: z.number().int().min(1).max(12),
    })
  )
  .query(async ({ input }) => {
    try {
      // Verify session exists
      const session = await getAssessmentSession(input.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      // Get question
      const question = getQuestionByNumber(input.questionNumber);
      if (!question) {
        throw new Error("Question not found");
      }

      return {
        id: question.id,
        number: question.number,
        category: question.category,
        question: question.question,
        options: question.options.map((opt) => ({
          text: opt.text,
          // Don't expose points to frontend
        })),
        totalQuestions: ASSESSMENT_QUESTIONS.length,
      };
    } catch (error) {
      console.error("[Assessment] Error getting question:", error);
      throw new Error("Failed to retrieve question");
    }
  });

/**
 * Submit a single response
 */
const submitResponse = publicProcedure
  .input(
    z.object({
      sessionId: z.string().min(1),
      questionId: z.string().min(1),
      answerText: z.string().min(1),
    })
  )
  .mutation(async ({ input }) => {
    try {
      // Verify session exists and is in progress
      const session = await getAssessmentSession(input.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }
      if (session.status !== "in_progress") {
        throw new Error("Assessment already completed");
      }

      // Validate answer
      const validation = validateAnswer(input.questionId, input.answerText);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Save response
      await saveAssessmentResponse(
        input.sessionId,
        input.questionId,
        validation.category!,
        input.answerText,
        validation.points!
      );

      // Get current response count
      const responses = await getAssessmentResponses(input.sessionId);

      return {
        success: true,
        responsesCount: responses.length,
        totalQuestions: ASSESSMENT_QUESTIONS.length,
      };
    } catch (error) {
      console.error("[Assessment] Error submitting response:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to submit response");
    }
  });

/**
 * Submit complete assessment and calculate score
 */
const submitAssessment = publicProcedure
  .input(
    z.object({
      sessionId: z.string().min(1),
    })
  )
  .mutation(async ({ input }) => {
    try {
      // Verify session exists
      const session = await getAssessmentSession(input.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      // Get all responses
      const responses = await getAssessmentResponses(input.sessionId);

      // Validate we have all 12 responses
      if (responses.length !== ASSESSMENT_QUESTIONS.length) {
        throw new Error(
          `Incomplete assessment. Expected ${ASSESSMENT_QUESTIONS.length} responses, got ${responses.length}`
        );
      }

      // Convert responses to scoring format
      const answers = responses.map((r) => ({
        questionId: r.questionId,
        category: r.category as any,
        answerText: r.answerText,
        points: r.points,
      }));

      // Calculate risk score
      const result = calculateRiskScore(answers);

      // Save result
      await saveAssessmentResult(
        input.sessionId,
        result.totalScore,
        result.riskLevel,
        result.categoryScores,
        result.categoryPercentages,
        result.highestRiskCategories,
        result.interpretation,
        result.recommendations
      );

      // Mark assessment as completed
      await completeAssessment(input.sessionId);

      return {
        totalScore: result.totalScore,
        riskLevel: result.riskLevel,
        categoryScores: result.categoryScores,
        categoryPercentages: result.categoryPercentages,
        highestRiskCategories: result.highestRiskCategories,
        interpretation: result.interpretation,
        recommendations: result.recommendations,
      };
    } catch (error) {
      console.error("[Assessment] Error submitting assessment:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to submit assessment");
    }
  });

/**
 * Get assessment result
 */
const getResult = publicProcedure
  .input(
    z.object({
      sessionId: z.string().min(1),
    })
  )
  .query(async ({ input }) => {
    try {
      const result = await getAssessmentResult(input.sessionId);

      if (!result) {
        throw new Error("Assessment result not found");
      }

      return {
        totalScore: result.totalScore,
        riskLevel: result.riskLevel,
        categoryScores: result.categoryScores,
        categoryPercentages: result.categoryPercentages,
        highestRiskCategories: result.highestRiskCategories,
        interpretation: result.interpretation,
        recommendations: result.recommendations,
        createdAt: result.createdAt,
      };
    } catch (error) {
      console.error("[Assessment] Error getting result:", error);
      throw new Error("Failed to retrieve assessment result");
    }
  });

/**
 * Get all questions (for reference)
 */
const getQuestions = publicProcedure.query(() => {
  return {
    questions: ASSESSMENT_QUESTIONS.map((q) => ({
      id: q.id,
      number: q.number,
      category: q.category,
      question: q.question,
      options: q.options.map((opt) => ({ text: opt.text })),
    })),
    totalQuestions: ASSESSMENT_QUESTIONS.length,
  };
});

export const assessmentRouter = router({
  createSession,
  getQuestion,
  submitResponse,
  submitAssessment,
  getResult,
  getQuestions,
});
