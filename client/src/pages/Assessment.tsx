/**
 * Assessment Flow Page
 *
 * Main orchestration component that manages:
 * - Session creation
 * - Question progression
 * - Answer submission
 * - Results display
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AssessmentIntro from "./AssessmentIntro";
import QuestionCard from "@/components/QuestionCard";
import AssessmentResults from "./AssessmentResults";
import { Loader2 } from "lucide-react";
import { AssessmentQuestion, AssessmentResult } from "@/lib/types";

type AssessmentState = "intro" | "questions" | "results" | "loading" | "error";

export default function Assessment() {
  const [state, setState] = useState<AssessmentState>("intro");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState<AssessmentQuestion | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // tRPC mutations and queries
  const createSessionMutation = trpc.assessment.createSession.useMutation();
  const submitResponseMutation = trpc.assessment.submitResponse.useMutation();
  const submitAssessmentMutation = trpc.assessment.submitAssessment.useMutation();

  /**
   * Start assessment - create session
   */
  const handleStart = async () => {
    setState("loading");
    try {
      const session = await createSessionMutation.mutateAsync();
      setSessionId(session.sessionId);
      setCurrentQuestionNumber(1);
      setSelectedAnswers({});
      
      // Fetch first question
      const utils = trpc.useUtils();
      const question = await utils.assessment.getQuestion.fetch({
        sessionId: session.sessionId,
        questionNumber: 1,
      });
      setCurrentQuestion(question as AssessmentQuestion);
      setState("questions");
    } catch (err) {
      console.error("Error starting assessment:", err);
      setError(err instanceof Error ? err.message : "Failed to start assessment");
      setState("error");
      toast.error("Failed to start assessment. Please try again.");
    }
  };

  /**
   * Handle answer selection
   */
  const handleSelectAnswer = async (answer: string) => {
    if (!sessionId || !currentQuestion) return;

    try {
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: answer,
      }));

      // Submit response to backend
      await submitResponseMutation.mutateAsync({
        sessionId,
        questionId: currentQuestion.id,
        answerText: answer,
      });

      // Move to next question or show results
      if (currentQuestionNumber < 12) {
        setCurrentQuestionNumber(currentQuestionNumber + 1);
        const utils = trpc.useUtils();
        const nextQuestion = await utils.assessment.getQuestion.fetch({
          sessionId,
          questionNumber: currentQuestionNumber + 1,
        });
        setCurrentQuestion(nextQuestion as AssessmentQuestion);
      } else {
        // All questions answered - calculate results
        handleSubmitAssessment();
      }
    } catch (err) {
      console.error("Error submitting response:", err);
      toast.error("Failed to save your answer. Please try again.");
    }
  };

  /**
   * Submit assessment and get results
   */
  const handleSubmitAssessment = async () => {
    if (!sessionId) return;

    setState("loading");
    try {
      const assessmentResult = await submitAssessmentMutation.mutateAsync({
        sessionId,
      });
      setResult(assessmentResult as AssessmentResult);
      setState("results");
      toast.success("Assessment completed! Here are your results.");
    } catch (err) {
      console.error("Error submitting assessment:", err);
      setError(err instanceof Error ? err.message : "Failed to submit assessment");
      setState("error");
      toast.error("Failed to calculate results. Please try again.");
    }
  };

  /**
   * Restart assessment
   */
  const handleRestart = () => {
    setSessionId(null);
    setCurrentQuestionNumber(1);
    setSelectedAnswers({});
    setCurrentQuestion(null);
    setResult(null);
    setError(null);
    setState("intro");
  };

  /**
   * Render based on state
   */
  if (state === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRestart}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (state === "intro") {
    return <AssessmentIntro onStart={handleStart} isLoading={createSessionMutation.isPending} />;
  }

  if (state === "questions" && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <div className="max-w-2xl mx-auto py-8">
          <QuestionCard
            questionNumber={currentQuestionNumber}
            totalQuestions={12}
            question={currentQuestion.question}
            category={currentQuestion.category}
            options={currentQuestion.options}
            selectedAnswer={selectedAnswers[currentQuestion.id]}
            onSelectAnswer={handleSelectAnswer}
            isLoading={submitResponseMutation.isPending}
          />
        </div>
      </div>
    );
  }

  if (state === "results" && result) {
    return (
      <AssessmentResults
        totalScore={result.totalScore}
        riskLevel={result.riskLevel}
        categoryScores={result.categoryScores}
        categoryPercentages={result.categoryPercentages}
        highestRiskCategories={result.highestRiskCategories}
        interpretation={result.interpretation}
        recommendations={result.recommendations}
        onRestart={handleRestart}
        isLoading={false}
      />
    );
  }

  return null;
}
