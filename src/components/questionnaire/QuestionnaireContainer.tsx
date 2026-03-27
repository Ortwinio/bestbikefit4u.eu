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
import { QuestionnaireIntro } from "./QuestionnaireIntro";
import { QuestionnaireProgressBar } from "./QuestionnaireProgressBar";
import { getErrorMessage, reportClientError } from "@/lib/telemetry";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { formatMessage } from "@/i18n/dashboardMessages";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
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

function extractMissingRequiredQuestionIds(
  message: string,
  marker: string
): string[] {
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
  const { messages } = useDashboardMessages();
  const [showIntro, setShowIntro] = useState(
    () => Object.keys(responses).length === 0
  );
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
  const percentComplete = showIntro
    ? 0
    : Math.round((currentIndex / totalQuestions) * 100);

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

    const responseToSave = currentResponse;

    if (responseToSave !== null) {
      setIsSaving(true);
      try {
        await onSaveResponse(currentQuestion.questionId, responseToSave);
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

    // Recompute visible questions with the just-saved response included so that
    // conditional questions (e.g. climbing_importance after wants_climbing_profile)
    // are accounted for before deciding whether to complete or advance.
    const updatedResponses =
      responseToSave !== null
        ? { ...responses, [currentQuestion.questionId]: responseToSave }
        : responses;

    const updatedVisibleQuestions = questions.filter((q) => {
      if (!q.showCondition) return true;
      const dep = updatedResponses[q.showCondition.dependsOnQuestionId];
      if (!dep) return false;
      const vals = Array.isArray(dep) ? dep : [dep];
      return q.showCondition.requiredValues.some((rv) => vals.includes(rv as string));
    });

    const isActuallyLastQuestion =
      currentIndex === updatedVisibleQuestions.length - 1;

    if (isActuallyLastQuestion) {
      setIsCompleting(true);
      try {
        await onComplete();
      } catch (error) {
        const message = getErrorMessage(error);
        const missingIds = extractMissingRequiredQuestionIds(
          message,
          messages.questionnaire.errors.missingRequiredMarker
        );
        if (missingIds.length > 0) {
          setMissingRequiredQuestionIds(missingIds);
          setActionError(messages.questionnaire.missingRequired.header);
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
    } else {
      setShowIntro(true);
    }
  };

  const handleSkip = () => {
    if (!currentQuestion?.isRequired && !isLastQuestion) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (isLoading) {
    return <LoadingState label={messages.questionnaire.loading} />;
  }

  if (totalQuestions === 0 || !currentQuestion) {
    return (
      <EmptyState
        title={messages.questionnaire.emptyTitle}
        description={messages.questionnaire.emptyDescription}
      />
    );
  }

  const hasResponse = hasQuestionResponse(currentResponse);

  const canProceed = !currentQuestion.isRequired || hasResponse;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <QuestionnaireProgressBar
          estimatedMinutes={estimatedMinutesRemaining}
          percentComplete={percentComplete}
        />
      </div>

      {missingRequiredQuestionIds.length > 0 && (
        <div className="mb-6 rounded-lg border border-border bg-destructive-soft p-4">
          <p className="text-sm font-medium text-destructive">
            {messages.questionnaire.missingRequired.header}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {missingRequiredQuestionIds.map((questionId) => {
              const question = questions.find((item) => item.questionId === questionId);
              return (
                <Button
                  key={questionId}
                  size="sm"
                  variant="outline"
                  onClick={() => jumpToQuestion(questionId)}
                >
                  {question?.questionText ?? questionId}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      <Card variant="bordered" className="mb-6">
        <CardContent className="pt-6">
          {showIntro ? (
            <QuestionnaireIntro onStart={() => setShowIntro(false)} />
          ) : (
            <QuestionRenderer
              question={currentQuestion}
              value={currentResponse}
              onChange={setCurrentResponse}
              headingId={questionHeadingId(currentQuestion.questionId)}
            />
          )}
        </CardContent>
      </Card>

      {!showIntro && (
        <>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isSaving || isCompleting}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {messages.questionnaire.actions.previous}
            </Button>

            <div className="flex items-center gap-2">
              {!currentQuestion.isRequired && !isLastQuestion && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={isSaving || isCompleting}
                >
                  {messages.questionnaire.actions.skip}
                </Button>
              )}

              <Button
                onClick={handleNext}
                disabled={!canProceed || isSaving || isCompleting}
                isLoading={isSaving || isCompleting}
              >
                {isLastQuestion ? (
                  <>
                    {messages.questionnaire.actions.complete}
                    <Check className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  <>
                    {messages.questionnaire.actions.next}
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
              title={messages.questionnaire.errors.completeStepTitle}
            />
          ) : null}

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {formatMessage(messages.questionnaire.progress.questionOf, {
              current: currentIndex + 1,
              total: totalQuestions,
            })}
            {currentQuestion.isRequired && (
              <span className="ml-1 text-destructive">*</span>
            )}
          </p>
        </>
      )}
    </div>
  );
}
