/**
 * AMR Risk Assessment Configuration
 * 
 * This file contains the complete assessment structure with all 12 questions,
 * answer options, point values, and category mappings.
 * 
 * CONSTRAINTS:
 * - Exactly 12 questions (immutable)
 * - Question wording and answer options unchanged
 * - Fixed point values per answer (deterministic)
 * - No dynamic weighting or AI interpretation
 */

export type Category = "behavioral" | "knowledge" | "environmental" | "socioeconomic";
export type RiskLevel = "low" | "moderate" | "high";

export interface AssessmentOption {
  text: string;
  points: number;
}

export interface AssessmentQuestion {
  id: string;
  number: number;
  category: Category;
  question: string;
  options: AssessmentOption[];
}

export interface CategoryWeights {
  behavioral: number;
  knowledge: number;
  environmental: number;
  socioeconomic: number;
}

export interface MaxPointsPerCategory {
  behavioral: number;
  knowledge: number;
  environmental: number;
  socioeconomic: number;
}

/**
 * All 12 Assessment Questions
 * Organized by category with fixed point values
 */
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // BEHAVIORAL QUESTIONS (4 questions, max 11 points)
  {
    id: "behavioral_1",
    number: 1,
    category: "behavioral",
    question: "Do you buy antibiotics without a doctor's prescription?",
    options: [
      { text: "Never", points: 0 },
      { text: "Sometimes", points: 2 },
      { text: "Often", points: 3 },
    ],
  },
  {
    id: "behavioral_2",
    number: 2,
    category: "behavioral",
    question: "Do you stop taking antibiotics when you feel better, even if the course is not complete?",
    options: [
      { text: "No", points: 0 },
      { text: "Yes", points: 3 },
    ],
  },
  {
    id: "behavioral_3",
    number: 3,
    category: "behavioral",
    question: "Do you use leftover antibiotics from previous illnesses?",
    options: [
      { text: "No", points: 0 },
      { text: "Yes", points: 3 },
    ],
  },
  {
    id: "behavioral_4",
    number: 4,
    category: "behavioral",
    question: "Do you share your antibiotics with family members or friends?",
    options: [
      { text: "No", points: 0 },
      { text: "Yes", points: 2 },
    ],
  },

  // KNOWLEDGE QUESTIONS (3 questions, max 4 points)
  {
    id: "knowledge_1",
    number: 5,
    category: "knowledge",
    question: "Do you know that antibiotics only work against bacteria and not viruses?",
    options: [
      { text: "No", points: 0 },
      { text: "Yes", points: 2 },
    ],
  },
  {
    id: "knowledge_2",
    number: 6,
    category: "knowledge",
    question: "Are you aware that it is bacteria that become resistant, not your body?",
    options: [
      { text: "No", points: 0 },
      { text: "Yes", points: 1 },
    ],
  },
  {
    id: "knowledge_3",
    number: 7,
    category: "knowledge",
    question: "Do you know what Antimicrobial Resistance (AMR) is?",
    options: [
      { text: "No", points: 0 },
      { text: "Yes", points: 1 },
    ],
  },

  // ENVIRONMENTAL QUESTIONS (3 questions, max 6 points)
  {
    id: "environmental_1",
    number: 8,
    category: "environmental",
    question: "Do you have access to clean drinking water and proper sanitation?",
    options: [
      { text: "Yes", points: 0 },
      { text: "No", points: 2 },
    ],
  },
  {
    id: "environmental_2",
    number: 9,
    category: "environmental",
    question: "Do you live in an area with poor waste management or environmental pollution?",
    options: [
      { text: "No", points: 0 },
      { text: "Yes", points: 2 },
    ],
  },
  {
    id: "environmental_3",
    number: 10,
    category: "environmental",
    question: "How often do you wash your hands with clean water and soap?",
    options: [
      { text: "Always", points: 0 },
      { text: "Sometimes", points: 1 },
      { text: "Rarely", points: 2 },
    ],
  },

  // SOCIOECONOMIC QUESTIONS (2 questions, max 4 points)
  {
    id: "socioeconomic_1",
    number: 11,
    category: "socioeconomic",
    question: "Do you skip doses of prescribed antibiotics due to cost?",
    options: [
      { text: "No", points: 0 },
      { text: "Yes", points: 2 },
    ],
  },
  {
    id: "socioeconomic_2",
    number: 12,
    category: "socioeconomic",
    question: "Do you buy antibiotics from informal vendors or street sellers instead of licensed pharmacies?",
    options: [
      { text: "No", points: 0 },
      { text: "Yes", points: 2 },
    ],
  },
];

/**
 * Category Weights for Risk Scoring
 * Total: 100% (1.0)
 */
export const CATEGORY_WEIGHTS: CategoryWeights = {
  behavioral: 0.4,      // 40%
  knowledge: 0.2,       // 20%
  environmental: 0.2,   // 20%
  socioeconomic: 0.2,   // 20%
};

/**
 * Maximum Points Per Category
 * Used for normalization to 0-100 scale
 */
export const MAX_POINTS_PER_CATEGORY: MaxPointsPerCategory = {
  behavioral: 11,       // 0 + 3 + 3 + 2
  knowledge: 4,         // 2 + 1 + 1
  environmental: 6,     // 2 + 2 + 2
  socioeconomic: 4,     // 2 + 2
};

/**
 * Risk Level Thresholds
 * Score ranges for classification
 */
export const RISK_LEVEL_THRESHOLDS = {
  low: { min: 0, max: 30 },
  moderate: { min: 31, max: 60 },
  high: { min: 61, max: 100 },
};

/**
 * Get question by ID
 */
export function getQuestionById(id: string): AssessmentQuestion | undefined {
  return ASSESSMENT_QUESTIONS.find((q) => q.id === id);
}

/**
 * Get question by number (1-12)
 */
export function getQuestionByNumber(number: number): AssessmentQuestion | undefined {
  return ASSESSMENT_QUESTIONS.find((q) => q.number === number);
}

/**
 * Get all questions for a category
 */
export function getQuestionsByCategory(category: Category): AssessmentQuestion[] {
  return ASSESSMENT_QUESTIONS.filter((q) => q.category === category);
}

/**
 * Determine risk level from normalized score
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score <= 30) return "low";
  if (score <= 60) return "moderate";
  return "high";
}

/**
 * Get risk level color for UI
 */
export function getRiskLevelColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: "#28A745",      // Green
    moderate: "#FFC107", // Yellow
    high: "#DC3545",     // Red
  };
  return colors[level];
}

/**
 * Get risk level label
 */
export function getRiskLevelLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    low: "LOW RISK",
    moderate: "MODERATE RISK",
    high: "HIGH RISK",
  };
  return labels[level];
}
