"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { Camera, ChevronLeft, ChevronRight, Loader2, Maximize2, Star, Trash2, XIcon } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { Button, useToast } from "@/components/ui";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/prototyper-ui/ui/dialog";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useResolvedImageUrl } from "@/hooks/useResolvedImageUrl";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { cn } from "@/utils/cn";
import {
  buildBikePhotoThumbnailLabel,
  formatBikePhotoCount,
  getBikePhotoAltText,
} from "./bikePhotoGalleryHelpers";

type BikePhotoItem = {
  id: string;
  storageId: string;
  caption?: string;
  isPrimary: boolean;
  isLegacy: boolean;
};

interface BikePhotoGalleryProps {
  bikeId: Id<"bikes">;
  bikeName: string;
  photos: BikePhotoItem[];
}

function BikePhotoThumbnail({
  bikeName,
  photo,
  photoIndex,
  totalPhotos,
  isSelected,
  onSelect,
}: {
  bikeName: string;
  photo: BikePhotoItem;
  photoIndex: number;
  totalPhotos: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { messages } = useDashboardMessages();
  const imageUrl = useResolvedImageUrl(photo.storageId);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={buildBikePhotoThumbnailLabel({
        bikeName,
        index: photoIndex + 1,
        total: totalPhotos,
        isPrimary: photo.isPrimary,
        isSelected,
        primaryLabel: messages.bikes.gallery.primaryBadge,
      })}
      className={cn(
        "relative aspect-square overflow-hidden rounded-[var(--radius-md)] border transition",
        isSelected
          ? "border-[color:var(--primary)] ring-2 ring-[color:var(--primary)]/20"
          : "border-[color:var(--border)]"
      )}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={getBikePhotoAltText({
            bikeName,
            index: photoIndex + 1,
            total: totalPhotos,
          })}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]">
          <Camera className="h-4 w-4" />
        </div>
      )}
      {photo.isPrimary ? (
        <span className="absolute left-2 top-2 rounded-full bg-[color:var(--background)]/90 px-2 py-1 text-[10px] font-semibold text-[color:var(--foreground)]">
          <Star className="mr-1 inline h-3 w-3" />
          {messages.bikes.gallery.primaryBadge}
        </span>
      ) : null}
    </button>
  );
}

export function BikePhotoGallery({ bikeId, bikeName, photos }: BikePhotoGalleryProps) {
  const { messages } = useDashboardMessages();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const createPhoto = useMutation(api.bikePhotos.mutations.create);
  const updatePhoto = useMutation(api.bikePhotos.mutations.update);
  const removePhoto = useMutation(api.bikePhotos.mutations.remove);
  const [optimisticPhotos, setOptimisticPhotos] = useState<BikePhotoItem[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isPrimaryPending, setIsPrimaryPending] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const visiblePhotos = optimisticPhotos ?? photos;
  const selectedPhoto =
    visiblePhotos.find((photo) => photo.id === selectedId) ?? visiblePhotos[0] ?? null;
  const selectedPhotoUrl = useResolvedImageUrl(selectedPhoto?.storageId);
  const selectedIndex = selectedPhoto
    ? visiblePhotos.findIndex((photo) => photo.id === selectedPhoto.id)
    : -1;

  useEffect(() => {
    setOptimisticPhotos(null);
  }, [photos]);

  useEffect(() => {
    setSelectedId((current) => {
      if (current && visiblePhotos.some((photo) => photo.id === current)) {
        return current;
      }
      return visiblePhotos[0]?.id ?? null;
    });
  }, [visiblePhotos]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const { uploadImage, isUploading, error, clearError } = useImageUpload(
    async ({ storageId, url }) => {
      const photoId = await createPhoto({ bikeId, storageId });
      setOptimisticPhotos((current) => {
        const next = current ?? photos;
        return [
          {
            id: String(photoId),
            storageId,
            caption: undefined,
            isPrimary: next.length === 0,
            isLegacy: false,
          },
          ...next.map((photo, index) =>
            next.length === 0
              ? { ...photo, isPrimary: index === 0 ? false : photo.isPrimary }
              : photo
          ),
        ];
      });
      if (url) {
        setSelectedId(String(photoId));
      }
      toast.success({ description: messages.common.toasts.bikePhotoAdded });
    }
  );

  const galleryError = actionError ?? error;
  const emptyState = useMemo(
    () => (
      <div className="flex aspect-video flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[color:var(--border)] bg-[color:var(--secondary)]/25 px-6 text-center">
        <p className="text-sm font-semibold text-[color:var(--foreground)]">
          {messages.bikes.gallery.emptyTitle}
        </p>
        <p className="mt-2 max-w-md text-sm text-[color:var(--muted-foreground)]">
          {messages.bikes.gallery.emptyDescription}
        </p>
        <Button className="mt-4" size="sm" onClick={() => fileInputRef.current?.click()}>
          {messages.bikes.gallery.upload}
        </Button>
      </div>
    ),
    [messages.bikes.gallery.emptyDescription, messages.bikes.gallery.emptyTitle, messages.bikes.gallery.upload]
  );

  async function handleRemove() {
    if (!selectedPhoto || selectedPhoto.isLegacy) {
      return;
    }

    setActionError(null);
    setIsRemoving(true);
    try {
      await removePhoto({ photoId: selectedPhoto.id as Id<"bikePhotos"> });
      setOptimisticPhotos((current) =>
        (current ?? photos).filter((photo) => photo.id !== selectedPhoto.id)
      );
      toast.success({ description: messages.common.toasts.bikePhotoRemoved });
    } catch (removeError) {
      console.error("Failed to remove bike photo:", removeError);
      setActionError(messages.bikes.photo.error);
    } finally {
      setIsRemoving(false);
    }
  }

  async function handleSetPrimary() {
    if (!selectedPhoto || selectedPhoto.isLegacy || selectedPhoto.isPrimary) {
      return;
    }

    setActionError(null);
    setIsPrimaryPending(true);
    try {
      await updatePhoto({
        photoId: selectedPhoto.id as Id<"bikePhotos">,
        isPrimary: true,
      });
      setOptimisticPhotos((current) =>
        (current ?? photos).map((photo) => ({
          ...photo,
          isPrimary: photo.id === selectedPhoto.id,
        }))
      );
      toast.success({
        description: messages.common.toasts.bikePhotoPrimaryUpdated,
      });
    } catch (primaryError) {
      console.error("Failed to set primary bike photo:", primaryError);
      setActionError(messages.bikes.photo.error);
    } finally {
      setIsPrimaryPending(false);
    }
  }

  function selectRelativePhoto(direction: "previous" | "next") {
    if (visiblePhotos.length <= 1 || selectedIndex < 0) {
      return;
    }

    const nextIndex =
      direction === "previous"
        ? (selectedIndex - 1 + visiblePhotos.length) % visiblePhotos.length
        : (selectedIndex + 1) % visiblePhotos.length;

    setSelectedId(visiblePhotos[nextIndex]?.id ?? null);
  }

  return (
    <div className="space-y-4">
      {selectedPhoto ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-[color:var(--foreground)]">
              {formatBikePhotoCount({
                count: visiblePhotos.length,
                oneLabel: messages.bikes.gallery.countOne,
                manyLabel: messages.bikes.gallery.countMany,
              })}
            </p>
            <p className="text-xs text-[color:var(--muted-foreground)]">
              {messages.bikes.gallery.help}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            aria-label={messages.bikes.gallery.openLightbox}
            className="group relative block w-full overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/25 text-left"
          >
            {selectedPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedPhotoUrl}
                alt={getBikePhotoAltText({
                  bikeName,
                  index: selectedIndex + 1,
                  total: visiblePhotos.length,
                })}
                className="aspect-video w-full object-cover transition duration-300 group-hover:scale-[1.01]"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center text-[color:var(--muted-foreground)]">
                <Camera className="h-8 w-8" />
              </div>
            )}
            <span className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/55 via-black/0 to-black/0 px-4 py-4 text-white opacity-100 transition">
              <span className="text-sm font-medium">
                {getBikePhotoAltText({
                  bikeName,
                  index: selectedIndex + 1,
                  total: visiblePhotos.length,
                })}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                <Maximize2 className="h-3.5 w-3.5" />
                {messages.bikes.gallery.openLightbox}
              </span>
            </span>
          </button>
          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isUploading}
            >
              {messages.bikes.gallery.upload}
            </Button>
            {!selectedPhoto.isLegacy && !selectedPhoto.isPrimary ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleSetPrimary()}
                isLoading={isPrimaryPending}
              >
                {messages.bikes.gallery.setPrimary}
              </Button>
            ) : null}
            {!selectedPhoto.isLegacy ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleRemove()}
                isLoading={isRemoving}
              >
                <Trash2 className="h-4 w-4" />
                {messages.bikes.gallery.remove}
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        emptyState
      )}

      {visiblePhotos.length > 0 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {visiblePhotos.map((photo, index) => (
            <BikePhotoThumbnail
              key={photo.id}
              bikeName={bikeName}
              photo={photo}
              photoIndex={index}
              totalPhotos={visiblePhotos.length}
              isSelected={photo.id === selectedPhoto?.id}
              onSelect={() => setSelectedId(photo.id)}
            />
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex aspect-square items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[color:var(--border)] text-[color:var(--muted-foreground)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </button>
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) {
            return;
          }
          clearError();
          setActionError(null);
          if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
          }
          previewUrlRef.current = URL.createObjectURL(file);
          void uploadImage(file);
          event.target.value = "";
        }}
      />

      {galleryError ? (
        <p className="text-xs text-[color:var(--destructive)]">
          {galleryError === "file_too_large"
            ? messages.profile.photo.fileTooLarge
            : galleryError === "invalid_type"
              ? messages.profile.photo.invalidType
              : messages.bikes.photo.error}
        </p>
      ) : null}

      <Dialog
        open={isLightboxOpen && Boolean(selectedPhoto)}
        onOpenChange={(nextOpen) => {
          setIsLightboxOpen(nextOpen);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="flex h-[min(92vh,980px)] w-[min(96vw,1320px)] max-w-none flex-col gap-4 overflow-hidden rounded-[var(--radius-2xl)] border border-white/10 bg-black/95 p-0 text-white"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <DialogTitle className="text-lg font-semibold text-white">
                {bikeName}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-white/65">
                {selectedIndex >= 0
                  ? getBikePhotoAltText({
                      bikeName,
                      index: selectedIndex + 1,
                      total: visiblePhotos.length,
                    })
                  : ""}
              </DialogDescription>
            </div>
            <DialogClose
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 rounded-full border border-white/10 bg-white/5 px-0 text-white hover:bg-white/10"
                  aria-label={messages.bikes.gallery.closeLightbox}
                />
              }
            >
              <XIcon className="h-4 w-4" />
            </DialogClose>
          </div>

          <div className="grid flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="relative flex min-h-[360px] items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0))] px-4 py-4 sm:px-6">
              {selectedPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedPhotoUrl}
                  alt={
                    selectedIndex >= 0
                      ? getBikePhotoAltText({
                          bikeName,
                          index: selectedIndex + 1,
                          total: visiblePhotos.length,
                        })
                      : bikeName
                  }
                  className="max-h-full w-auto max-w-full rounded-[var(--radius-xl)] object-contain shadow-2xl"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-white/15 text-white/60">
                  <Camera className="h-10 w-10" />
                </div>
              )}

              {visiblePhotos.length > 1 ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => selectRelativePhoto("previous")}
                    className="absolute left-4 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full border-white/10 bg-black/40 text-white hover:bg-black/60"
                    aria-label={messages.bikes.gallery.previousPhoto}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => selectRelativePhoto("next")}
                    className="absolute right-4 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full border-white/10 bg-black/40 text-white hover:bg-black/60"
                    aria-label={messages.bikes.gallery.nextPhoto}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              ) : null}
            </div>

            <div className="border-t border-white/10 bg-white/4 p-4 lg:border-l lg:border-t-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                {formatBikePhotoCount({
                  count: visiblePhotos.length,
                  oneLabel: messages.bikes.gallery.countOne,
                  manyLabel: messages.bikes.gallery.countMany,
                })}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3 lg:grid-cols-2">
                {visiblePhotos.map((photo, index) => (
                  <BikePhotoThumbnail
                    key={`lightbox-${photo.id}`}
                    bikeName={bikeName}
                    photo={photo}
                    photoIndex={index}
                    totalPhotos={visiblePhotos.length}
                    isSelected={photo.id === selectedPhoto?.id}
                    onSelect={() => setSelectedId(photo.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
