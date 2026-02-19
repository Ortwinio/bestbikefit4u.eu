"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { MeasurementWizard, type WizardFormData } from "@/components/measurements";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  LoadingState,
  ErrorState,
} from "@/components/ui";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { reportClientError } from "@/lib/telemetry";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { User, Ruler, Activity, Edit2 } from "lucide-react";

interface ProfileData {
  heightCm: number;
  inseamCm: number;
  torsoLengthCm?: number;
  armLengthCm?: number;
  femurLengthCm?: number;
  shoulderWidthCm?: number;
  flexibilityScore: string;
  coreStabilityScore: number;
}

function ProfileSummary({
  profile,
  onEdit,
  fitHref,
  messages,
}: {
  profile: ProfileData;
  onEdit: () => void;
  fitHref: string;
  messages: ReturnType<typeof useDashboardMessages>["messages"];
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{messages.profile.title}</h1>
        <Button onClick={onEdit}>
          <Edit2 className="h-4 w-4 mr-2" />
          {messages.profile.actions.editMeasurements}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Body Measurements Card */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-blue-600" />
              <CardTitle>{messages.profile.sections.bodyMeasurements}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-500">{messages.profile.measurements.height}</dt>
                <dd className="font-medium">{profile.heightCm} cm</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">{messages.profile.measurements.inseam}</dt>
                <dd className="font-medium">{profile.inseamCm} cm</dd>
              </div>
              {profile.torsoLengthCm && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">{messages.profile.measurements.torso}</dt>
                  <dd className="font-medium">{profile.torsoLengthCm} cm</dd>
                </div>
              )}
              {profile.armLengthCm && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">{messages.profile.measurements.armLength}</dt>
                  <dd className="font-medium">{profile.armLengthCm} cm</dd>
                </div>
              )}
              {profile.shoulderWidthCm && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">{messages.profile.measurements.shoulderWidth}</dt>
                  <dd className="font-medium">{profile.shoulderWidthCm} cm</dd>
                </div>
              )}
              {profile.femurLengthCm && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">{messages.profile.measurements.femurLength}</dt>
                  <dd className="font-medium">{profile.femurLengthCm} cm</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Flexibility Card */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              <CardTitle>{messages.profile.sections.flexibility}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-green-600 capitalize">
                {profile.flexibilityScore?.replace("_", " ")}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {messages.profile.flexibility.helper}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Core Stability Card */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              <CardTitle>{messages.profile.sections.coreStability}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-purple-600">
                {profile.coreStabilityScore}/5
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {messages.profile.coreStability.helper}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card variant="bordered" className="mt-6">
        <CardHeader>
          <CardTitle>{messages.profile.status.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{messages.profile.status.description}</p>
          <div className="mt-4">
            <Link href={fitHref}>
              <Button>{messages.profile.status.startFitCta}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper to get default values from profile
function getDefaultValues(profile: ProfileData): Partial<WizardFormData> {
  return {
    heightCm: profile.heightCm,
    inseamCm: profile.inseamCm,
    torsoLengthCm: profile.torsoLengthCm,
    armLengthCm: profile.armLengthCm,
    femurLengthCm: profile.femurLengthCm,
    shoulderWidthCm: profile.shoulderWidthCm,
    flexibilityScore:
      profile.flexibilityScore as WizardFormData["flexibilityScore"],
    coreStabilityScore: profile.coreStabilityScore,
  };
}

export default function ProfilePage() {
  const { locale, messages } = useDashboardMessages();
  const pagePath = withLocalePrefix("/profile", locale);
  const logMarketingEvent = useMarketingEventLogger();
  const hasTrackedProfileViewRef = useRef(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const profileData = useQuery(api.profiles.queries.getMyProfile);
  const upsertProfile = useMutation(api.profiles.mutations.upsert);

  useEffect(() => {
    if (hasTrackedProfileViewRef.current || profileData === undefined) {
      return;
    }
    hasTrackedProfileViewRef.current = true;
    logMarketingEvent({
      eventType: "funnel_profile_view",
      locale,
      pagePath,
      section: "profile_page",
    });
  }, [locale, logMarketingEvent, pagePath, profileData]);

  const handleSaveProfile = async (data: WizardFormData) => {
    setSaveError(null);
    try {
      await upsertProfile({
        heightCm: data.heightCm,
        inseamCm: data.inseamCm,
        torsoLengthCm: data.torsoLengthCm,
        armLengthCm: data.armLengthCm,
        femurLengthCm: data.femurLengthCm,
        shoulderWidthCm: data.shoulderWidthCm,
        flexibilityScore: data.flexibilityScore,
        coreStabilityScore: data.coreStabilityScore,
      });
      setIsEditing(false);
    } catch (error) {
      setSaveError(
        reportClientError(error, {
          area: "profile",
          action: "upsertProfile",
          operationType: "mutation",
        })
      );
    }
  };

  if (profileData === undefined && !isEditing) {
    return <LoadingState label={messages.profile.loading} />;
  }

  // Show wizard if no profile exists or editing
  if (!profileData || isEditing) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {profileData
              ? messages.profile.edit.title
              : messages.profile.onboarding.title}
          </h1>
          <p className="text-gray-600 mt-2">
            {profileData
              ? messages.profile.edit.description
              : messages.profile.onboarding.description}
          </p>
        </div>
        {saveError ? (
          <ErrorState
            className="mb-6"
            title={messages.profile.errors.saveFailedTitle}
            description={saveError}
          />
        ) : null}
        <MeasurementWizard
          onComplete={handleSaveProfile}
          defaultValues={profileData ? getDefaultValues(profileData) : undefined}
        />
        {profileData && (
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => {
                setSaveError(null);
                setIsEditing(false);
              }}
            >
              {messages.common.cancel}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Show profile summary
  return (
    <ProfileSummary
      profile={profileData}
      fitHref={withLocalePrefix("/fit", locale)}
      messages={messages}
      onEdit={() => setIsEditing(true)}
    />
  );
}
