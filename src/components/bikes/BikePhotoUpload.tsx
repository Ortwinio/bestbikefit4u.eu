"use client";

import { useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { Bike, Camera, Loader2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { useImageUpload } from "@/hooks/useImageUpload";

type BikePhotoUploadProps = {
  bikeId: Id<"bikes">;
  currentPhotoStorageId?: string;
};

export function BikePhotoUpload({
  bikeId,
  currentPhotoStorageId,
}: BikePhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { messages } = useDashboardMessages();
  const updateBike = useMutation(api.bikes.mutations.update);
  const imageUrl = useQuery(
    api.files.actions.getUrl,
    currentPhotoStorageId ? { storageId: currentPhotoStorageId } : "skip"
  );

  const { uploadImage, isUploading, error, clearError } = useImageUpload(
    async ({ storageId }) => {
      await updateBike({ bikeId, photoUrl: storageId });
    }
  );

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]"
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={messages.bikes.photo.edit} className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2 text-[color:var(--muted-foreground)]">
            <Bike className="h-8 w-8" />
            <span className="text-sm font-medium">{messages.bikes.photo.add}</span>
          </span>
        )}

        <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/45 group-hover:opacity-100">
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
        </span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          clearError();
          void uploadImage(file);
          event.target.value = "";
        }}
      />

      {error ? (
        <p className="text-xs text-red-600">
          {error === "file_too_large"
            ? messages.profile.photo.fileTooLarge
            : error === "invalid_type"
              ? messages.profile.photo.invalidType
              : messages.bikes.photo.error}
        </p>
      ) : null}
    </div>
  );
}
