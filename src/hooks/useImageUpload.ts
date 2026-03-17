"use client";

import { useState } from "react";
import { useConvex, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function useImageUpload(
  onComplete: (payload: { storageId: string; url: string | null }) => Promise<void> | void
) {
  const convex = useConvex();
  const generateUploadUrl = useMutation(api.files.actions.generateUploadUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("invalid_type");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("file_too_large");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const postUrl = await generateUploadUrl({});
      const response = await fetch(postUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error("upload_failed");
      }

      const { storageId } = (await response.json()) as { storageId: string };
      const url = await convex.query(api.files.actions.getUrl, { storageId });
      await onComplete({ storageId, url });
    } catch (uploadError) {
      console.error("Image upload failed:", uploadError);
      setError("upload_failed");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
    error,
    clearError: () => setError(null),
  };
}
