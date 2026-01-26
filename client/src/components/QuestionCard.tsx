/**
 * Question Card Component
 *
 * Displays a single assessment question with answer options.
 * Provides immediate visual feedback when an answer is selected.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface QuestionOption {
  text: string;
}

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  category: string;
  options: QuestionOption[];
  selectedAnswer?: string;
  onSelectAnswer: (answer: string) => void;
  isLoading?: boolean;
}

export default function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  category,
  options,
  selectedAnswer,
  onSelectAnswer,
  isLoading = false,
}: QuestionCardProps) {
  const progressPercentage = Math.round((questionNumber / totalQuestions) * 100);

  // Category color mapping
  const categoryColors: Record<string, string> = {
    behavioral: "bg-blue-100 text-blue-800",
    knowledge: "bg-purple-100 text-purple-800",
    environmental: "bg-green-100 text-green-800",
    socioeconomic: "bg-orange-100 text-orange-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="shadow-lg border-0">
        {/* Header with progress */}
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg pb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium opacity-90">
                Question {questionNumber} of {totalQuestions}
              </p>
              <CardTitle className="text-2xl mt-1">
                {question}
              </CardTitle>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{progressPercentage}%</p>
              <span className={cn("inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1", categoryColors[category])}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-blue-400 rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-white h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </CardHeader>

        {/* Content with answer options */}
        <CardContent className="pt-8 pb-8">
          <div className="space-y-3">
            {options.map((option, index) => (
              <motion.div
                key={option.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Button
                  onClick={() => onSelectAnswer(option.text)}
                  disabled={isLoading}
                  variant={selectedAnswer === option.text ? "default" : "outline"}
                  className={cn(
                    "w-full h-auto py-4 px-6 text-left text-base font-medium transition-all duration-200",
                    selectedAnswer === option.text
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                      : "border-2 border-gray-200 hover:border-blue-400 text-gray-900"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center",
                        selectedAnswer === option.text
                          ? "bg-white border-white"
                          : "border-gray-300"
                      )}
                    >
                      {selectedAnswer === option.text && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </span>
                    <span>{option.text}</span>
                  </span>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Feedback message */}
          {selectedAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <p className="text-sm text-green-800">
                ✓ Answer recorded. Ready for the next question.
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
