/**
 * Assessment Integration Tests
 *
 * Tests for complete assessment flow including:
 * - Session creation
 * - Question retrieval
 * - Response submission
 * - Score calculation
 * - Result retrieval
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ASSESSMENT_QUESTIONS } from "../shared/assessment";
import { calculateRiskScore, validateAnswer } from "./scoring";
import { nanoid } from "nanoid";

describe("Assessment Integration", () => {
  describe("Complete Assessment Flow", () => {
    it("should complete a full assessment with LOW risk", () => {
      // Simulate all "Never" answers (minimum points)
      const answers = ASSESSMENT_QUESTIONS.map((question) => {
        const minOption = question.options[0]; // First option is usually lowest points
        return {
          questionId: question.id,
          category: question.category,
          answerText: minOption.text,
          points: minOption.points,
        };
      });

      const result = calculateRiskScore(answers);

      expect(result.totalScore).toBe(0);
      expect(result.riskLevel).toBe("low");
      expect(result.interpretation).toContain("LOW");
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it("should complete a full assessment with HIGH risk", () => {
      // Simulate all "Often" answers (maximum points)
      const answers = ASSESSMENT_QUESTIONS.map((question) => {
        const maxOption = question.options[question.options.length - 1]; // Last option is usually highest points
        return {
          questionId: question.id,
          category: question.category,
          answerText: maxOption.text,
          points: maxOption.points,
        };
      });

      const result = calculateRiskScore(answers);

      expect(result.totalScore).toBe(100);
      expect(result.riskLevel).toBe("high");
      expect(result.interpretation).toContain("HIGH");
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it("should complete a full assessment with MODERATE risk", () => {
      // Mix of answers for moderate risk
      const answers = ASSESSMENT_QUESTIONS.map((question, index) => {
        // Alternate between first and last options
        const option = index % 2 === 0 ? question.options[0] : question.options[question.options.length - 1];
        return {
          questionId: question.id,
          category: question.category,
          answerText: option.text,
          points: option.points,
        };
      });

      const result = calculateRiskScore(answers);

      expect(result.riskLevel).toBe("moderate");
      expect(result.totalScore).toBeGreaterThan(30);
      expect(result.totalScore).toBeLessThan(60);
    });

    it("should handle all questions from all categories", () => {
      const categories = new Set<string>();
      const answers = ASSESSMENT_QUESTIONS.map((question) => {
        categories.add(question.category);
        const option = question.options[0];
        return {
          questionId: question.id,
          category: question.category,
          answerText: option.text,
          points: option.points,
        };
      });

      expect(answers.length).toBe(12);
      expect(categories.size).toBe(4); // behavioral, knowledge, environmental, socioeconomic

      const result = calculateRiskScore(answers);
      expect(result.categoryScores).toHaveProperty("behavioral");
      expect(result.categoryScores).toHaveProperty("knowledge");
      expect(result.categoryScores).toHaveProperty("environmental");
      expect(result.categoryScores).toHaveProperty("socioeconomic");
    });

    it("should validate all questions can be answered", () => {
      ASSESSMENT_QUESTIONS.forEach((question) => {
        question.options.forEach((option) => {
          const result = validateAnswer(question.id, option.text);
          expect(result.valid).toBe(true);
          expect(result.points).toBeDefined();
          expect(result.category).toBe(question.category);
        });
      });
    });

    it("should reject invalid answers for all questions", () => {
      ASSESSMENT_QUESTIONS.forEach((question) => {
        const result = validateAnswer(question.id, "Invalid Answer");
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it("should maintain consistent scoring across multiple runs", () => {
      const answers = ASSESSMENT_QUESTIONS.map((question, index) => {
        const option = index % 2 === 0 ? question.options[0] : question.options[question.options.length - 1];
        return {
          questionId: question.id,
          category: question.category,
          answerText: option.text,
          points: option.points,
        };
      });

      const result1 = calculateRiskScore(answers);
      const result2 = calculateRiskScore(answers);

      expect(result1.totalScore).toBe(result2.totalScore);
      expect(result1.riskLevel).toBe(result2.riskLevel);
      expect(result1.categoryScores).toEqual(result2.categoryScores);
    });

    it("should generate category-specific recommendations", () => {
      // Create a scenario with high behavioral risk
      const answers = ASSESSMENT_QUESTIONS.map((question) => {
        const option = question.category === "behavioral" ? question.options[question.options.length - 1] : question.options[0];
        return {
          questionId: question.id,
          category: question.category,
          answerText: option.text,
          points: option.points,
        };
      });

      const result = calculateRiskScore(answers);

      // Should include behavioral recommendations
      const behavioralRecommendations = result.recommendations.filter((r) =>
        r.toLowerCase().includes("antibiotics") || r.toLowerCase().includes("prescription")
      );
      expect(behavioralRecommendations.length).toBeGreaterThan(0);
    });

    it("should include medical disclaimer in all results", () => {
      const testCases = [
        ASSESSMENT_QUESTIONS.map((q) => ({
          questionId: q.id,
          category: q.category,
          answerText: q.options[0].text,
          points: q.options[0].points,
        })),
        ASSESSMENT_QUESTIONS.map((q) => ({
          questionId: q.id,
          category: q.category,
          answerText: q.options[q.options.length - 1].text,
          points: q.options[q.options.length - 1].points,
        })),
      ];

      testCases.forEach((answers) => {
        const result = calculateRiskScore(answers);
        const hasDisclaimer = result.recommendations.some((r) =>
          r.includes("educational purposes only")
        );
        expect(hasDisclaimer).toBe(true);
      });
    });

    it("should calculate correct category percentages", () => {
      // All maximum answers
      const answers = ASSESSMENT_QUESTIONS.map((q) => ({
        questionId: q.id,
        category: q.category,
        answerText: q.options[q.options.length - 1].text,
        points: q.options[q.options.length - 1].points,
      }));

      const result = calculateRiskScore(answers);

      // All categories should be at 100%
      Object.values(result.categoryPercentages).forEach((percentage) => {
        expect(percentage).toBe(100);
      });
    });

    it("should handle edge case of all zero scores", () => {
      const answers = ASSESSMENT_QUESTIONS.map((q) => ({
        questionId: q.id,
        category: q.category,
        answerText: q.options[0].text,
        points: q.options[0].points,
      }));

      const result = calculateRiskScore(answers);

      expect(result.totalScore).toBe(0);
      expect(result.highestRiskCategories).toHaveLength(0);
      expect(result.interpretation).toContain("LOW");
    });

    it("should handle tied highest risk categories", () => {
      // Create answers where multiple categories tie
      const answers = ASSESSMENT_QUESTIONS.map((question) => {
        // Give behavioral and knowledge max points, others min
        if (question.category === "behavioral" || question.category === "knowledge") {
          return {
            questionId: question.id,
            category: question.category,
            answerText: question.options[question.options.length - 1].text,
            points: question.options[question.options.length - 1].points,
          };
        }
        return {
          questionId: question.id,
          category: question.category,
          answerText: question.options[0].text,
          points: question.options[0].points,
        };
      });

      const result = calculateRiskScore(answers);

      expect(result.highestRiskCategories.length).toBeGreaterThanOrEqual(1);
      expect(result.highestRiskCategories).toContain("behavioral");
      expect(result.highestRiskCategories).toContain("knowledge");
    });
  });

  describe("Question Coverage", () => {
    it("should have exactly 12 questions", () => {
      expect(ASSESSMENT_QUESTIONS.length).toBe(12);
    });

    it("should have questions from all 4 categories", () => {
      const categories = new Set(ASSESSMENT_QUESTIONS.map((q) => q.category));
      expect(categories.size).toBe(4);
      expect(categories.has("behavioral")).toBe(true);
      expect(categories.has("knowledge")).toBe(true);
      expect(categories.has("environmental")).toBe(true);
      expect(categories.has("socioeconomic")).toBe(true);
    });

    it("should have correct number of questions per category", () => {
      const categoryCount: Record<string, number> = {
        behavioral: 0,
        knowledge: 0,
        environmental: 0,
        socioeconomic: 0,
      };

      ASSESSMENT_QUESTIONS.forEach((q) => {
        categoryCount[q.category]++;
      });

      // Expected: Behavioral 4, Knowledge 3, Environmental 3, Socioeconomic 2
      expect(categoryCount.behavioral).toBe(4);
      expect(categoryCount.knowledge).toBe(3);
      expect(categoryCount.environmental).toBe(3);
      expect(categoryCount.socioeconomic).toBe(2);
    });

    it("should have unique question IDs", () => {
      const ids = ASSESSMENT_QUESTIONS.map((q) => q.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(12);
    });

    it("should have at least 2 options per question", () => {
      ASSESSMENT_QUESTIONS.forEach((question) => {
        expect(question.options.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("should have non-negative points for all options", () => {
      ASSESSMENT_QUESTIONS.forEach((question) => {
        question.options.forEach((option) => {
          expect(option.points).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });
});
