/**
 * AMR Risk Assessment Scoring Engine
 *
 * Implements deterministic, auditable scoring with:
 * - Fixed point values per answer
 * - Weighted category calculation
 * - Explicit edge case handling
 * - No AI interpretation or dynamic weighting
 */

import {
  ASSESSMENT_QUESTIONS,
  CATEGORY_WEIGHTS,
  MAX_POINTS_PER_CATEGORY,
  RISK_LEVEL_THRESHOLDS,
  Category,
  RiskLevel,
  getRiskLevel,
} from "../shared/assessment";

export interface AssessmentAnswer {
  questionId: string;
  category: Category;
  answerText: string;
  points: number;
}

export interface ScoringResult {
  totalScore: number;
  riskLevel: RiskLevel;
  categoryScores: Record<Category, number>;
  categoryPercentages: Record<Category, number>;
  highestRiskCategories: string[]; // Array to handle ties
  interpretation: string;
  recommendations: string[];
}

/**
 * Calculate category percentage (0-100)
 */
function calculateCategoryPercentage(
  categoryScore: number,
  category: Category
): number {
  const maxPoints = MAX_POINTS_PER_CATEGORY[category];
  if (maxPoints === 0) return 0;
  return Math.round((categoryScore / maxPoints) * 100);
}

/**
 * Find highest risk categories (handles ties)
 */
function findHighestRiskCategories(
  categoryPercentages: Record<Category, number>
): string[] {
  const maxPercentage = Math.max(...Object.values(categoryPercentages));

  // If all scores are 0, return empty array (neutral case)
  if (maxPercentage === 0) {
    return [];
  }

  // Find all categories with the max percentage (handles ties)
  return Object.entries(categoryPercentages)
    .filter(([_, percentage]) => percentage === maxPercentage)
    .map(([category]) => category);
}

/**
 * Generate interpretation text
 */
function generateInterpretation(riskLevel: RiskLevel, score: number): string {
  const interpretations: Record<RiskLevel, string> = {
    low: `Your AMR Risk Level is LOW (Score: ${score}/100). You demonstrate good antimicrobial stewardship practices. Continue following professional medical advice and maintaining your current practices.`,
    moderate: `Your AMR Risk Level is MODERATE (Score: ${score}/100). Some of your habits may increase your risk of contributing to antimicrobial resistance. Review the recommendations provided to reduce your risk.`,
    high: `Your AMR Risk Level is HIGH (Score: ${score}/100). Your current practices significantly increase your risk of contributing to antimicrobial resistance. Please consult a licensed healthcare professional for guidance on improving your practices.`,
  };

  return interpretations[riskLevel];
}

/**
 * Generate personalized recommendations
 */
function generateRecommendations(
  riskLevel: RiskLevel,
  highestRiskCategories: string[]
): string[] {
  const recommendations: string[] = [];

  // Category-specific recommendations
  const categoryRecommendations: Record<string, string[]> = {
    behavioral: [
      "✓ Always complete the full course of antibiotics as prescribed, even if you feel better.",
      "✓ Only buy antibiotics with a valid doctor's prescription.",
      "✓ Never use leftover antibiotics from previous illnesses.",
      "✓ Do not share your antibiotics with family members or friends.",
    ],
    knowledge: [
      "✓ Remember: Antibiotics only work against bacteria, not viruses like colds or flu.",
      "✓ It is bacteria that become resistant, not your body.",
      "✓ Always consult a healthcare professional to determine if you need antibiotics.",
      "✓ Learn more about Antimicrobial Resistance (AMR) to make informed health decisions.",
    ],
    environmental: [
      "✓ Wash your hands frequently with clean water and soap.",
      "✓ Ensure access to clean drinking water and proper sanitation.",
      "✓ Practice good food hygiene to prevent infections.",
      "✓ Support community efforts to improve environmental sanitation.",
    ],
    socioeconomic: [
      "✓ Do not skip doses due to cost; consult a healthcare provider for affordable options.",
      "✓ Visit licensed pharmacies or clinics instead of informal vendors.",
      "✓ Seek government health programs that provide subsidized medicines.",
      "✓ Report counterfeit medicines to local health authorities.",
    ],
  };

  // Add category-specific recommendations for highest risk categories
  if (highestRiskCategories.length > 0) {
    highestRiskCategories.forEach((category) => {
      if (categoryRecommendations[category]) {
        recommendations.push(...categoryRecommendations[category]);
      }
    });
  }

  // Add risk-level specific recommendations
  if (riskLevel === "high") {
    recommendations.push(
      "⚠ Please consult a licensed healthcare professional before taking any antibiotics.",
      "⚠ Report any unusual symptoms to a medical professional immediately."
    );
  } else if (riskLevel === "moderate") {
    recommendations.push(
      "→ Learn more about antimicrobial resistance to make informed health decisions.",
      "→ Share this knowledge with your family and community."
    );
  }

  // Add educational note for all risk levels
  recommendations.push(
    "📚 This assessment is for educational purposes only and is not a medical diagnosis. Please consult a healthcare professional for personalized medical advice."
  );

  return recommendations;
}

/**
 * Calculate AMR risk score from assessment answers
 *
 * @param answers - Array of assessment answers with points
 * @returns Scoring result with all details
 * @throws Error if validation fails
 */
export function calculateRiskScore(answers: AssessmentAnswer[]): ScoringResult {
  // Validate we have exactly 12 answers
  if (answers.length !== ASSESSMENT_QUESTIONS.length) {
    throw new Error(
      `Expected ${ASSESSMENT_QUESTIONS.length} answers, received ${answers.length}`
    );
  }

  // Initialize category scores
  const categoryScores: Record<Category, number> = {
    behavioral: 0,
    knowledge: 0,
    environmental: 0,
    socioeconomic: 0,
  };

  // Sum points by category
  for (const answer of answers) {
    categoryScores[answer.category] += answer.points;
  }

  // Calculate category percentages
  const categoryPercentages: Record<Category, number> = {
    behavioral: calculateCategoryPercentage(categoryScores.behavioral, "behavioral"),
    knowledge: calculateCategoryPercentage(categoryScores.knowledge, "knowledge"),
    environmental: calculateCategoryPercentage(categoryScores.environmental, "environmental"),
    socioeconomic: calculateCategoryPercentage(categoryScores.socioeconomic, "socioeconomic"),
  };

  // Calculate weighted total score
  let totalScore = 0;
  Object.entries(categoryPercentages).forEach(([category, percentage]) => {
    const weight = CATEGORY_WEIGHTS[category as Category];
    totalScore += percentage * weight;
  });

  // Round to nearest integer
  const normalizedScore = Math.round(totalScore);

  // Determine risk level
  const riskLevel = getRiskLevel(normalizedScore);

  // Find highest risk categories (handles ties and zero scores)
  const highestRiskCategories = findHighestRiskCategories(categoryPercentages);

  // Generate interpretation
  const interpretation = generateInterpretation(riskLevel, normalizedScore);

  // Generate recommendations
  const recommendations = generateRecommendations(riskLevel, highestRiskCategories);

  return {
    totalScore: Math.round(totalScore * 100) / 100, // Keep 2 decimal places
    riskLevel,
    categoryScores,
    categoryPercentages,
    highestRiskCategories,
    interpretation,
    recommendations,
  };
}

/**
 * Validate an answer against a question
 */
export function validateAnswer(
  questionId: string,
  answerText: string
): { valid: boolean; points?: number; category?: Category; error?: string } {
  const question = ASSESSMENT_QUESTIONS.find((q) => q.id === questionId);

  if (!question) {
    return { valid: false, error: "Question not found" };
  }

  const option = question.options.find((opt) => opt.text === answerText);

  if (!option) {
    return {
      valid: false,
      error: `Invalid answer option. Valid options: ${question.options.map((o) => o.text).join(", ")}`,
    };
  }

  return {
    valid: true,
    points: option.points,
    category: question.category,
  };
}

/**
 * Get all questions for a category
 */
export function getQuestionsByCategory(category: Category) {
  return ASSESSMENT_QUESTIONS.filter((q) => q.category === category);
}

/**
 * Get question by ID
 */
export function getQuestionById(questionId: string) {
  return ASSESSMENT_QUESTIONS.find((q) => q.id === questionId);
}
