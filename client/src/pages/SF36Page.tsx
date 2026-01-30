/**
 * SF36Page - Página Principal da Calculadora
 * Design: Minimalismo Médico Contemporâneo
 * - Layout em coluna única centrada (máx 600px)
 * - Barra de progresso no topo
 * - Navegação clara entre seções
 * - Transições suaves
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SF36_QUESTIONS, calculateScores, SF36Response } from "@/lib/sf36-data";
import { SF36Question } from "@/components/SF36Question";
import { SF36Results } from "@/components/SF36Results";
import { RespondentForm } from "@/components/RespondentForm";
import { RespondentData } from "@/lib/respondent";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

type PageState = "respondent-form" | "questionnaire" | "results";

export default function SF36Page() {
  const [pageState, setPageState] = useState<PageState>("respondent-form");
  const [respondentData, setRespondentData] = useState<RespondentData | null>(null);
  const [responses, setResponses] = useState<SF36Response>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Calculate progress
  const totalQuestions = SF36_QUESTIONS.length;
  const answeredCount = Object.keys(responses).length;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  // Get current question
  const currentQuestion = SF36_QUESTIONS[currentQuestionIndex];
  const isCurrentAnswered = responses[currentQuestion.id] !== undefined;

  // Handle respondent form submission
  const handleRespondentSubmit = (data: RespondentData) => {
    setRespondentData(data);
    setPageState("questionnaire");
  };

  // Handle response
  const handleResponse = (questionId: number, value: number) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Navigation
  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Calculate and show results
  const handleCalculate = () => {
    if (answeredCount === totalQuestions) {
      setPageState("results");
    }
  };

  // Reset form
  const handleReset = () => {
    setRespondentData(null);
    setResponses({});
    setPageState("respondent-form");
    setCurrentQuestionIndex(0);
  };

  // Auto-scroll to top when question changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentQuestionIndex, pageState]);

  // Render respondent form
  if (pageState === "respondent-form") {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-primary mb-1">
              Impulso Coaching
            </h1>
            <p className="text-sm text-muted-foreground italic">
              a mudança pode acontecer em um instante
            </p>
          </div>

          {/* Subtitle */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Índice de Vitalidade
            </h2>
            <p className="text-sm text-muted-foreground">
              Avaliação da saúde física/mental
            </p>
          </div>

          {/* Respondent Form */}
          <RespondentForm onSubmit={handleRespondentSubmit} />

          {/* Info */}
          <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
            <p className="text-xs text-foreground">
              <strong>Importante:</strong> Os dados pessoais são necessários para enviar seus resultados por email após a conclusão do questionário.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Render questionnaire
  if (pageState === "questionnaire") {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary mb-1">
              Impulso Coaching
            </h1>
            <p className="text-xs text-muted-foreground italic">
              a mudança pode acontecer em um instante
            </p>
          </div>

          {/* Title */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Índice de Vitalidade
            </h2>
            <p className="text-sm text-muted-foreground">
              Avaliação da saúde física/mental
            </p>
          </div>

          {/* Respondent Info */}
          {respondentData && (
            <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
              <p className="text-sm text-foreground">
                <strong>Respondente:</strong> {respondentData.fullName}
              </p>
            </Card>
          )}

          {/* Progress Section */}
          <Card className="p-4 md:p-6 mb-4 md:mb-8 bg-primary/5 border-primary/20">
            <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">
                  Progresso do Questionário
                </span>
                <span className="text-sm font-semibold text-primary">
                  {answeredCount} de {totalQuestions}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {Math.round(progressPercentage)}% concluído
              </p>
            </div>
          </Card>

          {/* Instructions */}
          {currentQuestionIndex === 0 && answeredCount === 0 && (
            <Card className="p-4 md:p-6 mb-4 md:mb-8 bg-blue-50 border-blue-200">
              <h2 className="text-base md:text-lg font-semibold text-foreground mb-2 md:mb-3">
                Instruções Importantes
              </h2>
              <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    Responda com sinceridade, pensando nas últimas 4 semanas
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Marque apenas uma opção por pergunta</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Pode ser respondido sozinho ou com ajuda</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>
                    Seus resultados serão enviados por email ao final
                  </span>
                </li>
              </ul>
            </Card>
          )}

          {/* Current Question */}
          <Card className="p-4 md:p-6 mb-4 md:mb-8">
            <div className="mb-3 md:mb-6 pb-3 md:pb-6 border-b border-border">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Pergunta {currentQuestionIndex + 1} de {totalQuestions}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    isCurrentAnswered
                      ? "bg-green-100 text-green-700"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {isCurrentAnswered ? "✓ Respondida" : "Pendente"}
                </span>
              </div>
            </div>

            <SF36Question
              question={currentQuestion}
              value={responses[currentQuestion.id]}
              onChange={(value) => handleResponse(currentQuestion.id, value)}
              isAnswered={isCurrentAnswered}
            />
          </Card>

          {/* Navigation */}
          <div className="flex gap-2 md:gap-3 justify-between mb-4 md:mb-8">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button
                onClick={handleCalculate}
                disabled={answeredCount !== totalQuestions}
                size="lg"
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                Calcular Resultados
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                size="lg"
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Status Bar */}
          <div className="text-center text-xs text-muted-foreground mt-2 md:mt-4">
            {answeredCount === totalQuestions ? (
              <p className="text-green-600 font-medium">
                ✓ Todas as perguntas foram respondidas. Clique em "Calcular
                Resultados" para ver seus escores.
              </p>
            ) : (
              <p>
                Faltam {totalQuestions - answeredCount} pergunta
                {totalQuestions - answeredCount !== 1 ? "s" : ""} para responder
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render results
  if (pageState === "results") {
    const results = calculateScores(responses);
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-1">
              Impulso Coaching
            </h1>
            <p className="text-xs text-muted-foreground italic">
              a mudança pode acontecer em um instante
            </p>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Índice de Vitalidade
            </h2>
            <p className="text-sm text-muted-foreground">
              Avaliação da saúde física/mental
            </p>
          </div>

          {/* Respondent Info */}
          {respondentData && (
            <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
              <p className="text-sm text-foreground">
                <strong>Respondente:</strong> {respondentData.fullName} ({respondentData.age} anos) - {respondentData.profession}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Email:</strong> {respondentData.email}
              </p>
            </Card>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Seus Resultados
            </h2>
            <p className="text-sm text-muted-foreground">
              Escores variam de 0 a 100, onde valores mais altos indicam melhor saúde
            </p>
          </div>

          {/* Results */}
          <SF36Results results={results} respondent={respondentData} />

          {/* Actions */}
          <div className="mt-8 flex gap-3 justify-center">
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Refazer Questionário
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
