"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { Camera, Loader2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useResolvedImageUrl } from "@/hooks/useResolvedImageUrl";
import { cn } from "@/utils/cn";

type ProfilePhotoUploadProps = {
  storageId?: string;
  size?: "sidebar" | "settings" | "hero";
};

export function ProfilePhotoUpload({
  storageId,
  size = "sidebar",
}: ProfilePhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const { messages } = useDashboardMessages();
  const updateProfile = useMutation(api.users.mutations.updateProfile);
  const resolvedUrl = useResolvedImageUrl(storageId);
  const [optimisticUrl, setOptimisticUrl] = useState<string | null>(null);

  const { uploadImage, isUploading, error, clearError } = useImageUpload(
    async ({ storageId: nextStorageId, url }) => {
      setOptimisticUrl(url);
      await updateProfile({ profile_image_url: nextStorageId });
    }
  );
  const displayUrl = resolvedUrl ?? optimisticUrl;

  const sizeClasses = useMemo(() => {
    switch (size) {
      case "hero":
        return "h-20 w-20";
      case "settings":
        return "h-16 w-16";
      default:
        return "h-10 w-10";
    }
  }, [size]);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "group relative overflow-hidden rounded-full border border-[color:var(--border)] bg-[color:var(--secondary)]",
          sizeClasses
        )}
        aria-label={messages.profile.photo.upload}
      >
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
            alt={messages.profile.photo.upload}
            className="h-full w-full object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/default-profile.svg"
            alt={messages.profile.photo.upload}
            className="h-full w-full object-cover"
          />
        )}

        <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/45 group-hover:opacity-100">
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
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
          if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
          }
          previewUrlRef.current = URL.createObjectURL(file);
          setOptimisticUrl(previewUrlRef.current);
          void uploadImage(file);
          event.target.value = "";
        }}
      />

      {error ? (
        <p className="max-w-48 text-xs text-red-600">
          {error === "file_too_large"
            ? messages.profile.photo.fileTooLarge
            : error === "invalid_type"
              ? messages.profile.photo.invalidType
              : messages.profile.photo.error}
        </p>
      ) : null}
    </div>
  );
}
