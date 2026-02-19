"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { QuestionnaireContainer } from "@/components/questionnaire";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import type { QuestionnaireResponseValue } from "@/components/questionnaire/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button, EmptyState, LoadingState } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

interface QuestionnairePageProps {
  params: Promise<{ sessionId: string }>;
}

export default function QuestionnairePage({ params }: QuestionnairePageProps) {
  const { sessionId } = use(params);
  const router = useRouter();
  const { locale, messages } = useDashboardMessages();
  const pagePath = withLocalePrefix(`/fit/${sessionId}/questionnaire`, locale);
  const logMarketingEvent = useMarketingEventLogger();

  const session = useQuery(api.sessions.queries.getById, {
    sessionId: sessionId as Id<"fitSessions">,
  });

  const questions = useQuery(api.questionnaire.queries.getQuestions);
  const responses = useQuery(api.questionnaire.queries.getResponses, {
    sessionId: sessionId as Id<"fitSessions">,
  });

  const saveResponse = useMutation(api.questionnaire.mutations.saveResponse);
  const completeQuestionnaire = useMutation(
    api.questionnaire.mutations.completeQuestionnaire
  );

  const handleSaveResponse = async (
    questionId: string,
    response: QuestionnaireResponseValue
  ): Promise<void> => {
    await saveResponse({
      sessionId: sessionId as Id<"fitSessions">,
      questionId,
      response,
    });
  };

  const handleComplete = async () => {
    try {
      await completeQuestionnaire({
        sessionId: sessionId as Id<"fitSessions">,
      });
      logMarketingEvent({
        eventType: "funnel_questionnaire_complete",
        locale,
        pagePath,
        section: "questionnaire_complete",
      });
      router.push(withLocalePrefix(`/fit/${sessionId}/results`, locale));
    } catch (error) {
      logMarketingEvent({
        eventType: "questionnaire_complete_error",
        locale,
        pagePath,
        section: "questionnaire_complete",
      });
      throw error;
    }
  };

  if (session === undefined || questions === undefined || responses === undefined) {
    return <LoadingState label={messages.questionnaire.loading} />;
  }

  if (session === null) {
    return (
      <EmptyState
        title={messages.questionnaire.sessionNotFound.title}
        description={messages.questionnaire.sessionNotFound.description}
        action={
          <Link href={withLocalePrefix("/fit", locale)}>
            <Button>{messages.questionnaire.sessionNotFound.cta}</Button>
          </Link>
        }
      />
    );
  }

  const responsesRecord: Record<string, QuestionnaireResponseValue> = {};
  responses.forEach((r) => {
    const response = r.response;
    if (
      typeof response === "string" ||
      typeof response === "number" ||
      (Array.isArray(response) &&
        response.every((value) => typeof value === "string"))
    ) {
      responsesRecord[r.questionId] = response;
    }
  });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={withLocalePrefix("/fit", locale)}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {messages.common.back}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {messages.questionnaire.title}
        </h1>
        <p className="text-gray-600 mt-2">
          {messages.questionnaire.subtitle}
        </p>
      </div>

      {/* Questionnaire */}
      <QuestionnaireContainer
        questions={questions}
        responses={responsesRecord}
        onSaveResponse={handleSaveResponse}
        onComplete={handleComplete}
      />
    </div>
  );
}
