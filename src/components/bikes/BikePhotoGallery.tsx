"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { Camera, Loader2, Star, Trash2 } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { Button, useToast } from "@/components/ui";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useResolvedImageUrl } from "@/hooks/useResolvedImageUrl";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { cn } from "@/utils/cn";

type BikePhotoItem = {
  id: string;
  storageId: string;
  caption?: string;
  isPrimary: boolean;
  isLegacy: boolean;
};

interface BikePhotoGalleryProps {
  bikeId: Id<"bikes">;
  photos: BikePhotoItem[];
}

function BikePhotoThumbnail({
  photo,
  isSelected,
  onSelect,
}: {
  photo: BikePhotoItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { messages } = useDashboardMessages();
  const imageUrl = useResolvedImageUrl(photo.storageId);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative aspect-square overflow-hidden rounded-[var(--radius-md)] border transition",
        isSelected
          ? "border-[color:var(--primary)] ring-2 ring-[color:var(--primary)]/20"
          : "border-[color:var(--border)]"
      )}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
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

export function BikePhotoGallery({ bikeId, photos }: BikePhotoGalleryProps) {
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

  const visiblePhotos = optimisticPhotos ?? photos;
  const selectedPhoto =
    visiblePhotos.find((photo) => photo.id === selectedId) ?? visiblePhotos[0] ?? null;
  const selectedPhotoUrl = useResolvedImageUrl(selectedPhoto?.storageId);

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

  return (
    <div className="space-y-4">
      {selectedPhoto ? (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/25">
            {selectedPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedPhotoUrl}
                alt={messages.bikes.gallery.title}
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center text-[color:var(--muted-foreground)]">
                <Camera className="h-8 w-8" />
              </div>
            )}
          </div>
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
          {visiblePhotos.map((photo) => (
            <BikePhotoThumbnail
              key={photo.id}
              photo={photo}
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
    </div>
  );
}
