"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import {
  BIKE_TYPE_LABELS,
  BIKE_TYPE_OPTIONS,
  isAeroCompatibleBikeType,
  type BikeType,
} from "@/lib/bikes";
import { reportClientError } from "@/lib/telemetry";
import { Bike, ArrowRight, AlertCircle } from "lucide-react";

const ridingStyles = [
  { value: "recreational", label: "Recreational", description: "Casual rides for fun and relaxation" },
  { value: "fitness", label: "Fitness", description: "Regular exercise and health focus" },
  { value: "sportive", label: "Sportive", description: "Long distance events and charity rides" },
  { value: "racing", label: "Racing", description: "Competitive cycling and time trials" },
  { value: "commuting", label: "Commuting", description: "Daily transportation to work" },
  { value: "touring", label: "Touring", description: "Long-distance travel with luggage" },
] as const;

const ridingGoals = [
  { value: "comfort", label: "Comfort", description: "Relaxed position, minimize strain" },
  { value: "balanced", label: "Balanced", description: "Mix of comfort and efficiency" },
  { value: "performance", label: "Performance", description: "More aggressive, power-focused" },
  { value: "aerodynamics", label: "Aero", description: "Most aggressive, aerodynamic position (Road/TT only)" },
] as const;

type RidingStyle = typeof ridingStyles[number]["value"];
type PrimaryGoal = typeof ridingGoals[number]["value"];

export default function NewFitSessionPage() {
  const router = useRouter();
  const [bikeType, setBikeType] = useState<BikeType | "">("");
  const [selectedBikeId, setSelectedBikeId] = useState<Id<"bikes"> | null>(null);
  const [ridingStyle, setRidingStyle] = useState<RidingStyle | "">("");
  const [ridingGoal, setRidingGoal] = useState<PrimaryGoal | "">("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const profile = useQuery(api.profiles.queries.getMyProfile);
  const bikes = useQuery(api.bikes.queries.listByUser);
  const createSession = useMutation(api.sessions.mutations.create);

  const hasProfile = profile !== undefined && profile !== null;
  const isLoadingProfile = profile === undefined;
  const isLoadingBikes = bikes === undefined;
  const selectedBike = bikes?.find((bike) => bike._id === selectedBikeId) || null;
  const effectiveBikeType = selectedBike?.bikeType ?? bikeType;
  const isSelectedGoalAllowed =
    ridingGoal !== "aerodynamics" || isAeroCompatibleBikeType(effectiveBikeType);

  const canStart =
    effectiveBikeType &&
    ridingStyle &&
    ridingGoal &&
    isSelectedGoalAllowed &&
    hasProfile &&
    !isCreating;

  const handleSelectBike = (bikeId: Id<"bikes">, selectedType: BikeType) => {
    setSelectedBikeId(bikeId);
    setBikeType(selectedType);
  };

  const handleUseCustomBikeType = () => {
    setSelectedBikeId(null);
  };

  const handleStartSession = async () => {
    if (!effectiveBikeType || !ridingStyle || !ridingGoal || !isSelectedGoalAllowed) {
      return;
    }

    setCreateError(null);
    setIsCreating(true);
    try {
      const sessionId = await createSession({
        bikeType: effectiveBikeType,
        ridingStyle,
        primaryGoal: ridingGoal,
        bikeId: selectedBike?._id,
      });
      router.push(`/fit/${sessionId}/questionnaire`);
    } catch (error) {
      setCreateError(
        reportClientError(error, {
          area: "fit",
          action: "createSession",
          operationType: "mutation",
          metadata: {
            bikeType: effectiveBikeType,
            ridingStyle,
            primaryGoal: ridingGoal,
            hasBikeId: Boolean(selectedBike?._id),
          },
        })
      );
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Start New Fit Session</h1>
        <p className="text-gray-600 mt-2">
          Choose your bike and riding goals to get personalized setup
          recommendations.
        </p>
      </div>

      {!isLoadingProfile && !hasProfile && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">
                Complete your profile first
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                You need to enter your body measurements before starting a fit
                session.
              </p>
              <Link href="/profile">
                <Button variant="outline" size="sm" className="mt-3">
                  Go to Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {isLoadingBikes && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
          Loading saved bikes...
        </div>
      )}

      {bikes && bikes.length > 0 && (
        <Card variant="bordered" className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Select a saved bike (optional)</CardTitle>
              {selectedBikeId && (
                <Button variant="outline" size="sm" onClick={handleUseCustomBikeType}>
                  Use custom bike type
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {bikes.map((bike) => (
                <button
                  key={bike._id}
                  type="button"
                  onClick={() => handleSelectBike(bike._id, bike.bikeType)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    selectedBikeId === bike._id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p
                    className={`font-medium ${
                      selectedBikeId === bike._id
                        ? "text-blue-900"
                        : "text-gray-900"
                    }`}
                  >
                    {bike.name}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      selectedBikeId === bike._id
                        ? "text-blue-700"
                        : "text-gray-500"
                    }`}
                  >
                    {BIKE_TYPE_LABELS[bike.bikeType]}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card variant="bordered" className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bike className="h-5 w-5 text-blue-600" />
            <CardTitle>What type of bike?</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {selectedBike ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              Using saved bike <span className="font-semibold">{selectedBike.name}</span> ({BIKE_TYPE_LABELS[selectedBike.bikeType]}).
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {BIKE_TYPE_OPTIONS.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setBikeType(type.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    bikeType === type.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p
                    className={`font-medium ${
                      bikeType === type.value ? "text-blue-900" : "text-gray-900"
                    }`}
                  >
                    {type.label}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      bikeType === type.value ? "text-blue-700" : "text-gray-500"
                    }`}
                  >
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card variant="bordered" className="mb-6">
        <CardHeader>
          <CardTitle>How do you typically ride?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ridingStyles.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => setRidingStyle(style.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  ridingStyle === style.value
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p
                  className={`font-medium ${
                    ridingStyle === style.value ? "text-blue-900" : "text-gray-900"
                  }`}
                >
                  {style.label}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    ridingStyle === style.value ? "text-blue-700" : "text-gray-500"
                  }`}
                >
                  {style.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card variant="bordered" className="mb-6">
        <CardHeader>
          <CardTitle>What&apos;s your primary goal?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {ridingGoals
              .filter(
                (goal) =>
                      goal.value !== "aerodynamics" ||
                      isAeroCompatibleBikeType(effectiveBikeType)
              )
              .map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => setRidingGoal(goal.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    ridingGoal === goal.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p
                    className={`font-medium ${
                      ridingGoal === goal.value
                        ? "text-blue-900"
                        : "text-gray-900"
                    }`}
                  >
                    {goal.label}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      ridingGoal === goal.value
                        ? "text-blue-700"
                        : "text-gray-500"
                    }`}
                  >
                    {goal.description}
                  </p>
                </button>
              ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          size="lg"
          disabled={!canStart}
          isLoading={isCreating}
          onClick={handleStartSession}
        >
          Continue to Questions
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {createError && (
        <p className="text-sm text-red-600 text-right mt-2">{createError}</p>
      )}

      {!canStart && bikeType && ridingStyle && ridingGoal && !hasProfile && (
        <p className="text-sm text-gray-500 text-right mt-2">
          Complete your profile to continue
        </p>
      )}
    </div>
  );
}
