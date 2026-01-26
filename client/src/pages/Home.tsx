import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg">
              🔬
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AMR-Check</h1>
              <p className="text-sm text-gray-600">Antimicrobial Resistance Risk Assessment</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Understand Your AMR Risk</h2>
          <p className="text-xl text-gray-600 mb-8">
            Take a quick 12-question assessment to learn about your antimicrobial resistance risk
            and receive personalized recommendations.
          </p>
          <Button
            onClick={() => navigate("/assessment")}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg gap-2"
          >
            Start Assessment
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Quick Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Complete the assessment in just 5-10 minutes with 12 simple questions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Personalized Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get your risk level and category breakdown with actionable recommendations.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Anonymous & Private
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your responses are kept completely private and anonymous.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* About section */}
        <Card className="border-0 shadow-lg mb-12">
          <CardHeader>
            <CardTitle>About Antimicrobial Resistance (AMR)</CardTitle>
            <CardDescription>Why this assessment matters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Antimicrobial Resistance (AMR) occurs when bacteria, viruses, fungi, and parasites
              change over time and no longer respond to medicines. This is one of the top public
              health threats facing the world today.
            </p>
            <p className="text-gray-700">
              Your daily habits and practices significantly impact the development and spread of
              antimicrobial resistance. This assessment helps you understand your personal risk
              and provides guidance on how you can contribute to reducing AMR.
            </p>
            <p className="text-gray-700">
              <strong>This assessment is for educational purposes only</strong> and is not a
              medical diagnosis. If you have health concerns, please consult a licensed healthcare
              professional.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-600 text-sm">
          <p>
            This assessment aligns with WHO guidelines on antimicrobial resistance awareness and
            prevention.
          </p>
        </div>
      </footer>
    </div>
  );
}
