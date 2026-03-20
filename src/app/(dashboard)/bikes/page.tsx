"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  AccessibleDialog,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LoadingState,
  EmptyState,
  useToast,
} from "@/components/ui";
import { getBikeTypeLabel } from "@/lib/bikes";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { useResolvedImageUrl } from "@/hooks/useResolvedImageUrl";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PressureStatusBadge } from "@/components/features/pressure/PressureStatusBadge";
import { tubeTypeLabel } from "@/components/features/pressure/shared";

function BikeImage({ storageId }: { storageId?: string }) {
  const imageUrl = useResolvedImageUrl(storageId);

  if (!imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/default-bike.svg"
        alt=""
        className="aspect-video w-full rounded-[var(--radius-lg)] object-cover"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt=""
      className="aspect-video w-full rounded-[var(--radius-lg)] object-cover"
    />
  );
}

export default function BikesPage() {
  const { locale, messages } = useDashboardMessages();
  const toast = useToast();
  const bikes = useQuery(api.bikes.queries.listSummariesByUser);
  const removeBike = useMutation(api.bikes.mutations.remove);

  const [deletingBikeId, setDeletingBikeId] = useState<Id<"bikes"> | null>(
    null
  );
  const [pendingDelete, setPendingDelete] = useState<{
    bikeId: Id<"bikes">;
    bikeName: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (bikeId: Id<"bikes">, bikeName: string) => {
    setDeleteError(null);
    setDeletingBikeId(bikeId);
    try {
      await removeBike({ bikeId });
      setPendingDelete(null);
      toast.success({ description: messages.common.toasts.bikeDeleted });
    } catch (error) {
      console.error("Failed to delete bike:", error);
      if (error instanceof Error && error.message.includes("fitting history")) {
        setDeleteError(messages.bikes.delete.blocked);
      } else {
        setDeleteError(messages.bikes.delete.failed);
      }
    } finally {
      setDeletingBikeId(null);
    }
  };

  if (bikes === undefined) {
    return <LoadingState label={messages.bikes.loading} />;
  }

  const dateLocale = locale === "nl" ? "nl-NL" : "en-US";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{messages.bikes.title}</h1>
          <p className="text-gray-600 mt-2">{messages.bikes.subtitle}</p>
        </div>
        <Link href={withLocalePrefix("/bikes/new", locale)}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {messages.bikes.actions.addBike}
          </Button>
        </Link>
      </div>

      {bikes.length === 0 ? (
        <EmptyState
          title={messages.bikes.empty.title}
          description={messages.bikes.empty.description}
          action={
            <Link href={withLocalePrefix("/bikes/new", locale)}>
              <Button>{messages.bikes.empty.cta}</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {bikes.map((bike) => {
            const bikeTypeLabel = getBikeTypeLabel(bike.bikeType, messages);
            const ridingStyleLabel = bike.ridingStyle
              ? messages.fit.ridingStyles[bike.ridingStyle].label
              : null;
            const primaryGoalLabel = bike.primaryGoal
              ? messages.fit.goals[bike.primaryGoal].label
              : null;
            const fitSummary = bike.latestRecommendationSummary;
            const advisedPressure = bike.advisedPressureSummary;
            const activeWheelset = bike.activeWheelsetSummary;
            const activeTireSetup = bike.activeTireSetupSummary;
            const pressureState = bike.pressureStateSummary;
            const activeSetupDescriptor = activeTireSetup
              ? [
                  activeTireSetup.brand,
                  activeTireSetup.model,
                  `${activeTireSetup.widthFrontMm}/${activeTireSetup.widthRearMm} mm`,
                  tubeTypeLabel(activeTireSetup.tubeType, locale),
                ]
                  .filter(Boolean)
                  .join(" • ")
              : null;

            return (
              <Card key={bike._id} variant="bordered" className="overflow-hidden">
                <CardContent className="space-y-6">
                  <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="pt-6">
                      <Link
                        href={withLocalePrefix(`/bikes/${bike._id}`, locale)}
                        className="block"
                      >
                        <BikeImage storageId={bike.photoUrl} />
                      </Link>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4 pt-6">
                        <div>
                          <Link href={withLocalePrefix(`/bikes/${bike._id}`, locale)}>
                            <CardTitle>{bike.name}</CardTitle>
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            {[bike.brand, bike.model].filter(Boolean).join(" ") || bikeTypeLabel}
                          </p>
                          <p className="mt-2 text-sm text-gray-600">
                            {messages.bikes.cards.bikeSummary.replace(
                              "{bikeType}",
                              bikeTypeLabel
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={withLocalePrefix(`/fit?bikeId=${bike._id}`, locale)}
                          >
                            <Button size="sm">
                              {messages.bikeForm.actions.startFitForBike}
                            </Button>
                          </Link>
                          <Link href={withLocalePrefix(`/bikes/${bike._id}/edit`, locale)}>
                            <Button variant="outline" size="sm">
                              <Pencil className="h-4 w-4 mr-1" />
                              {messages.common.edit}
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setPendingDelete({
                                bikeId: bike._id,
                                bikeName: bike.name,
                              })
                            }
                            isLoading={deletingBikeId === bike._id}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {messages.common.delete}
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Card variant="bordered" className="bg-[color:var(--card)]">
                          <CardHeader>
                            <CardTitle>{messages.bikes.cards.bikeFit.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm text-gray-700">
                            <p className="text-gray-600">
                              {fitSummary
                                ? messages.bikes.cards.bikeFit.hasFitDescription
                                : messages.bikes.cards.bikeFit.noFitDescription}
                            </p>
                            <p>
                              {messages.fit.sections.ridingStyle}: {ridingStyleLabel ?? "-"}
                            </p>
                            <p>
                              {messages.fit.sections.primaryGoal}: {primaryGoalLabel ?? "-"}
                            </p>
                            {fitSummary ? (
                              <>
                                <p>
                                  {messages.results.algorithmVersionLabel}:{" "}
                                  {fitSummary.algorithmVersion}
                                </p>
                                <p>
                                  {messages.bikes.cards.bikeFit.lastUpdated}:{" "}
                                  {new Date(fitSummary.createdAt).toLocaleDateString(
                                    dateLocale
                                  )}
                                </p>
                                <Link
                                  href={withLocalePrefix(
                                    `/fit/${fitSummary.sessionId}/results`,
                                    locale
                                  )}
                                  className="inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800"
                                >
                                  {messages.home.recentSessions.actions.viewResults}
                                </Link>
                              </>
                            ) : (
                              <p className="text-gray-500">
                                {messages.dashboardFit.noResultsYet}
                              </p>
                            )}
                          </CardContent>
                        </Card>

                        <Card variant="bordered" className="bg-[color:var(--card)]">
                          <CardHeader>
                            <CardTitle>{messages.bikes.cards.advisedPressure.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm text-gray-700">
                            <p className="text-gray-600">
                              {activeSetupDescriptor
                                ? messages.bikes.cards.advisedPressure.descriptionWithSetup.replace(
                                    "{setup}",
                                    activeSetupDescriptor
                                  )
                                : messages.bikes.cards.advisedPressure.descriptionWithoutSetup}
                            </p>
                            {advisedPressure ? (
                              <>
                                <div className="flex items-center justify-between gap-3">
                                  <p>
                                    {messages.pressure.bikeCard.front}{" "}
                                    {advisedPressure.recommendedFrontBar}{" "}
                                    {messages.pressure.result.bar}
                                  </p>
                                  <PressureStatusBadge
                                    currentBar={advisedPressure.currentFrontBar}
                                    recommendedBar={advisedPressure.recommendedFrontBar}
                                    labels={messages.pressure.status}
                                  />
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <p>
                                    {messages.pressure.bikeCard.rear}{" "}
                                    {advisedPressure.recommendedRearBar}{" "}
                                    {messages.pressure.result.bar}
                                  </p>
                                  <PressureStatusBadge
                                    currentBar={advisedPressure.currentRearBar}
                                    recommendedBar={advisedPressure.recommendedRearBar}
                                    labels={messages.pressure.status}
                                  />
                                </div>
                                <p>
                                  {messages.pressure.bikeCard.lastCalculated}:{" "}
                                  {new Date(advisedPressure.createdAt).toLocaleDateString(
                                    dateLocale
                                  )}
                                </p>
                                {pressureState.isStale ? (
                                  <p className="text-amber-800 font-medium">
                                    {messages.dashboardHome.pressureStale}
                                  </p>
                                ) : null}
                              </>
                            ) : (
                              <p className="text-gray-500">
                                {messages.pressure.bikeCard.noCalculation}
                              </p>
                            )}
                          </CardContent>
                        </Card>

                        <Card variant="bordered" className="bg-[color:var(--card)]">
                          <CardHeader>
                            <CardTitle>{messages.bikes.cards.currentSetup.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm text-gray-700">
                            <p className="text-gray-600">
                              {bike.currentSetup
                                ? messages.bikes.cards.currentSetup.description
                                : messages.bikes.cards.currentSetup.emptyDescription}
                            </p>
                            <p>
                              {messages.bikes.fields.saddle}:{" "}
                              {bike.currentSetup?.saddleHeightMm ?? "-"} mm |{" "}
                              {messages.bikes.fields.setback}:{" "}
                              {bike.currentSetup?.saddleSetbackMm ?? "-"} mm
                            </p>
                            <p>
                              {messages.bikes.fields.stem}:{" "}
                              {bike.currentSetup?.stemLengthMm ?? "-"} mm @{" "}
                              {bike.currentSetup?.stemAngle ?? "-"} deg
                            </p>
                            <p>
                              {messages.bikes.fields.bar}:{" "}
                              {bike.currentSetup?.handlebarWidthMm ?? "-"} mm |{" "}
                              {messages.bikes.fields.crank}:{" "}
                              {bike.currentSetup?.crankLengthMm ?? "-"} mm
                            </p>
                          </CardContent>
                        </Card>

                        <Card variant="bordered" className="bg-[color:var(--card)]">
                          <CardHeader>
                            <CardTitle>
                              {messages.bikes.cards.currentTyrePressure.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm text-gray-700">
                            <p className="text-gray-600">
                              {activeWheelset && activeTireSetup
                                ? messages.bikes.cards.currentTyrePressure.description
                                    .replace("{wheelset}", activeWheelset.name)
                                    .replace("{setup}", activeTireSetup.name)
                                : messages.bikes.cards.currentTyrePressure.emptyDescription}
                            </p>
                            <p>
                              {messages.pressure.bikeDetail.activeWheelset}:{" "}
                              {activeWheelset?.name ??
                                messages.pressure.bikeDetail.noWheelset}
                            </p>
                            <p>
                              {messages.pressure.bikeDetail.activeTireSetup}:{" "}
                              {activeTireSetup?.name ??
                                messages.pressure.bikeDetail.noTireSetup}
                            </p>
                            {activeSetupDescriptor ? <p>{activeSetupDescriptor}</p> : null}
                            <p>
                              {messages.pressure.bikeDetail.currentPressure}:{" "}
                              {pressureState.hasCurrentPressure
                                ? `${advisedPressure?.currentFrontBar ?? "-"} / ${
                                    advisedPressure?.currentRearBar ?? "-"
                                  } ${messages.pressure.result.bar}`
                                : messages.bikes.cards.currentTyrePressure.noCurrentPressure}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AccessibleDialog
        open={pendingDelete !== null}
        onClose={() => {
          if (!deletingBikeId) {
            setPendingDelete(null);
            setDeleteError(null);
          }
        }}
        title={
          pendingDelete
            ? messages.bikes.delete.dialogTitle.replace(
                "{bikeName}",
                pendingDelete.bikeName
              )
            : messages.bikes.delete.dialogTitle.replace("{bikeName}", "")
        }
        description={messages.bikes.delete.dialogDescription}
      >
        <div className="space-y-4">
          {deleteError ? (
            <p className="text-sm text-[color:var(--danger)]">{deleteError}</p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setPendingDelete(null);
                setDeleteError(null);
              }}
              disabled={deletingBikeId !== null}
            >
              {messages.common.cancel}
            </Button>
            <Button
              variant="destructive"
              isLoading={deletingBikeId !== null}
              onClick={() =>
                pendingDelete
                  ? void handleDelete(
                      pendingDelete.bikeId,
                      pendingDelete.bikeName
                    )
                  : undefined
              }
            >
              {messages.bikes.delete.dialogConfirm}
            </Button>
          </div>
        </div>
      </AccessibleDialog>
    </div>
  );
}
