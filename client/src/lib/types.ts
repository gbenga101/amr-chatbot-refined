/**
 * Frontend Type Definitions
 */

export type RiskLevel = "low" | "moderate" | "high";
export type Category = "behavioral" | "knowledge" | "environmental" | "socioeconomic";

export interface AssessmentQuestion {
  id: string;
  number: number;
  category: Category;
  question: string;
  options: Array<{ text: string }>;
  totalQuestions: number;
}

export interface AssessmentResult {
  totalScore: number;
  riskLevel: RiskLevel;
  categoryScores: Record<Category, number>;
  categoryPercentages: Record<Category, number>;
  highestRiskCategories: string[];
  interpretation: string;
  recommendations: string[];
  createdAt: Date;
}

export interface AssessmentSession {
  sessionId: string;
  createdAt: Date;
}
