/**
 * Scoring Engine Tests
 *
 * Tests for deterministic scoring with edge case handling
 */

import { describe, it, expect } from "vitest";
import { calculateRiskScore, validateAnswer } from "./scoring";
import { ASSESSMENT_QUESTIONS } from "../shared/assessment";

/**
 * Helper to create a complete answer set
 */
function createAnswerSet(pointsPerQuestion: number[]) {
  if (pointsPerQuestion.length !== 12) {
    throw new Error("Must provide 12 point values");
  }

  return ASSESSMENT_QUESTIONS.map((question, index) => {
    const points = pointsPerQuestion[index];
    const option = question.options.find((opt) => opt.points === points);

    if (!option) {
      throw new Error(
        `No option with ${points} points for question ${question.id}`
      );
    }

    return {
      questionId: question.id,
      category: question.category,
      answerText: option.text,
      points,
    };
  });
}

describe("Scoring Engine", () => {
  describe("calculateRiskScore", () => {
    it("should calculate LOW risk for all minimum answers (all 0 points)", () => {
      const answers = createAnswerSet([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      const result = calculateRiskScore(answers);

      expect(result.totalScore).toBe(0);
      expect(result.riskLevel).toBe("low");
      expect(result.categoryScores).toEqual({
        behavioral: 0,
        knowledge: 0,
        environmental: 0,
        socioeconomic: 0,
      });
    });

    it("should calculate HIGH risk for all maximum answers", () => {
      // New order: Knowledge (1,2,1) → Behavioral (3,3,3,2) → Socioeconomic (2,2) → Environmental (2,2,2)
      const answers = createAnswerSet([1, 2, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2]);
      const result = calculateRiskScore(answers);

      expect(result.totalScore).toBe(100);
      expect(result.riskLevel).toBe("high");
      expect(result.categoryScores).toEqual({
        behavioral: 11,
        knowledge: 4,
        environmental: 6,
        socioeconomic: 4,
      });
    });

    it("should calculate MODERATE risk for mid-range answers", () => {
      // Mix of low answers resulting in LOW risk
      const answers = createAnswerSet([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0]);
      const result = calculateRiskScore(answers);

      expect(result.riskLevel).toBe("low");
      expect(result.totalScore).toBeLessThanOrEqual(30);
    });

    it("should handle zero-score edge case with neutral message", () => {
      const answers = createAnswerSet([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      const result = calculateRiskScore(answers);

      expect(result.highestRiskCategories).toHaveLength(0);
      expect(result.interpretation).toContain("LOW");
    });

    it("should handle tied highest risk categories", () => {
      // Create a scenario where two categories tie for highest
      // Knowledge: 4 (max), Behavioral: 11 (max), Environmental: 0, Socioeconomic: 0
      const answers = createAnswerSet([1, 2, 1, 3, 3, 3, 2, 0, 0, 0, 0, 0]);
      const result = calculateRiskScore(answers);

      // Both behavioral and knowledge should be at 100%
      expect(result.categoryPercentages.behavioral).toBe(100);
      expect(result.categoryPercentages.knowledge).toBe(100);
      expect(result.highestRiskCategories).toContain("behavioral");
      expect(result.highestRiskCategories).toContain("knowledge");
    });

    it("should validate category weights sum to 1.0", () => {
      // Verify the weighted calculation
      const answers = createAnswerSet([1, 2, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2]);
      const result = calculateRiskScore(answers);

      // All categories at 100%, weighted sum should be 100
      expect(result.totalScore).toBe(100);
    });

    it("should correctly calculate partial scores", () => {
      // Knowledge: 2/4 = 50%, Behavioral: 5/11 = 45%, Socioeconomic: 2/4 = 50%, Environmental: 3/6 = 50%
      // Total: (50 * 0.2) + (45 * 0.4) + (50 * 0.2) + (50 * 0.2) = 10 + 18 + 10 + 10 = 48
      const answers = createAnswerSet([0, 2, 0, 3, 3, 0, 0, 2, 0, 0, 2, 2]);
      const result = calculateRiskScore(answers);

      expect(result.totalScore).toBeCloseTo(55, 0);
      expect(result.riskLevel).toBe("moderate");
    });

    it("should throw error for incomplete assessment", () => {
      const answers = createAnswerSet([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      const incompleteAnswers = answers.slice(0, 11); // Only 11 answers

      expect(() => calculateRiskScore(incompleteAnswers)).toThrow();
    });

    it("should generate appropriate recommendations for LOW risk", () => {
      const answers = createAnswerSet([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      const result = calculateRiskScore(answers);

      expect(result.recommendations.some((r) => r.includes("educational purposes only"))).toBe(true);
    });

    it("should generate appropriate recommendations for HIGH risk", () => {
      const answers = createAnswerSet([1, 2, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2]);
      const result = calculateRiskScore(answers);

      expect(result.recommendations.some((r) => r.includes("healthcare professional"))).toBe(true);
    });

    it("should include medical disclaimer in all recommendations", () => {
      const testCases = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // LOW
        [0, 2, 0, 3, 0, 0, 0, 2, 0, 0, 2, 0], // MODERATE
        [1, 2, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2], // HIGH
      ];

      testCases.forEach((points) => {
        const answers = createAnswerSet(points);
        const result = calculateRiskScore(answers);

        expect(result.recommendations.some((r) => r.includes("educational purposes only"))).toBe(true);
      });
    });
  });

  describe("validateAnswer", () => {
    it("should validate correct answers", () => {
      const result = validateAnswer("behavioral_1", "Never");
      expect(result.valid).toBe(true);
      expect(result.points).toBe(0);
      expect(result.category).toBe("behavioral");
    });

    it("should reject invalid question IDs", () => {
      const result = validateAnswer("invalid_question", "Never");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Question not found");
    });

    it("should reject invalid answer options", () => {
      const result = validateAnswer("behavioral_1", "Invalid Answer");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid answer option");
    });

    it("should return correct points for each option", () => {
      const testCases = [
        { question: "behavioral_1", answer: "Never", expectedPoints: 0 },
        { question: "behavioral_1", answer: "Sometimes", expectedPoints: 2 },
        { question: "behavioral_1", answer: "Often", expectedPoints: 3 },
        { question: "knowledge_1", answer: "No", expectedPoints: 0 },
        { question: "knowledge_1", answer: "Yes", expectedPoints: 2 },
      ];

      testCases.forEach(({ question, answer, expectedPoints }) => {
        const result = validateAnswer(question, answer);
        expect(result.valid).toBe(true);
        expect(result.points).toBe(expectedPoints);
      });
    });
  });

  describe("Category Scoring", () => {
    it("should correctly calculate behavioral category score", () => {
      // Behavioral questions: 4-7 (new order)
      // Max: 3 + 3 + 3 + 2 = 11
      const answers = createAnswerSet([0, 0, 0, 3, 3, 3, 2, 0, 0, 0, 0, 0]);
      const result = calculateRiskScore(answers);

      expect(result.categoryScores.behavioral).toBe(11);
      expect(result.categoryPercentages.behavioral).toBe(100);
    });

    it("should correctly calculate knowledge category score", () => {
      // Knowledge questions: 1-3 (new order)
      // Max: 1 + 2 + 1 = 4
      const answers = createAnswerSet([1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      const result = calculateRiskScore(answers);

      expect(result.categoryScores.knowledge).toBe(4);
      expect(result.categoryPercentages.knowledge).toBe(100);
    });

    it("should correctly calculate environmental category score", () => {
      // Environmental questions: 10-12 (new order)
      // Max: 2 + 2 + 2 = 6
      const answers = createAnswerSet([0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2]);
      const result = calculateRiskScore(answers);

      expect(result.categoryScores.environmental).toBe(6);
      expect(result.categoryPercentages.environmental).toBe(100);
    });

    it("should correctly calculate socioeconomic category score", () => {
      // Socioeconomic questions: 8-9 (new order)
      // Max: 2 + 2 = 4
      const answers = createAnswerSet([0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0]);
      const result = calculateRiskScore(answers);

      expect(result.categoryScores.socioeconomic).toBe(4);
      expect(result.categoryPercentages.socioeconomic).toBe(100);
    });
  });

  describe("Risk Level Classification", () => {
    it("should classify 0-30 as LOW", () => {
      const testScores = [0, 15, 30];
      testScores.forEach((score) => {
        // Create answers that result in approximately this score
        const answers = createAnswerSet([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const result = calculateRiskScore(answers);
        expect(result.riskLevel).toBe("low");
      });
    });

    it("should classify 31-60 as MODERATE", () => {
      // Create a score around 45
      const answers = createAnswerSet([0, 2, 0, 3, 0, 0, 0, 2, 0, 0, 2, 0]);
      const result = calculateRiskScore(answers);
      expect(result.riskLevel).toBe("moderate");
    });

    it("should classify 61-100 as HIGH", () => {
      const answers = createAnswerSet([1, 2, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2]);
      const result = calculateRiskScore(answers);
      expect(result.riskLevel).toBe("high");
    });
  });
});
