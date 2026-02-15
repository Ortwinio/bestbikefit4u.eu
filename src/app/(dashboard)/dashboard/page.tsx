"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Plus, Clock, CheckCircle, AlertCircle, Bike, ArrowRight } from "lucide-react";

const statusConfig: Record<
  string,
  { icon: typeof CheckCircle; color: string; label: string }
> = {
  completed: {
    icon: CheckCircle,
    color: "text-green-500",
    label: "Completed",
  },
  in_progress: {
    icon: Clock,
    color: "text-yellow-500",
    label: "In Progress",
  },
  questionnaire_complete: {
    icon: Clock,
    color: "text-blue-500",
    label: "Processing",
  },
  processing: {
    icon: Clock,
    color: "text-blue-500",
    label: "Processing",
  },
  archived: {
    icon: AlertCircle,
    color: "text-gray-400",
    label: "Archived",
  },
};

const ridingStyleLabels: Record<string, string> = {
  recreational: "Recreational",
  fitness: "Fitness",
  sportive: "Sportive",
  racing: "Racing",
  commuting: "Commuting",
  touring: "Touring",
};

export default function DashboardPage() {
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link href="/fit">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Fit Session
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
                Complete your profile to get started
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Enter your body measurements to enable bike fit calculations.
              </p>
              <Link href="/profile">
                <Button variant="outline" size="sm" className="mt-3">
                  Complete Profile
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
            <p className="text-sm text-gray-500">Total Sessions</p>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">
              {completedSessions}
            </div>
            <p className="text-sm text-gray-500">Completed Fits</p>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{lastFitDate}</div>
            <p className="text-sm text-gray-500">Last Fit Date</p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Recent Fit Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : !sessions || sessions.length === 0 ? (
            <div className="text-center py-8">
              <Bike className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                You haven&apos;t started any fit sessions yet.
              </p>
              <Link href="/fit">
                <Button>Start Your First Fit</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sessions.map((session) => {
                const config = statusConfig[session.status] || statusConfig.in_progress;
                const StatusIcon = config.icon;
                const sessionLink =
                  session.status === "completed"
                    ? `/fit/${session._id}/results`
                    : session.status === "in_progress"
                      ? `/fit/${session._id}/questionnaire`
                      : `/fit/${session._id}/results`;

                return (
                  <div
                    key={session._id}
                    className="flex items-center justify-between py-4"
                  >
                    <div className="flex items-center gap-4">
                      <StatusIcon className={`h-5 w-5 ${config.color}`} />
                      <div>
                        <p className="font-medium text-gray-900">
                          {ridingStyleLabels[session.ridingStyle] || session.ridingStyle} Fit
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
                          "View Results"
                        ) : session.status === "in_progress" ? (
                          <>
                            Continue
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </>
                        ) : (
                          "View"
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
