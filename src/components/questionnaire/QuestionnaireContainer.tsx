"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardContent } from "@/components/ui";
import { QuestionRenderer } from "./QuestionRenderer";
import { ProgressBar } from "./ProgressBar";
import { reportClientError } from "@/lib/telemetry";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import type { QuestionDefinition, QuestionnaireResponseValue } from "./types";

interface QuestionnaireContainerProps {
  questions: QuestionDefinition[];
  responses: Record<string, QuestionnaireResponseValue>;
  onSaveResponse: (
    questionId: string,
    response: QuestionnaireResponseValue
  ) => Promise<void>;
  onComplete: () => Promise<void>;
  isLoading?: boolean;
}

export function QuestionnaireContainer({
  questions,
  responses,
  onSaveResponse,
  onComplete,
  isLoading = false,
}: QuestionnaireContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentResponse, setCurrentResponse] =
    useState<QuestionnaireResponseValue | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter questions based on conditions
  const visibleQuestions = questions.filter((q) => {
    if (!q.showCondition) return true;

    const dependsOnResponse = responses[q.showCondition.dependsOnQuestionId];
    if (!dependsOnResponse) return false;

    const responseValues = Array.isArray(dependsOnResponse)
      ? dependsOnResponse
      : [dependsOnResponse];

    return q.showCondition.requiredValues.some((rv) =>
      responseValues.includes(rv)
    );
  });

  const currentQuestion = visibleQuestions[currentIndex];
  const totalQuestions = visibleQuestions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  useEffect(() => {
    if (totalQuestions > 0 && currentIndex > totalQuestions - 1) {
      setCurrentIndex(totalQuestions - 1);
    }
  }, [currentIndex, totalQuestions]);

  // Load existing response when question changes
  useEffect(() => {
    if (currentQuestion) {
      setCurrentResponse(responses[currentQuestion.questionId] ?? null);
    }
  }, [currentQuestion, responses]);

  const handleNext = async () => {
    if (!currentQuestion) return;
    setActionError(null);

    // Save current response
    if (currentResponse !== null) {
      setIsSaving(true);
      try {
        await onSaveResponse(currentQuestion.questionId, currentResponse);
      } catch (error) {
        setActionError(
          reportClientError(error, {
            area: "questionnaire",
            action: "saveResponse",
            operationType: "mutation",
            subjectId: currentQuestion.questionId,
            metadata: { questionId: currentQuestion.questionId },
          })
        );
        return;
      } finally {
        setIsSaving(false);
      }
    }

    if (isLastQuestion) {
      setIsCompleting(true);
      try {
        await onComplete();
      } catch (error) {
        setActionError(
          reportClientError(error, {
            area: "questionnaire",
            action: "completeQuestionnaire",
            operationType: "mutation",
          })
        );
      } finally {
        setIsCompleting(false);
      }
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    if (!currentQuestion?.isRequired && !isLastQuestion) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (totalQuestions === 0 || !currentQuestion) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        No questionnaire items are available right now. Please try again in a
        moment.
      </div>
    );
  }

  const hasResponse =
    currentResponse !== null &&
    currentResponse !== undefined &&
    (Array.isArray(currentResponse) ? currentResponse.length > 0 : true);

  const canProceed = !currentQuestion.isRequired || hasResponse;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <ProgressBar
        current={currentIndex + 1}
        total={totalQuestions}
        className="mb-8"
      />

      {/* Question Card */}
      <Card variant="bordered" className="mb-6">
        <CardContent className="pt-6">
          <QuestionRenderer
            question={currentQuestion}
            value={currentResponse}
            onChange={setCurrentResponse}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0 || isSaving || isCompleting}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {!currentQuestion.isRequired && !isLastQuestion && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isSaving || isCompleting}
            >
              Skip
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!canProceed || isSaving || isCompleting}
            isLoading={isSaving || isCompleting}
          >
            {isLastQuestion ? (
              <>
                Complete
                <Check className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>

      {actionError && (
        <p className="text-center text-sm text-red-600 mt-4">{actionError}</p>
      )}

      {/* Question counter */}
      <p className="text-center text-sm text-gray-500 mt-4">
        Question {currentIndex + 1} of {totalQuestions}
        {currentQuestion.isRequired && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </p>
    </div>
  );
}
