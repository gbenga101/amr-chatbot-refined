/**
 * Assessment Results Page
 *
 * Displays the complete assessment results including:
 * - Overall risk level and score
 * - Category breakdown with percentages
 * - Personalized recommendations
 * - Medical disclaimer
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Download, Share2, Home } from "lucide-react";
import { motion } from "framer-motion";
import { RiskLevel } from "@/lib/types";

interface CategoryScore {
  name: string;
  percentage: number;
  color: string;
}

interface AssessmentResultsProps {
  totalScore: number;
  riskLevel: RiskLevel;
  categoryScores: Record<string, number>;
  categoryPercentages: Record<string, number>;
  highestRiskCategories: string[];
  interpretation: string;
  recommendations: string[];
  onRestart: () => void;
  isLoading?: boolean;
}

export default function AssessmentResults({
  totalScore,
  riskLevel,
  categoryScores,
  categoryPercentages,
  highestRiskCategories,
  interpretation,
  recommendations,
  onRestart,
  isLoading = false,
}: AssessmentResultsProps) {
  // Risk level styling
  const riskConfig: Record<RiskLevel, { color: string; bgColor: string; textColor: string; label: string }> = {
    low: {
      color: "#28A745",
      bgColor: "bg-green-50",
      textColor: "text-green-900",
      label: "LOW RISK",
    },
    moderate: {
      color: "#FFC107",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-900",
      label: "MODERATE RISK",
    },
    high: {
      color: "#DC3545",
      bgColor: "bg-red-50",
      textColor: "text-red-900",
      label: "HIGH RISK",
    },
  };

  const config = riskConfig[riskLevel];

  // Category display data
  const categoryData: CategoryScore[] = [
    {
      name: "Behavioral",
      percentage: categoryPercentages.behavioral || 0,
      color: "bg-blue-500",
    },
    {
      name: "Knowledge",
      percentage: categoryPercentages.knowledge || 0,
      color: "bg-purple-500",
    },
    {
      name: "Environmental",
      percentage: categoryPercentages.environmental || 0,
      color: "bg-green-500",
    },
    {
      name: "Socio-economic",
      percentage: categoryPercentages.socioeconomic || 0,
      color: "bg-orange-500",
    },
  ];

  const handleDownload = () => {
    // TODO: Implement PDF download functionality
    console.log("Download results as PDF");
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log("Share results");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Assessment Results</h1>
          <p className="text-lg text-gray-600">Here's your personalized AMR risk assessment</p>
        </motion.div>

        {/* Main score card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`shadow-xl border-0 ${config.bgColor}`}>
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                {/* Risk level badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                  className="inline-block mb-6"
                >
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg"
                    style={{ backgroundColor: config.color }}
                  >
                    {totalScore}
                  </div>
                </motion.div>

                {/* Risk level label */}
                <h2 className={`text-4xl font-bold mb-2 ${config.textColor}`}>{config.label}</h2>
                <p className="text-lg text-gray-700 mb-6">{interpretation}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Your risk scores across different categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {categoryData.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-900">{category.name}</p>
                      <p className="text-lg font-bold text-gray-900">{Math.round(category.percentage)}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${category.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${category.percentage}%` }}
                        transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Highest risk category note */}
        {highestRiskCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded"
          >
            <p className="text-sm text-gray-700">
              <strong>Highest Risk Area:</strong>{" "}
              {highestRiskCategories.length === 1
                ? `Your highest risk is in the ${highestRiskCategories[0]} category.`
                : `Your highest risk areas are: ${highestRiskCategories.join(", ")}.`}
            </p>
          </motion.div>
        )}

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>Actions you can take to reduce your AMR risk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="flex-shrink-0 text-lg">{recommendation.charAt(0)}</span>
                    <p className="text-gray-700 text-sm leading-relaxed">{recommendation.slice(2)}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Medical disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex gap-4"
        >
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-2">Important Medical Disclaimer</h3>
            <p className="text-sm text-amber-900 leading-relaxed">
              This assessment is for <strong>educational purposes only</strong> and is{" "}
              <strong>not a medical diagnosis</strong>. The results do not constitute medical advice
              or treatment recommendations. If you have health concerns or symptoms, please consult a
              licensed healthcare professional immediately. In case of medical emergencies, contact
              your local emergency services.
            </p>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex gap-4 flex-col sm:flex-row"
        >
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1 gap-2"
            disabled={isLoading}
          >
            <Download className="w-4 h-4" />
            Download Results
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex-1 gap-2"
            disabled={isLoading}
          >
            <Share2 className="w-4 h-4" />
            Share Results
          </Button>
          <Button
            onClick={onRestart}
            className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
            disabled={isLoading}
          >
            <Home className="w-4 h-4" />
            Start New Assessment
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-gray-600 py-4"
        >
          <p>
            Thank you for taking the AMR Risk Assessment. Your responses help raise awareness about
            antimicrobial resistance.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
