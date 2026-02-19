"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  LoadingState,
  EmptyState,
} from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { Plus, Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { locale, messages } = useDashboardMessages();
  const sessions = useQuery(api.sessions.queries.listByUser);
  const profile = useQuery(api.profiles.queries.getMyProfile);

  const isLoading = sessions === undefined;
  const hasProfile = profile !== undefined && profile !== null;

  const completedSessions =
    sessions?.filter((s) => s.status === "completed").length ?? 0;
  const lastSession = sessions?.[0];
  const lastFitDate = lastSession?.completedAt
    ? new Date(lastSession.completedAt).toLocaleDateString()
    : "-";
  const statusConfig: Record<
    string,
    { icon: typeof CheckCircle; color: string; label: string }
  > = {
    completed: {
      icon: CheckCircle,
      color: "text-green-500",
      label: messages.sessions.status.completed,
    },
    in_progress: {
      icon: Clock,
      color: "text-yellow-500",
      label: messages.sessions.status.inProgress,
    },
    questionnaire_complete: {
      icon: Clock,
      color: "text-blue-500",
      label: messages.sessions.status.processing,
    },
    processing: {
      icon: Clock,
      color: "text-blue-500",
      label: messages.sessions.status.processing,
    },
    archived: {
      icon: AlertCircle,
      color: "text-gray-400",
      label: messages.sessions.status.archived,
    },
  };
  const ridingStyleLabels: Record<string, string> = {
    recreational: messages.sessions.ridingStyle.recreational,
    fitness: messages.sessions.ridingStyle.fitness,
    sportive: messages.sessions.ridingStyle.sportive,
    racing: messages.sessions.ridingStyle.racing,
    commuting: messages.sessions.ridingStyle.commuting,
    touring: messages.sessions.ridingStyle.touring,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{messages.home.title}</h1>
        <Link href={withLocalePrefix("/fit", locale)}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {messages.home.newFitCta}
          </Button>
        </Link>
      </div>

      {/* Profile Warning */}
      {!hasProfile && profile !== undefined && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">
                {messages.home.profileWarning.title}
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                {messages.home.profileWarning.description}
              </p>
              <Link href={withLocalePrefix("/profile", locale)}>
                <Button variant="outline" size="sm" className="mt-3">
                  {messages.home.profileWarning.cta}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card variant="bordered">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? "-" : sessions?.length ?? 0}
            </div>
            <p className="text-sm text-gray-500">{messages.home.stats.totalSessions}</p>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {completedSessions}
            </div>
            <p className="text-sm text-gray-500">{messages.home.stats.completedFits}</p>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{lastFitDate}</div>
            <p className="text-sm text-gray-500">{messages.home.stats.lastFitDate}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>{messages.home.recentSessions.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState
              label={messages.home.recentSessions.loading}
              className="py-8"
            />
          ) : !sessions || sessions.length === 0 ? (
            <EmptyState
              title={messages.home.recentSessions.emptyTitle}
              description={messages.home.recentSessions.emptyDescription}
              action={
                <Link href={withLocalePrefix("/fit", locale)}>
                  <Button>{messages.home.recentSessions.emptyCta}</Button>
                </Link>
              }
              className="border-0 p-0 shadow-none"
            />
          ) : (
            <div className="divide-y divide-gray-200">
              {sessions.map((session) => {
                const config = statusConfig[session.status] || statusConfig.in_progress;
                const StatusIcon = config.icon;
                const sessionLink =
                  session.status === "completed"
                    ? withLocalePrefix(`/fit/${session._id}/results`, locale)
                    : session.status === "in_progress"
                      ? withLocalePrefix(`/fit/${session._id}/questionnaire`, locale)
                      : withLocalePrefix(`/fit/${session._id}/results`, locale);

                return (
                  <div
                    key={session._id}
                    className="flex items-center justify-between py-4"
                  >
                    <div className="flex items-center gap-4">
                      <StatusIcon className={`h-5 w-5 ${config.color}`} />
                      <div>
                        <p className="font-medium text-gray-900">
                          {ridingStyleLabels[session.ridingStyle] || session.ridingStyle}{" "}
                          {messages.home.recentSessions.fitSuffix}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(session.createdAt).toLocaleDateString()} •{" "}
                          {session.primaryGoal}
                        </p>
                      </div>
                    </div>
                    <Link href={sessionLink}>
                      <Button variant="ghost" size="sm">
                        {session.status === "completed" ? (
                          messages.home.recentSessions.actions.viewResults
                        ) : session.status === "in_progress" ? (
                          <>
                            {messages.home.recentSessions.actions.continue}
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </>
                        ) : (
                          messages.home.recentSessions.actions.view
                        )}
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
