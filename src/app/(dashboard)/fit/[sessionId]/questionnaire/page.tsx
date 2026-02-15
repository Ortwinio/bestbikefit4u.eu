"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { QuestionnaireContainer } from "@/components/questionnaire";
import type { QuestionnaireResponseValue } from "@/components/questionnaire/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";

interface QuestionnairePageProps {
  params: Promise<{ sessionId: string }>;
}

export default function QuestionnairePage({ params }: QuestionnairePageProps) {
  const { sessionId } = use(params);
  const router = useRouter();

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
    await completeQuestionnaire({
      sessionId: sessionId as Id<"fitSessions">,
    });
    router.push(`/fit/${sessionId}/results`);
  };

  // Loading state
  if (session === undefined || questions === undefined || responses === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Session not found
  if (session === null) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Session Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The fit session you&apos;re looking for doesn&apos;t exist or has been
          archived.
        </p>
        <Link href="/fit">
          <Button>Start New Session</Button>
        </Link>
      </div>
    );
  }

  // Convert responses array to record
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
          href="/fit"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Tell Us About Your Riding
        </h1>
        <p className="text-gray-600 mt-2">
          Answer these questions to help us personalize your bike fit
          recommendations.
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
