/**
 * Assessment Introduction Page
 *
 * Welcome screen that introduces the AMR assessment and provides
 * a clear call-to-action to begin the 12-question flow.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface AssessmentIntroProps {
  onStart: () => void;
  isLoading?: boolean;
}

export default function AssessmentIntro({ onStart, isLoading = false }: AssessmentIntroProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      {/* Background medical imagery effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Header with logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <span className="text-2xl">🔬</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AMR-Check</h1>
          <p className="text-lg text-gray-600">Antimicrobial Resistance Risk Assessment</p>
        </div>

        {/* Main card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Welcome to AMR-Check 👋</CardTitle>
            <CardDescription className="text-blue-100">
              Understand your risk of contributing to antimicrobial resistance
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            {/* Introduction text */}
            <div className="mb-8 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                This assessment will help you understand your risk of contributing to{" "}
                <strong>Antimicrobial Resistance (AMR)</strong> through your daily habits and
                practices.
              </p>

              <p className="text-gray-700 leading-relaxed">
                The assessment consists of <strong>12 simple questions</strong> about your
                behaviors, knowledge, environment, and socioeconomic factors. Your answers will be
                kept <strong>private and anonymous</strong>.
              </p>

              <p className="text-gray-700 leading-relaxed">
                Based on your responses, you'll receive a personalized risk assessment and
                educational recommendations to help reduce your contribution to AMR.
              </p>
            </div>

            {/* Key points */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Educational Purpose Only</p>
                  <p className="text-sm text-gray-600">
                    This assessment is for educational purposes and is not a medical diagnosis.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Takes 5-10 Minutes</p>
                  <p className="text-sm text-gray-600">Quick and straightforward questions.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Instant Results</p>
                  <p className="text-sm text-gray-600">
                    Get your risk level and personalized recommendations immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Medical disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-900">
                  <strong>Important:</strong> If you have health concerns, please consult a
                  licensed healthcare professional. This assessment is not a substitute for
                  medical advice.
                </p>
              </div>
            </div>

            {/* Call to action */}
            <Button
              onClick={onStart}
              disabled={isLoading}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
            >
              {isLoading ? "Starting Assessment..." : "Start Assessment"}
            </Button>

            {/* Footer note */}
            <p className="text-center text-sm text-gray-500 mt-6">
              All your responses will be kept anonymous and confidential.
            </p>
          </CardContent>
        </Card>

        {/* WHO alignment note */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>
            This assessment aligns with WHO guidelines on antimicrobial resistance awareness and
            prevention.
          </p>
        </div>
      </div>
    </div>
  );
}
