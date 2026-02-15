"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { MeasurementWizard, type WizardFormData } from "@/components/measurements";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import { reportClientError } from "@/lib/telemetry";
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
}: {
  profile: ProfileData;
  onEdit: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <Button onClick={onEdit}>
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Measurements
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Body Measurements Card */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-blue-600" />
              <CardTitle>Body Measurements</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-500">Height</dt>
                <dd className="font-medium">{profile.heightCm} cm</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Inseam</dt>
                <dd className="font-medium">{profile.inseamCm} cm</dd>
              </div>
              {profile.torsoLengthCm && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Torso</dt>
                  <dd className="font-medium">{profile.torsoLengthCm} cm</dd>
                </div>
              )}
              {profile.armLengthCm && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Arm Length</dt>
                  <dd className="font-medium">{profile.armLengthCm} cm</dd>
                </div>
              )}
              {profile.shoulderWidthCm && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Shoulder Width</dt>
                  <dd className="font-medium">{profile.shoulderWidthCm} cm</dd>
                </div>
              )}
              {profile.femurLengthCm && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Femur Length</dt>
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
              <CardTitle>Flexibility</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-green-600 capitalize">
                {profile.flexibilityScore?.replace("_", " ")}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Hamstring flexibility score
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Core Stability Card */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              <CardTitle>Core Stability</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-purple-600">
                {profile.coreStabilityScore}/5
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Plank hold assessment
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card variant="bordered" className="mt-6">
        <CardHeader>
          <CardTitle>Profile Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Your profile is complete. You can now start a fit session to get
            personalized bike setup recommendations.
          </p>
          <div className="mt-4">
            <Link href="/fit">
              <Button>Start New Fit Session</Button>
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
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const profileData = useQuery(api.profiles.queries.getMyProfile);
  const upsertProfile = useMutation(api.profiles.mutations.upsert);

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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Show wizard if no profile exists or editing
  if (!profileData || isEditing) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {profileData ? "Edit Your Measurements" : "Complete Your Profile"}
          </h1>
          <p className="text-gray-600 mt-2">
            {profileData
              ? "Update your body measurements for more accurate fit recommendations."
              : "Enter your body measurements to get personalized bike fit recommendations."}
          </p>
        </div>
        {saveError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {saveError}
          </div>
        )}
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
              Cancel
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Show profile summary
  return (
    <ProfileSummary profile={profileData} onEdit={() => setIsEditing(true)} />
  );
}
