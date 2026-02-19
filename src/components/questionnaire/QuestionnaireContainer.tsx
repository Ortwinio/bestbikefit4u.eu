"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  LoadingState,
  EmptyState,
  ErrorState,
} from "@/components/ui";
import { QuestionRenderer } from "./QuestionRenderer";
import { ProgressBar } from "./ProgressBar";
import { getErrorMessage, reportClientError } from "@/lib/telemetry";
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

function hasQuestionResponse(response: QuestionnaireResponseValue | null): boolean {
  if (response === null || response === undefined) {
    return false;
  }
  if (Array.isArray(response)) {
    return response.length > 0;
  }
  return true;
}

function extractMissingRequiredQuestionIds(message: string): string[] {
  const marker = "Missing required responses:";
  const markerIndex = message.indexOf(marker);
  if (markerIndex === -1) {
    return [];
  }
  return message
    .slice(markerIndex + marker.length)
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function questionHeadingId(questionId: string): string {
  return `question-heading-${questionId}`;
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
  const [missingRequiredQuestionIds, setMissingRequiredQuestionIds] = useState<
    string[]
  >([]);

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
  const remainingQuestions = Math.max(totalQuestions - currentIndex, 0);
  const estimatedMinutesRemaining = Math.max(
    1,
    Math.ceil((remainingQuestions * 40) / 60)
  );

  useEffect(() => {
    if (totalQuestions > 0 && currentIndex > totalQuestions - 1) {
      setCurrentIndex(totalQuestions - 1);
    }
  }, [currentIndex, totalQuestions]);

  useEffect(() => {
    if (currentQuestion) {
      setCurrentResponse(responses[currentQuestion.questionId] ?? null);
    }
  }, [currentQuestion, responses]);

  useEffect(() => {
    if (!currentQuestion || !hasQuestionResponse(currentResponse)) {
      return;
    }
    setMissingRequiredQuestionIds((previous) =>
      previous.filter((questionId) => questionId !== currentQuestion.questionId)
    );
  }, [currentQuestion, currentResponse]);

  const jumpToQuestion = (questionId: string) => {
    const targetIndex = visibleQuestions.findIndex(
      (question) => question.questionId === questionId
    );
    if (targetIndex === -1) {
      return;
    }

    setCurrentIndex(targetIndex);
    setTimeout(() => {
      const heading = document.getElementById(questionHeadingId(questionId));
      heading?.scrollIntoView({ behavior: "smooth", block: "start" });
      heading?.focus();
    }, 50);
  };

  const handleNext = async () => {
    if (!currentQuestion) return;
    setActionError(null);
    setMissingRequiredQuestionIds([]);

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
        const message = getErrorMessage(error);
        const missingIds = extractMissingRequiredQuestionIds(message);
        if (missingIds.length > 0) {
          setMissingRequiredQuestionIds(missingIds);
          setActionError("Please answer all required questions before completing.");
          jumpToQuestion(missingIds[0]);
          return;
        }
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
    return <LoadingState label="Loading questionnaire..." />;
  }

  if (totalQuestions === 0 || !currentQuestion) {
    return (
      <EmptyState
        title="No questionnaire items available"
        description="Try again in a moment."
      />
    );
  }

  const hasResponse = hasQuestionResponse(currentResponse);

  const canProceed = !currentQuestion.isRequired || hasResponse;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-16 z-20 mb-6 rounded-lg border border-gray-200 bg-white/95 p-3 backdrop-blur md:top-4">
        <ProgressBar
          current={currentIndex + 1}
          total={totalQuestions}
          estimatedMinutes={estimatedMinutesRemaining}
        />
      </div>

      {missingRequiredQuestionIds.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">
            Required questions still need an answer:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {missingRequiredQuestionIds.map((questionId) => {
              const question = questions.find((item) => item.questionId === questionId);
              return (
                <button
                  key={questionId}
                  type="button"
                  onClick={() => jumpToQuestion(questionId)}
                  className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs text-amber-800 hover:bg-amber-100"
                >
                  {question?.questionText ?? questionId}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Card variant="bordered" className="mb-6">
        <CardContent className="pt-6">
          <QuestionRenderer
            question={currentQuestion}
            value={currentResponse}
            onChange={setCurrentResponse}
            headingId={questionHeadingId(currentQuestion.questionId)}
          />
        </CardContent>
      </Card>

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

      {actionError ? (
        <ErrorState
          className="mt-4"
          description={actionError}
          title="We couldn't complete this step"
        />
      ) : null}

      <p className="text-center text-sm text-gray-500 mt-4">
        Question {currentIndex + 1} of {totalQuestions}
        {currentQuestion.isRequired && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </p>
    </div>
  );
}
